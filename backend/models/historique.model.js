const mongoose = require('mongoose');

const historiqueSchema = new mongoose.Schema({

    dateConsultation: {
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

module.exports = mongoose.model('Historique', historiqueSchema);
