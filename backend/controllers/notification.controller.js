// controllers/notification.controller.js
const Notification = require('../models/notification.model');
const mongoose = require('mongoose');

// ─── Helper : convertit un recipientId string en ObjectId si valide ───────────
const toObjectId = (id) => {
    if (!id) return null;
    // Si c'est déjà un objet populé { _id, nom, ... }, on extrait _id
    if (typeof id === 'object' && id._id) return new mongoose.Types.ObjectId(String(id._id));
    const str = String(id);
    if (mongoose.Types.ObjectId.isValid(str)) return new mongoose.Types.ObjectId(str);
    return str; // fallback string (ne devrait pas arriver)
};

// 🟢 Créer une notification (appelé depuis ProductsTab via sendNotification)
exports.createNotification = async (req, res) => {
    try {
        const { recipientId, message, productName, agentName, date } = req.body;

        if (!recipientId || !message) {
            return res.status(400).json({ message: 'recipientId et message sont requis' });
        }

        // ✅ Conversion sécurisée de recipientId (objet populé ou string)
        const resolvedId = toObjectId(recipientId);
        if (!resolvedId) {
            return res.status(400).json({ message: 'recipientId invalide' });
        }

        const notification = new Notification({
            recipientId: resolvedId,
            message,
            productName: productName || '',
            agentName: agentName || '',
            read: false,
            // ✅ On accepte une date custom envoyée par le frontend, sinon timestamps auto
            ...(date ? { createdAt: new Date(date) } : {})
        });

        const saved = await notification.save();
        res.status(201).json(saved);

    } catch (error) {
        console.error('❌ createNotification:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Récupérer les notifications d'un fournisseur
exports.getNotifications = async (req, res) => {
    try {
        const { recipientId } = req.query;

        if (!recipientId) {
            return res.status(400).json({ message: 'recipientId est requis' });
        }

        // ✅ Conversion ObjectId pour que le find() fonctionne correctement
        const resolvedId = toObjectId(recipientId);
        if (!resolvedId) {
            return res.status(400).json({ message: 'recipientId invalide' });
        }

        const notifications = await Notification.find({ recipientId: resolvedId })
            .sort({ createdAt: -1 }); // Plus récentes en premier

        res.status(200).json(notifications);

    } catch (error) {
        console.error('❌ getNotifications:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Vérifie que l'id est un ObjectId valide avant la requête
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID de notification invalide' });
        }

        const notification = await Notification.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification non trouvée' });
        }

        res.status(200).json(notification);

    } catch (error) {
        console.error('❌ markAsRead:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
    try {
        const { recipientId } = req.query;

        if (!recipientId) {
            return res.status(400).json({ message: 'recipientId est requis' });
        }

        // ✅ Conversion ObjectId
        const resolvedId = toObjectId(recipientId);
        if (!resolvedId) {
            return res.status(400).json({ message: 'recipientId invalide' });
        }

        await Notification.updateMany(
            { recipientId: resolvedId, read: false },
            { read: true }
        );

        res.status(200).json({ message: 'Toutes les notifications marquées comme lues' });

    } catch (error) {
        console.error('❌ markAllAsRead:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// 🟢 Supprimer une notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Vérifie que l'id est valide
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID de notification invalide' });
        }

        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification non trouvée' });
        }

        res.status(200).json({ message: 'Notification supprimée' });

    } catch (error) {
        console.error('❌ deleteNotification:', error.message);
        res.status(500).json({ message: error.message });
    }
};
