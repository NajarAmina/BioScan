require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');

// Aligné sur le proxy CRA (package.json → http://localhost:5000)
const port = process.env.PORT || 5000;
const httpServer = http.createServer(app);
initSocket(httpServer);

// ✅ On attend MongoDB AVANT d'écouter les requêtes
(async () => {
    try {
        await connectDB();
        console.log('✅ Connecté à MongoDB');
        httpServer.listen(port, () =>
            console.log(`✅ Serveur démarré sur http://localhost:${port}`)
        );
    } catch (err) {
        console.error('⚠️ MongoDB indisponible:', err.message || err);
        process.exit(1);
    }
})();