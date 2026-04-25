const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// JSON parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ CORS corrigé — accepte le web (localhost:3000) ET le mobile (React Native)
app.use(
    cors({
        origin: (origin, callback) => {
            // Autorise : navigateur web, Expo Go, émulateur, vrai téléphone
            const allowed = [
                'http://localhost:3000',  // React web
                'http://localhost:8081',  // Expo web
                'http://localhost:19006', // Expo web (autre port)
            ];
            // Autorise si l'origine est dans la liste OU si pas d'origine (mobile natif)
            if (!origin || allowed.includes(origin) || origin.startsWith('http://192.168.') || origin.startsWith('http://10.')) {
                callback(null, true);
            } else {
                callback(null, true); // En développement : tout autoriser
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'backend', time: new Date().toISOString() });
});

// Logger simple
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/produits', require('./routes/produit.routes'));
app.use('/api/ingredients', require('./routes/ingredient.routes'));
app.use('/api/pointDeVente', require('./routes/pointDeVente.routes'));
app.use('/api/analyses', require('./routes/analyse.routes'));
app.use('/api/commentaires', require('./routes/commentaire.routes'));
app.use('/api/historiques', require('./routes/historique.routes'));
app.use('/api/historique', require('./routes/historique.routes'));
app.use('/api/favoris', require('./routes/favoris.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/chatbot', require('./routes/chatbot.routes'));

// Middleware global d'erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

module.exports = app;
