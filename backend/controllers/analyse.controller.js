const Analyse = require('../models/analyse.model');
const { spawn } = require('child_process');
const path = require('path');
const { analyzeIngredientsWithGemini } = require('../services/llmAnalyzer');

// ─── Appel Python ML ─────────────────────────────────────────────────────────
// Le frontend envoie uniquement : { ingredients_text, nova_group?, nutriscore_num? }
// Python (predictor.py) calcule TOUTES les features automatiquement.

function getMLPredictions(payload) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'predictor.py');
    const pythonBin = process.env.PYTHON_BIN || 'python';
    const py = spawn(pythonBin, [scriptPath]);

    let stdout = '';
    let stderr = '';

    // On n'envoie que le payload minimal — Python calcule le reste
    py.stdin.write(JSON.stringify({
      ingredients_text: payload.ingredients_text || '',
      nova_group: payload.nova_group || null,
      nutriscore_num: payload.nutriscore_num || null,
    }));
    py.stdin.end();

    py.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    py.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    py.on('close', (code) => {
      if (stderr) console.warn('⚠️ Python stderr:', stderr.trim());
      try {
        const jsonStart = stdout.indexOf('{');
        const clean = jsonStart !== -1 ? stdout.slice(jsonStart) : stdout;
        const result = JSON.parse(clean.trim());
        if (result.error) {
          return reject(new Error(result.error));
        }
        resolve(result.predictions || {});
      } catch (e) {
        reject(new Error('Invalid Python response'));
      }
    });

    py.on('error', (err) => reject(err));

    // Timeout protection
    setTimeout(() => {
      try { py.kill(); } catch (_) {}
    }, 10000);
  });
}

// ─── Endpoint principal : LLM + ML fusionné ─────────────────────────────────
// Utilisé par Home.jsx (consommateur) ET AiAnalysisTab.jsx (agent)
// Payload attendu : { ingredients_text, nova_group?, nutriscore_num? }

exports.predictIngredientsWithLLM = async (req, res) => {
  try {
    const { ingredients_text } = req.body;
    if (!ingredients_text || !ingredients_text.trim()) {
      return res.status(400).json({ message: 'ingredients_text requis' });
    }

    console.log('🔄 Démarrage de l\'analyse combinée...');
    console.log('📝 Texte reçu :', ingredients_text.slice(0, 100));

    // 1. Appel LLM (Groq/Llama)
    let llmAnalysis = null;
    try {
      console.log('🤖 Analyse LLM en cours...');
      llmAnalysis = await analyzeIngredientsWithGemini(ingredients_text);
    } catch (e) {
      console.warn('⚠️ LLM ignoré :', e.message);
    }

    // 2. Appel ML Python (features auto-calculées par predictor.py)
    let mlPredictions = {};
    try {
      console.log('📊 Analyse ML en cours...');
      mlPredictions = await getMLPredictions({
        ingredients_text,
        nova_group: req.body.nova_group || null,
        nutriscore_num: req.body.nutriscore_num || null,
      });
      console.log('✅ ML predictions:', JSON.stringify(mlPredictions));
    } catch (e) {
      console.warn('⚠️ ML ignoré :', e.message);
    }

    // 3. Fusion : ML est prioritaire, LLM enrichit
    const basePredictions = llmAnalysis ? {
      nova_group: llmAnalysis.nova_group,
      cardio_risk: llmAnalysis.cardio_risk,
      diabetes_risk: llmAnalysis.diabetes_risk,
      additive_exposure: llmAnalysis.additive_exposure,
    } : {};

    return res.status(200).json({
      success: true,
      predictions: {
        ...basePredictions,
        ...mlPredictions,          // ML override le LLM si disponible
        llm: llmAnalysis || null,  // LLM complet pour affichage détaillé
      }
    });
  } catch (error) {
    console.error('❌ predictIngredientsWithLLM:', error.message);
    res.status(500).json({ message: 'Erreur analyse', detail: error.message });
  }
};

// ─── Endpoint ML seul (sans LLM) ────────────────────────────────────────────
// Payload attendu : { ingredients_text, nova_group?, nutriscore_num? }

exports.predictProduct = async (req, res) => {
  try {
    const { ingredients_text } = req.body;
    if (!ingredients_text || !ingredients_text.trim()) {
      return res.status(400).json({ message: 'ingredients_text requis' });
    }

    const predictions = await getMLPredictions({
      ingredients_text,
      nova_group: req.body.nova_group || null,
      nutriscore_num: req.body.nutriscore_num || null,
    });

    return res.status(200).json({ success: true, predictions });
  } catch (error) {
    console.error('❌ predictProduct:', error.message);
    res.status(500).json({ message: 'Prediction failed', error: error.message });
  }
};

// ─── Analyse unitaire ingrédient (LLM seul) ─────────────────────────────────

exports.analyzeSingleIngredientLLM = async (req, res) => {
  try {
    const { nom } = req.body;
    const result = await analyzeIngredientsWithGemini(nom);
    res.status(200).json({ success: true, analysis: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, detail: error.message });
  }
};

// ─── CRUD Opérations ─────────────────────────────────────────────────────────

exports.createAnalyse = async (req, res) => {
  try {
    const analyse = new Analyse({
      id_analyse: req.body.id_analyse,
      produit: req.body.produit
    });
    const savedAnalyse = await analyse.save();
    res.status(201).json(savedAnalyse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAnalyses = async (req, res) => {
  try {
    const analyses = await Analyse.find().populate('produit');
    res.status(200).json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnalyseById = async (req, res) => {
  try {
    const analyse = await Analyse.findById(req.params.id).populate('produit');
    if (!analyse) return res.status(404).json({ message: "Analyse non trouvée" });
    res.status(200).json(analyse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAnalyse = async (req, res) => {
  try {
    const analyse = await Analyse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!analyse) return res.status(404).json({ message: "Analyse non trouvée" });
    res.status(200).json(analyse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAnalyse = async (req, res) => {
  try {
    const analyse = await Analyse.findByIdAndDelete(req.params.id);
    if (!analyse) return res.status(404).json({ message: "Analyse non trouvée" });
    res.status(200).json({ message: "Analyse supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};