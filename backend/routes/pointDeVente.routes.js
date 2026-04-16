// routes/pointDeVente.routes.js
const express = require('express');
const router = express.Router();
const pointDeVenteController = require('../controllers/pointDeVente.controller');

// Routes CRUD
router.get('/', pointDeVenteController.getAllPointsDeVente);        // GET all
router.get('/:id', pointDeVenteController.getPointDeVenteById);    // GET by ID
router.post('/', pointDeVenteController.createPointDeVente);       // POST create
router.put('/:id', pointDeVenteController.updatePointDeVente);     // PUT update
router.delete('/:id', pointDeVenteController.deletePointDeVente);  // DELETE delete

module.exports = router;