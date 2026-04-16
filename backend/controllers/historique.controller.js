const Historique = require('../models/historique.model');


// ajouter consultation
exports.createHistorique = async (req, res) => {
    try {

        const historique = new Historique({
            id_historique: req.body.id_historique,
            utilisateur: req.body.utilisateur,
            produit: req.body.produit
        });

        const saved = await historique.save();

        res.status(201).json(saved);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// historique utilisateur
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


// supprimer historique
exports.deleteHistorique = async (req, res) => {
    try {

        await Historique.findByIdAndDelete(req.params.id);

        res.json({ message: "Historique supprimé" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
