const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({

    nom: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    estBio: {
        type: String
    }

});

module.exports = mongoose.model('Ingredient', ingredientSchema);