// backend/models/historique.model.js
const mongoose = require('mongoose');

const historiqueSchema = new mongoose.Schema({

  dateConsultation: {
    type: Date,
    default: Date.now,
  },

  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // ✅ Pour mobile — consultation d'un produit scanné
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    default: null,
  },

  // ✅ Pour web — recherche textuelle (nom ou code-barre tapé)
  query: {
    type: String,
    default: null,
  },

});

module.exports = mongoose.model('Historique', historiqueSchema);
