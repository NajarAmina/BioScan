const Ingredient = require('../models/ingredient.model');

// Ajouter un ingrédient
exports.createIngredient = async (req, res) => {
    try {
        const ingredient = new Ingredient(req.body);
        const savedIngredient = await ingredient.save();
        res.status(201).json(savedIngredient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer tous les ingrédients
exports.getAllIngredients = async (req, res) => {
    try {
        const ingredients = await Ingredient.find();
        res.status(200).json(ingredients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer ingrédient par ID
exports.getIngredientById = async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient non trouvé" });
        }
        res.status(200).json(ingredient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Modifier ingrédient
exports.updateIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient non trouvé" });
        }
        res.status(200).json(ingredient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer ingrédient
exports.deleteIngredient = async (req, res) => {
    try {
        const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ message: "Ingredient non trouvé" });
        }
        res.status(200).json({ message: "Ingredient supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};