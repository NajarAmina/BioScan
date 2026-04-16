const express = require('express');
const router = express.Router();

const favorisController = require('../controllers/favoris.controller');


router.post('/', favorisController.addFavoris);

router.get('/', favorisController.getFavoris);

router.delete('/:id', favorisController.deleteFavoris);


module.exports = router;
