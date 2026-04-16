const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const protect = require('../middlewares/auth.middleware');

router.get('/', protect, messageController.getMessages);
router.post('/', protect, messageController.createMessage);
router.put('/:id/read', protect, messageController.markAsRead);

module.exports = router;
