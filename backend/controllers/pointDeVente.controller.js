// controllers/pointDeVente.controller.js
const PointDeVente = require('../models/pointDeVente.model');

// 🟢 Récupérer tous les points de vente
exports.getAllPointsDeVente = async (req, res) => {
    try {
        const points = await PointDeVente.find();
        res.status(200).json(points);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Récupérer un point de vente par ID
exports.getPointDeVenteById = async (req, res) => {
    try {
        const point = await PointDeVente.findById(req.params.id);
        if (!point) return res.status(404).json({ message: 'Point de vente non trouvé' });
        res.status(200).json(point);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Créer un nouveau point de vente
exports.createPointDeVente = async (req, res) => {
    try {
        const newPoint = new PointDeVente(req.body);
        const savedPoint = await newPoint.save();
        res.status(201).json(savedPoint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 🟢 Mettre à jour un point de vente
exports.updatePointDeVente = async (req, res) => {
    try {
        const updatedPoint = await PointDeVente.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedPoint) return res.status(404).json({ message: 'Point de vente non trouvé' });
        res.status(200).json(updatedPoint);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 🟢 Supprimer un point de vente
exports.deletePointDeVente = async (req, res) => {
    try {
        const deletedPoint = await PointDeVente.findByIdAndDelete(req.params.id);
        if (!deletedPoint) return res.status(404).json({ message: 'Point de vente non trouvé' });
        res.status(200).json({ message: 'Point de vente supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};