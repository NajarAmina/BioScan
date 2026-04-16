const express = require('express');
const cors = require('cors');
const path = require('path'); // ✅ AJOUTEZ CETTE LIGNE
const app = express();

// JSON parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ✅ AJOUTEZ CES LIGNES ICI (après CORS, avant les routes)
// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Si vos images sont dans un dossier 'public/uploads' :
// app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'backend', time: new Date().toISOString() });
});

// Logger simple
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes (le reste de votre code inchangé)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/produits', require('./routes/produit.routes'));
app.use('/api/ingredients', require('./routes/ingredient.routes'));
app.use('/api/pointDeVente', require('./routes/pointDeVente.routes'));
app.use('/api/analyses', require('./routes/analyse.routes'));
app.use('/api/commentaires', require('./routes/commentaire.routes'));
app.use('/api/historiques', require('./routes/historique.routes'));
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