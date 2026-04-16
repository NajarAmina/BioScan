const express = require('express');
const router = express.Router();

const historiqueController = require('../controllers/historique.controller');


router.post('/', historiqueController.createHistorique);

router.get('/', historiqueController.getAllHistoriques);

router.delete('/:id', historiqueController.deleteHistorique);


module.exports = router;
