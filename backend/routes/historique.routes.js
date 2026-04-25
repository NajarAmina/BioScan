const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/historique.controller');

router.post('/', ctrl.createHistorique);
router.get('/', ctrl.getAllHistoriques);

// ⚠️ ORDRE IMPORTANT — ces routes AVANT /:id
router.post('/search', ctrl.createHistoriqueSearch);
router.get('/user/:userId', ctrl.getHistoriqueByUser);
router.delete('/user/:userId/all', ctrl.deleteAllHistoriqueByUser);

// /:id en dernier
router.delete('/:id', ctrl.deleteHistorique);

module.exports = router;