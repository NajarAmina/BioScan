const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    fromId: { type: String, required: true },
    fromRole: { type: String, required: false },
    fromName: { type: String, required: false },
    fromEmail: { type: String, required: false },
    toId: { type: String, default: null },
    toRole: { type: String, required: false },
    toEmail: { type: String, required: false },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    replyToId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
