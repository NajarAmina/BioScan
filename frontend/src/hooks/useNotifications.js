// hooks/useNotifications.js
// Installe d'abord : npm install socket.io-client

import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket; // instance partagée (singleton)

export const useNotifications = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount]     = useState(0);

    useEffect(() => {
        if (!userId) return;

        // Crée la connexion une seule fois
        socket = io(SOCKET_URL, { withCredentials: true });

        // Rejoint la room personnelle du fournisseur
        socket.emit('join', userId);

        // Écoute les nouvelles notifications
        socket.on('nouvelle-notification', (notif) => {
            setNotifications((prev) => [notif, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, [userId]);

    // Marquer tout comme lu (à appeler quand le fournisseur ouvre le panneau)
    const markAllRead = useCallback(() => {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    return { notifications, unreadCount, markAllRead };
};
