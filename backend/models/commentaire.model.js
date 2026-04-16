const mongoose = require('mongoose');

const commentaireSchema = new mongoose.Schema({

    contenu: {
        type: String,
        required: true
    },

    note: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    },

    date: {
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

module.exports = mongoose.model('Commentaire', commentaireSchema);
