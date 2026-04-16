require('dotenv').config();
const { analyzeIngredientsWithGemini } = require('./services/llmAnalyzer');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("✅ Modèles disponibles pour votre clé API :");
    data.models?.forEach(model => console.log(`- ${model.name}`));
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des modèles :", err.message);
  }
}

(async () => {
  try {
    console.log("🔍 Vérification des modèles...");
    await listModels();
    
    console.log("\n🧪 Test d'Analyse avec Gemini 1.5 Flash...");
    const res = await analyzeIngredientsWithGemini('E120');
    console.log("SUCCESS:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("ERROR:", err.message);
  }
})();
