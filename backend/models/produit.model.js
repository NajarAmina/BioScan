const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    marque: {
        type: String
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    code_barre: {
        type: String,
        unique: true,
        sparse: true
    },
    codeBarres: {
        type: String,
        unique: true,
        sparse: true
    },
    origine: {
        type: String
    },
    scoreBio: {
        type: Number,
        default: 0
    },
    risque: {
        type: String
    },
    nova_group: {
        type: Number,
        min: 1,
        max: 4,
        default: 1
    },
    ai_predictions: {
        type: Object,
        default: {}
    },

    // ✅ NOUVEAU : Localisation du point de vente principal
    localisation: {
        adresse: { type: String, default: '' },
        lat: { type: Number, default: null },
        lng: { type: Number, default: null }
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    validatedAt: {
        type: Date
    },

    ingredients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient'
    }],

    pointsDeVente: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PointDeVente'
    }]

}, { timestamps: true });
produitSchema.set('autoIndex', false);

module.exports = mongoose.model('Produit', produitSchema);
