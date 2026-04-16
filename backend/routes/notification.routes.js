// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// GET  /api/notifications?recipientId=xxx         → toutes les notifs du fournisseur
router.get('/', notificationController.getNotifications);

// POST /api/notifications                         → créer une notification
router.post('/', notificationController.createNotification);

// ✅ CORRECTION CRITIQUE : /read-all DOIT être AVANT /:id/read
// Sinon Express interprète "read-all" comme un :id et n'appelle jamais markAllAsRead
router.put('/read-all', notificationController.markAllAsRead);

// PUT  /api/notifications/:id/read               → marquer une notif comme lue
router.put('/:id/read', notificationController.markAsRead);

// PUT  /api/notifications/read-all?recipientId=  → marquer toutes comme lues
router.put('/read-all', notificationController.markAllAsRead);

// DELETE /api/notifications/:id                  → supprimer une notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router
