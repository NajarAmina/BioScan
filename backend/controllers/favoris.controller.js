const Favoris = require('../models/favoris.model');


// ajouter favoris
exports.addFavoris = async (req, res) => {
    try {

        const favoris = new Favoris({
            id_favoris: req.body.id_favoris,
            utilisateur: req.body.utilisateur,
            produit: req.body.produit
        });

        const saved = await favoris.save();

        res.status(201).json(saved);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// tous les favoris
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


// supprimer favoris
exports.deleteFavoris = async (req, res) => {
    try {

        await Favoris.findByIdAndDelete(req.params.id);

        res.json({ message: "Favoris supprimé" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
