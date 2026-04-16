// models/pointDeVente.model.js
const mongoose = require('mongoose');

const pointDeVenteSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true
    },
    adresse: {
        type: String,
        required: true,
        trim: true
    }
});

// Exporter le modèle
module.exports = mongoose.model('PointDeVente', pointDeVenteSchema);