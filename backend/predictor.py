import sys
import json
import os
import re

try:
    import joblib
    import pandas as pd

    # Patch for scikit-learn > 1.3 loading older models
    import sklearn.ensemble
    try:
        import sklearn.ensemble._gb_losses
    except ImportError:
        import types
        dummy_gb_losses = types.ModuleType("sklearn.ensemble._gb_losses")

        class DummyLoss: pass
        dummy_gb_losses.BinomialDeviance = DummyLoss
        dummy_gb_losses.MultinomialDeviance = DummyLoss
        dummy_gb_losses.LossFunction = DummyLoss
        dummy_gb_losses.LeastSquaresError = DummyLoss
        dummy_gb_losses.LeastAbsoluteError = DummyLoss
        dummy_gb_losses.HuberLossFunction = DummyLoss
        dummy_gb_losses.QuantileLossFunction = DummyLoss

        sys.modules["sklearn.ensemble._gb_losses"] = dummy_gb_losses
        sklearn.ensemble._gb_losses = dummy_gb_losses

except ImportError as e:
    print(json.dumps({"error": f"Missing library: {str(e)}"}))
    sys.exit(1)


# ─── FEATURE ENGINEERING AUTOMATIQUE ──────────────────────────────────────────
# Toutes les features sont calculées ici à partir de ingredients_text,
# nova_group et nutriscore_num. Le frontend n'envoie que ces 3 champs.

def build_features(data):
    """
    Construit les 9 features attendues par les modèles à partir du payload minimal.
    Entrée attendue : { ingredients_text, nova_group (opt), nutriscore_num (opt) }
    """
    raw_text = str(data.get('ingredients_text', '') or '')
    lower_text = raw_text.lower()

    # Parser les ingrédients individuels (séparés par virgule, point-virgule ou saut de ligne)
    parts = [s.strip() for s in re.split(r'[,;\n]+', raw_text) if s.strip()]

    # ── Features numériques (calculées automatiquement) ──────────────────
    nb_ingredients = max(1, len(parts))

    # Détection conservateurs (regex élargi)
    contains_preservatives = 1 if re.search(
        r'conserv|benzo|sorb|nitrit|nitrate|e2[0-9]{2}', lower_text
    ) else 0

    # Détection colorants artificiels
    contains_artificial_colors = 1 if re.search(
        r'colorant|e1[0-4][0-9]|e150|e160|e170', lower_text
    ) else 0

    # Détection arômes
    contains_flavouring = 1 if re.search(
        r'ar[oô]me|flavour|flavor', lower_text
    ) else 0

    # Comptage des codes E (E100 à E1999)
    e_matches = re.findall(r'\be\d{3,4}\b', lower_text)
    nb_e_numbers = len(set(e_matches))

    # Longueur du texte d'ingrédients
    ingredients_length = len(raw_text)

    # ── NOVA group (envoyé par frontend ou estimé) ───────────────────────
    nova_group = data.get('nova_group')
    if nova_group is None or nova_group == '':
        # Estimation heuristique si non fourni
        if nb_ingredients > 5 or nb_e_numbers > 0 or contains_preservatives or contains_artificial_colors or contains_flavouring:
            nova_group = 4
        elif re.search(r'sucre|sel|huile', lower_text):
            nova_group = 3
        elif nb_ingredients > 1:
            nova_group = 2
        else:
            nova_group = 1
    nova_group = float(max(1, min(4, int(nova_group))))

    # ── Nutriscore (envoyé par frontend ou estimé) ───────────────────────
    nutriscore_num = data.get('nutriscore_num')
    if nutriscore_num is None or nutriscore_num == '':
        nutriscore_num = 0
        if re.search(r'sucre|sirop|miel|glucose|fructose', lower_text):
            nutriscore_num += 3
        if re.search(r'huile|beurre|graisse|gras', lower_text):
            nutriscore_num += 2
        if re.search(r'sel|sodium', lower_text):
            nutriscore_num += 2
        if re.search(r'fruit|légume|fibre', lower_text):
            nutriscore_num -= 1
        nutriscore_num = max(1, min(5, nutriscore_num + 1))
    nutriscore_num = float(max(1, min(5, int(nutriscore_num))))

    return {
        'nb_ingredients': float(nb_ingredients),
        'contains_preservatives': float(contains_preservatives),
        'contains_artificial_colors': float(contains_artificial_colors),
        'contains_flavouring': float(contains_flavouring),
        'nova_group': nova_group,
        'nutriscore_num': nutriscore_num,
        'nb_e_numbers': float(nb_e_numbers),
        'ingredients_length': float(ingredients_length),
        'ingredients_text': raw_text,
    }


