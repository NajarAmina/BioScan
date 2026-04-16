// models/pointDeVente.model.js
const mongoose = require('mongoose');

const favorisSchema = new mongoose.Schema({

    dateAjout: {
        type: Date,
        default: Date.now
    },

    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    produit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produit'
    }

});

module.exports = mongoose.model('Favoris', favorisSchema);
