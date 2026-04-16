const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth.middleware');
const analyseController = require('../controllers/analyse.controller');

// ─── ML PREDICTIONS ─────────────────────────────────────────────────────────
router.post('/predict', analyseController.predictProduct);

// ─── LLM ENRICHED PREDICTIONS ────────────────────────────────────────────────
router.post('/predict-ingredients-llm', analyseController.predictIngredientsWithLLM);

// ─── CRUD OPERATIONS ────────────────────────────────────────────────────────
router.post('/', analyseController.createAnalyse);
router.get('/', analyseController.getAllAnalyses);
router.get('/:id', analyseController.getAnalyseById);
router.put('/:id', analyseController.updateAnalyse);
router.delete('/:id', analyseController.deleteAnalyse);

module.exports = router;