# ─── MOCK PREDICTIONS (fallback si modèle absent ou erreur) ──────────────────

def get_mock_prediction(key, features):
    nova = features.get('nova_group', 1)
    nutri = features.get('nutriscore_num', 1)
    e_nums = features.get('nb_e_numbers', 0)

    if key == 'bioscore':
        return int(max(0, min(100, 100 - (nova * 10) - (e_nums * 5) - (nutri * 2))))

    if key == 'cardio_risk':
        risk_score = nutri + (nova * 2) + (e_nums * 1.5)
        return 1 if risk_score >= 10 else 0

    if key == 'cardio_risk_proba':
        risk_score = nutri + (nova * 2) + (e_nums * 1.5)
        return min(98.0, max(5.0, risk_score * 4.5 + 10))

    if key == 'diabetes_risk':
        sugar_indicator = nutri * 1.5 + (nova * 2)
        return 1 if sugar_indicator >= 10 else 0

    if key == 'diabetes_risk_proba':
        sugar_indicator = nutri * 1.5 + (nova * 2)
        return min(98.0, max(5.0, sugar_indicator * 4.5 + 10))

    if key == 'additive_exposure':
        # Retourne un % directement
        return min(95.0, max(3.0, e_nums * 18.0 + 5.0))

    return 0


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return

        data = json.loads(input_data)

        # ✅ FEATURE ENGINEERING AUTOMATIQUE (plus de dépendance au frontend)
        features = build_features(data)

        df = pd.DataFrame([features])

        models_dir = os.path.join(os.path.dirname(__file__), 'modelsIA')

        predictions = {}

        # ✅ UNIQUEMENT LES 4 MODÈLES
        model_files = {
            'bioscore': 'bioscore_model.joblib',
            'cardio_risk': 'cardio_risk_model.joblib',
            'diabetes_risk': 'diabetes_risk_model.joblib',
            'additive_exposure': 'additive_exposure_model.joblib',
        }

        for key, filename in model_files.items():
            filepath = os.path.join(models_dir, filename)
            if os.path.exists(filepath):
                try:
                    model = joblib.load(filepath)
                    pred = model.predict(df)[0]
                    if hasattr(pred, 'item'):
                        pred = pred.item()

                    # ── BioScore : régression [0-100] ────────────────────
                    if key == 'bioscore':
                        predictions[key] = int(max(0, min(100, round(pred))))

                    # ── Cardio / Diabetes : classification binaire 0/1 + proba ─
                    elif key in ('cardio_risk', 'diabetes_risk'):
                        predictions[key] = int(pred)
                        if hasattr(model, 'predict_proba'):
                            proba_array = model.predict_proba(df)[0]
                            classes = list(model.classes_)
                            pos_idx = classes.index(1) if 1 in classes else -1
                            proba = proba_array[pos_idx] if pos_idx >= 0 else max(proba_array)
                            predictions[f'{key}_proba'] = round(float(proba) * 100, 1)
                        else:
                            predictions[f'{key}_proba'] = get_mock_prediction(f'{key}_proba', features)

                    # ── Additive Exposure : régression [0-1] → % ─────────
                    elif key == 'additive_exposure':
                        val = float(max(0.0, min(1.0, pred)))
                        predictions[key] = round(val * 100, 1)

                except Exception as e:
                    sys.stderr.write(f"Exception for {filename}: {str(e)}\n")
                    predictions[key] = get_mock_prediction(key, features)
                    if key in ('cardio_risk', 'diabetes_risk'):
                        predictions[f'{key}_proba'] = round(get_mock_prediction(f'{key}_proba', features), 1)
            else:
                predictions[key] = get_mock_prediction(key, features)
                if key in ('cardio_risk', 'diabetes_risk'):
                    predictions[f'{key}_proba'] = round(get_mock_prediction(f'{key}_proba', features), 1)

        # ── NOVA group (passthrough) ─────────────────────────────────────
        predictions['nova_group'] = int(features['nova_group'])

        print(json.dumps({"success": True, "predictions": predictions}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()