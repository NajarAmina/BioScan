// models/analyse.model.js
const mongoose = require('mongoose');

const analyseSchema = new mongoose.Schema({

    produit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produit'
    }
});

module.exports = mongoose.model('Analyse', analyseSchema);
