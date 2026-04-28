// backend/routes/favoris.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/favoris.controller');

// ✅ Routes existantes — inchangées (web legacy)
router.post('/', ctrl.addFavoris);
router.get('/', ctrl.getFavoris);
router.delete('/:id', ctrl.deleteFavoris);

// ✅ Nouvelles routes — web + mobile
router.get('/user/:userId', ctrl.getFavorisByUser);
router.delete('/user/:userId/all', ctrl.deleteAllFavorisByUser);
router.delete('/user/:userId/:productId', ctrl.deleteFavorisByUser);

module.exports = router;
