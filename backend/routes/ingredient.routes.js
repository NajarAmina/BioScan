const express = require('express');
const router = express.Router();

const ingredientController = require('../controllers/ingredient.controller');
const analyseController = require('../controllers/analyse.controller');
const protect = require('../middlewares/auth.middleware.js');


// CRUD Ingredient

router.post('/', ingredientController.createIngredient);

router.get('/', ingredientController.getAllIngredients);

router.get('/:id', ingredientController.getIngredientById);

router.put('/:id', ingredientController.updateIngredient);

router.delete('/:id', ingredientController.deleteIngredient);

// ─── LLM ANALYSIS ────────────────────────────────────────────────────────────

router.post('/analyze-llm', protect, analyseController.analyzeSingleIngredientLLM);


module.exports = router;
