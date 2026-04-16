const isConfigured = () => !!process.env.GROQ_API_KEY;

/**
 * Analyse les ingrédients avec Groq (Modèle Llama 3)
 */
async function analyzeIngredientsWithGemini(ingredientsList, productDescription = '') {
  if (!isConfigured()) {
    throw new Error('GROQ_API_KEY manquante dans le fichier .env');
  }

  const prompt = `Tu es un expert en nutrition. Analyse ces ingrédients : ${ingredientsList}.
${productDescription ? 'Description: ' + productDescription : ''}

Retourne UNIQUEMENT un objet JSON VALIDE sans texte autour, sans markdown ni formatage avec ce format exact :
{
  "qualite_globale": "Excellente | Bonne | Modérée | Mauvaise",
  "nova_group": 1,
  "cardio_risk": "Faible | Moyen | Élevé",
  "diabetes_risk": "Faible | Moyen | Élevé",
  "additive_exposure": 0,
  "ultra_transforme": 0,
  "ingredients": [
    {
      "nom": "nom",
      "origine": "naturelle | synthétique",
      "categorie": "Colorant | Conservateur | Sucre | Sel | Huile | Autre",
      "nova": 1,
      "dangerosite": "Faible | Modérée | Élevée",
      "effets_secondaires": ["effet1"],
      "recommandations": [{"groupe": "sportifs", "texte": "conseil"}]
    }
  ]
}`;

  const maxRetries = 4;
  let attempt = 0;
  let delay = 2000;

  while (attempt < maxRetries) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      let responseText = data.choices[0]?.message?.content || "";

      // 🔹 Nettoyage robuste
      let cleaned = responseText
        .replace(/```json|```/gi, '')
        .trim();

      // 🔹 Extraire JSON
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Aucun JSON valide trouvé");

      cleaned = match[0];

      // 🔹 Parse JSON sécurisé
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (err) {
        throw new Error("Erreur parsing JSON: " + err.message);
      }

      const ingredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];

      return {
        qualite_globale: parsed.qualite_globale || calculateQualite(ingredients),
        nova_group: parsed.nova_group || calculateNova(ingredients),
        cardio_risk: parsed.cardio_risk || "Faible",
        diabetes_risk: parsed.diabetes_risk || "Faible",
        additive_exposure: parsed.additive_exposure ?? 0,
        ultra_transforme: parsed.ultra_transforme ?? 0,
        ingredients,
        resume_global: `Analyse de ${ingredients.length} ingrédients terminée.`
      };

    } catch (error) {
      const isTransient = /503|429|500|timeout|fetch|econnreset/i.test(error.message);

      if (isTransient && attempt < maxRetries - 1) {
        attempt++;
        console.warn(`⚠️ Retry ${attempt}/${maxRetries - 1} dans ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      } else {
        console.error('❌ Erreur Groq:', error.message);
        throw error;
      }
    }
  }
}

/**
 * Calcul qualité globale fallback
 */
function calculateQualite(ingredients) {
  if (!ingredients.length) return "Modérée";

  const highDanger = ingredients.filter(i => {
    const d = (i.dangerosite || "").toLowerCase();
    return d.includes("élev") || d.includes("high");
  }).length;

  if (highDanger > 2) return 'Mauvaise';
  if (highDanger > 0) return 'Modérée';

  return 'Excellente';
}

/**
 * Calcul NOVA fallback
 */
function calculateNova(ingredients) {
  if (!ingredients.length) return 1;

  const values = ingredients.map(i => Number(i.nova) || 1);
  return Math.min(Math.max(...values), 4);
}

module.exports = { analyzeIngredientsWithGemini, isConfigured };