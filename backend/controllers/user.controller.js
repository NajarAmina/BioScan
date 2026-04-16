const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// ✅ CORRECTION : accepte uniquement 'administrateur' (valeur réelle en base)
const isAdmin = (role) => role === 'administrateur' || role === 'admin';

// 🟢 Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🟢 Get one user by ID (admin or owner)
exports.getUserById = async (req, res) => {
    try {
        if (!isAdmin(req.user.role) && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🟢 Update user (admin or owner)
exports.updateUser = async (req, res) => {
    try {
        if (!isAdmin(req.user.role) && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const allowedUpdates = ['nom', 'prenom', 'email', 'adresse'];

        // Seul l'admin peut changer le rôle et le statut bloqué
        if (isAdmin(req.user.role)) {
            allowedUpdates.push('role', 'isBlocked');
        }

        const updates = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User updated', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 🟢 Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        if (!isAdmin(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🟢 Update password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Mot de passe actuel et nouveau requis' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
