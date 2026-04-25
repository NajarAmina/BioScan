// backend/controllers/historique.controller.js
const Historique = require('../models/historique.model');

// ✅ Ajouter consultation produit — mobile (userId + productId)
exports.createHistorique = async (req, res) => {
  try {
    const utilisateur = req.body.utilisateur || req.body.userId;
    const produit = req.body.produit || req.body.productId;

    if (!utilisateur || !produit)
      return res.status(400).json({ message: 'utilisateur et produit requis' });

    const historique = new Historique({ utilisateur, produit });
    const saved = await historique.save();
    const populated = await Historique.findById(saved._id).populate('produit');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Ajouter recherche textuelle — web (userId + query texte)
exports.createHistoriqueSearch = async (req, res) => {
  try {
    const { userId, query } = req.body;
    if (!userId || !query?.trim())
      return res.status(400).json({ message: 'userId et query requis' });

    const historique = new Historique({
      utilisateur: userId,
      query: query.trim(),
    });
    const saved = await historique.save();
    res.status(201).json({
      id: saved._id,
      query: saved.query,
      date: saved.dateConsultation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Tous les historiques — admin (route existante inchangée)
exports.getAllHistoriques = async (req, res) => {
  try {
    const historiques = await Historique.find()
      .populate('utilisateur')
      .populate('produit');
    res.json(historiques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Historique d'un utilisateur — web + mobile
exports.getHistoriqueByUser = async (req, res) => {
  try {
    const historiques = await Historique.find({ utilisateur: req.params.userId })
      .populate('produit')
      .sort({ dateConsultation: -1 })
      .limit(10);

    const result = historiques
      .map((h) => ({
        id: h._id,
        // ✅ query texte (web) OU nom du produit (mobile)
        query: h.query || h.produit?.nom || null,
        produit: h.produit || null,
        date: h.dateConsultation,
      }))
      .filter(h => h.query); // ✅ exclure les entrées sans texte affichable

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Supprimer un historique par _id — web + mobile
exports.deleteHistorique = async (req, res) => {
  try {
    await Historique.findByIdAndDelete(req.params.id);
    res.json({ message: 'Historique supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Supprimer tout l'historique d'un utilisateur — web + mobile
exports.deleteAllHistoriqueByUser = async (req, res) => {
  try {
    await Historique.deleteMany({ utilisateur: req.params.userId });
    res.json({ message: 'Historique supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
