const Message = require('../models/message.model');
const User = require('../models/user.model');

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages', error: err.message });
    }
};

exports.createMessage = async (req, res) => {
    try {
        const { toEmail, toId, ...rest } = req.body;
        let recipientId = toId;
        let recipientEmail = toEmail;
        let recipientRole = rest.toRole;

        // Si on cherche par email (nouveau message)
        if (toEmail) {
            const user = await User.findOne({ email: new RegExp(`^${toEmail}$`, 'i') });
            if (!user) {
                return res.status(404).json({ message: "Destinataire introuvable avec cet email." });
            }
            recipientId = user._id;
            recipientRole = user.role;
            recipientEmail = user.email;
        } 
        // Si on répond (on a déjà le toId)
        else if (toId) {
            const user = await User.findById(toId);
            if (user) {
                recipientEmail = user.email;
                recipientRole = user.role;
            }
        } else {
            return res.status(400).json({ message: "Veuillez spécifier l'email du destinataire." });
        }

        // Récupérer l'email de l'expéditeur (optionnel mais utile pour le frontend)
        const sender = await User.findById(req.user._id);

        const newMessage = new Message({
            ...rest,
            fromId: req.user._id,
            fromEmail: sender ? sender.email : null,
            toId: String(recipientId),
            toRole: recipientRole,
            toEmail: recipientEmail
        });

        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(400).json({ message: 'Erreur création message', error: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedMessage = await Message.findByIdAndUpdate(id, { read: true }, { new: true });
        if (!updatedMessage) {
            return res.status(404).json({ message: 'Message non trouvé' });
        }
        res.status(200).json(updatedMessage);
    } catch (err) {
        res.status(400).json({ message: 'Erreur mise à jour message', error: err.message });
    }
};
