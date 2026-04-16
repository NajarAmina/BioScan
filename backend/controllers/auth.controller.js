const crypto = require('crypto');
const User = require('../models/user.model.js');
const generateToken = require('../utils/generateToken');
const { sendResetPasswordEmail } = require('../utils/sendEmail');
const { toBackendRole, toFrontendRole } = require('../utils/roleMap');

const publicUser = (user) => ({
    id: user._id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    role: toFrontendRole(user.role),
});

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Recherche insensible à la casse (emails déjà en base avec anciennes casses) */
const findUserByEmail = (normalizedEmail) =>
    User.findOne({ email: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i') });

// 👉 REGISTER
exports.register = async (req, res) => {
    try {
        console.log(req.body)
        const { nom, prenom, email, password, role } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const backendRole = toBackendRole(role);
        console.log("test 2", normalizedEmail)
        // Vérifier email déjà utilisé
        const userExists = await findUserByEmail(normalizedEmail);
        if (userExists) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        // Créer utilisateur
        const user = await User.create({
            nom,
            prenom,
            email: normalizedEmail,
            password,
            role: backendRole
        });
console.log("test 3",user);
        // Générer token
        const token = generateToken(user);
        res.status(201).json({
            message: "Inscription réussie",
            token,
            user: publicUser(user)
        });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};



// 👉 LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        // Trouver utilisateur
        const user = await findUserByEmail(normalizedEmail);
        if (!user) {
            return res.status(400).json({ message: "Email  incorrect" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "mot de passe incorrect" });
        }

        const token = generateToken(user);

        res.status(200).json({
            message: "Connexion réussie",
            token,
            user: publicUser(user)
        });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// 👉 Mot de passe oublié — envoie un lien par email
exports.forgotPassword = async (req, res) => {
    try {
        const emailRaw = String(req.body.email || '').trim();
        if (!emailRaw) {
            return res.status(400).json({ message: 'Email requis' });
        }
        const normalizedEmail = emailRaw.toLowerCase();

        const generic =
            'Si un compte existe pour cet email, vous recevrez un message avec un lien de réinitialisation.';

        const user = await findUserByEmail(normalizedEmail);
        if (!user) {
            return res.json({ message: generic });
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
        const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

        try {
            await sendResetPasswordEmail(user.email, resetUrl);
        } catch (err) {
            if (err.code === 'SMTP_NON_CONFIGURE') {
                console.error(
                    '[forgotPassword] SMTP non configuré. Lien de test (ne pas utiliser en production) :',
                    resetUrl
                );
                // Mode développement: on retourne le lien au lieu de planter.
                // En production, vous devez impérativement configurer le SMTP.
                return res.json({
                    message: generic,
                    resetUrl,
                    debug: true,
                });
            }
            console.error('[forgotPassword] Erreur envoi email:', err);
            return res.status(500).json({
                message: "Impossible d’envoyer l’email. Vérifiez la configuration SMTP.",
            });
        }

        res.json({ message: generic });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// 👉 Réinitialisation avec le token reçu par email
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ message: 'Token et mot de passe requis' });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
        }

        const hashedToken = crypto.createHash('sha256').update(String(token).trim()).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Lien invalide ou expiré. Demandez un nouveau lien.' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Mot de passe mis à jour. Vous pouvez vous connecter.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// 🟢 Obtenir le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 🟢 Mettre à jour le profil
exports.updateProfile = async (req, res) => {
    try {
        const { nom, prenom } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { nom, prenom },
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({ message: 'Profil mis à jour', user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};