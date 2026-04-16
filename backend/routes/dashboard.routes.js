const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth.middleware');
const permit = require('../middlewares/role.middleware');
const dashboardController = require('../controllers/dashboard.controller');

// Dashboard agent (stats personnalisées)
router.get('/agent', protect, permit('agent', 'agent_saisie'), dashboardController.getAgentDashboard);
router.get('/agent/ai-analysis', protect, permit('agent', 'agent_saisie'), dashboardController.getAgentAiAnalysis);

module.exports = router;

