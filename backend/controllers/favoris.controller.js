// backend/controllers/favoris.controller.js
const Favoris = require('../models/favoris.model');

// ✅ Ajouter favori — accepte { userId, productId } (mobile/web) OU { utilisateur, produit } (legacy)
exports.addFavoris = async (req, res) => {
  try {
    const utilisateur = req.body.utilisateur || req.body.userId;
    const produit = req.body.produit || req.body.productId;

    if (!utilisateur || !produit)
      return res.status(400).json({ message: 'utilisateur et produit requis' });

    // Éviter les doublons
    const exists = await Favoris.findOne({ utilisateur, produit });
    if (exists) {
      const populated = await Favoris.findById(exists._id).populate('produit');
      return res.status(200).json(populated.produit);
    }

    const favoris = new Favoris({ utilisateur, produit });
    const saved = await favoris.save();
    const populated = await Favoris.findById(saved._id).populate('produit');
    res.status(201).json(populated.produit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Tous les favoris — admin (route existante inchangée)
exports.getFavoris = async (req, res) => {
  try {
    const favoris = await Favoris.find()
      .populate('utilisateur')
      .populate('produit');
    res.json(favoris);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Favoris d'un utilisateur — web + mobile
exports.getFavorisByUser = async (req, res) => {
  try {
    const favoris = await Favoris.find({ utilisateur: req.params.userId })
      .populate('produit');
    res.json(favoris.map((f) => f.produit).filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Supprimer par _id du document Favoris — route existante inchangée
exports.deleteFavoris = async (req, res) => {
  try {
    await Favoris.findByIdAndDelete(req.params.id);
    res.json({ message: 'Favori supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Supprimer par userId + productId — web + mobile
exports.deleteFavorisByUser = async (req, res) => {
  try {
    await Favoris.findOneAndDelete({
      utilisateur: req.params.userId,
      produit: req.params.productId,
    });
    res.json({ message: 'Favori supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Supprimer tous les favoris d'un utilisateur — web + mobile
exports.deleteAllFavorisByUser = async (req, res) => {
  try {
    await Favoris.deleteMany({ utilisateur: req.params.userId });
    res.json({ message: 'Tous les favoris supprimés' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
