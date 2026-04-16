const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const produitController = require('../controllers/produit.controller');

// Fonction pour sauvegarder l'image base64
const saveBase64Image = (base64String) => {
    // Vérifier si c'est du base64
    if (!base64String || !base64String.includes('base64,')) {
        return base64String; // Retourne tel quel si ce n'est pas du base64
    }

    // Extraire le type et les données
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return null;
    }

    const mimeType = matches[1];
    const data = matches[2];

    // Déterminer l'extension
    let extension = '.jpg';
    if (mimeType.includes('png')) extension = '.png';
    if (mimeType.includes('gif')) extension = '.gif';
    if (mimeType.includes('webp')) extension = '.webp';

    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Générer un nom unique
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    // Sauvegarder le fichier
    fs.writeFileSync(filePath, data, 'base64');

    // Retourner le chemin relatif
    return `/uploads/${fileName}`;
};

// Middleware pour traiter l'image avant la création
const processImage = (req, res, next) => {
    if (req.body.image && req.body.image.includes('base64,')) {
        const imagePath = saveBase64Image(req.body.image);
        if (imagePath) {
            req.body.image = imagePath;
        }
    }
    next();
};

// CRUD Produit avec traitement d'image
router.post('/', processImage, produitController.createProduit);
router.post('/pending', processImage, produitController.createPendingProduit);

// Les autres routes restent inchangées
router.get('/pending', produitController.getPendingProduits);
router.put('/:id/approve', produitController.approveProduit);
router.put('/:id/reject', produitController.rejectProduit);
router.get('/', produitController.getAllProduits);
router.get('/search', produitController.searchProduitsNLP);
router.post('/scan', produitController.scanProduitByBarcode);
router.get('/:id', produitController.getProduitById);
router.put('/:id', processImage, produitController.updateProduit);
router.delete('/:id', produitController.deleteProduit);

module.exports = router;