const { Server } = require('socket.io');

let io;

/**
 * Initialise Socket.io sur le serveur HTTP existant.
 * À appeler une seule fois depuis server.js.
 */
const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] Client connecté : ${socket.id}`);

        // Le frontend rejoint sa room personnelle dès la connexion
        // Le fournisseur envoie son userId au moment du connect
        socket.on('join', (userId) => {
            if (!userId) return;
            socket.join(String(userId));
            console.log(`[Socket] User ${userId} a rejoint sa room`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Client déconnecté : ${socket.id}`);
        });
    });

    return io;
};

/**
 * Envoie une notification en temps réel à un utilisateur spécifique.
 * À appeler depuis n'importe quel controller.
 *
 * @param {string} userId   - L'_id MongoDB du destinataire
 * @param {object} payload  - Les données à envoyer au frontend
 */
const emitNotification = (userId, payload) => {
    if (!io) {
        console.warn('[Socket] io non initialisé, notification temps réel ignorée');
        return;
    }
    io.to(String(userId)).emit('nouvelle-notification', payload);
};

module.exports = { initSocket, emitNotification };
