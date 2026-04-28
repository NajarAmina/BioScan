import React, { useState, useEffect } from 'react';

const Notifications = ({ user }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const userId = user?.id || user?._id;

    useEffect(() => {
        if (userId) loadNotifications();
    }, [userId]);

    const loadNotifications = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/notifications?recipientId=${userId}`);
            const data = await res.json().catch(() => []);
            if (res.ok) setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur chargement notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
        } catch (err) {
            console.error('Erreur mark as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!userId) return;
        try {
            await fetch(`/api/notifications/read-all?recipientId=${userId}`, { method: 'PUT' });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Erreur mark all as read:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            console.error('Erreur suppression notification:', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (message = '') => {
        const icons = {
            '✅': {
                color: '#16a34a', bg: '#f0fdf4',
                svg: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                )
            },
            '✏️': {
                color: '#2563eb', bg: '#eff6ff',
                svg: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                )
            },
            '🗑️': {
                color: '#dc2626', bg: '#fef2f2',
                svg: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                )
            },
            '❌': {
                color: '#dc2626', bg: '#fef2f2',
                svg: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                )
            },
        };

        for (const [emoji, val] of Object.entries(icons)) {
            if (message.startsWith(emoji)) return { icon: val.svg, color: val.color, bg: val.bg };
        }

        return {
            color: '#d97706', bg: '#fffbeb',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            )
        };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        const diffH = Math.floor(diffMin / 60);
        const diffD = Math.floor(diffH / 24);

        if (diffMin < 1) return "À l'instant";
        if (diffMin < 60) return `Il y a ${diffMin} min`;
        if (diffH < 24) return `Il y a ${diffH}h`;
        if (diffD === 1) return 'Hier';
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    // SVG icons réutilisables
    const IconCheck = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    );

    const IconTrash = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    );

    const IconBox = () => (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5, verticalAlign: 'middle' }}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    );

    const IconAgent = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );

    return (
        <div style={S.page}>
            {/* En-tête */}
            <div style={S.header}>
                <div style={S.headerLeft}>
                    <h2 style={S.headerTitle}>Notifications</h2>
                    {unreadCount > 0 && (
                        <span style={S.headerBadge}>{unreadCount}</span>
                    )}
                </div>
                <div style={S.headerActions}>
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} style={S.btnMarkAll}>
                            Tout marquer lu
                        </button>
                    )}
                </div>
            </div>

            {/* Contenu */}
            {loading ? (
                <div style={S.center}>
                    <p style={S.loadingText}>Chargement...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div style={S.center}>
                    <div style={S.emptyIconWrap}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                    </div>
                    <p style={S.emptyText}>Aucune notification</p>
                    <p style={S.emptySubText}>Vous serez notifié lorsqu'un agent agit sur vos produits</p>
                </div>
            ) : (
                <div style={S.list}>
                    {notifications.map(n => {
                        const type = getIcon(n.message);
                        return (
                            <div
                                key={n._id}
                                style={{
                                    ...S.card,
                                    borderLeft: `4px solid ${type.color}`,
                                    backgroundColor: n.read ? '#fff' : '#FAFBFF',
                                    opacity: n.read ? 0.85 : 1
                                }}
                            >
                                {/* Icône type */}
                                <div style={{ ...S.iconBox, backgroundColor: type.bg, color: type.color }}>
                                    {type.icon}
                                </div>

                                {/* Contenu */}
                                <div style={S.cardBody}>
                                    {n.productName && (
                                        <p style={S.productName}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5, verticalAlign: 'middle', color: '#555' }}>
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                                <line x1="12" y1="22.08" x2="12" y2="12" />
                                            </svg>
                                            {n.productName}
                                        </p>
                                    )}
                                    <p style={S.message}>{n.message}</p>
                                    <div style={S.cardMeta}>
                                        {n.agentName && (
                                            <span style={S.agentName}>
                                                <IconAgent />
                                                {n.agentName}
                                            </span>
                                        )}
                                        <span style={S.date}>{formatDate(n.createdAt || n.date)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={S.cardActions}>
                                    {!n.read && (
                                        <button
                                            onClick={() => markAsRead(n._id)}
                                            style={S.btnRead}
                                            title="Marquer comme lu"
                                        >
                                            <IconCheck />
                                        </button>
                                    )}
                                    <button onClick={() => deleteNotification(n._id)} style={S.btnDelete} title="Supprimer">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                            <path d="M10 11v6M14 11v6" />
                                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Point non lu */}
                                {!n.read && <div style={S.unreadDot} />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
    page: {
        padding: '8px 0',
        fontFamily: 'sans-serif',
        maxWidth: 1100
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 10
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
    },
    headerTitle: {
        margin: 0,
        fontSize: 22,
        fontWeight: 700,
        color: '#222'
    },
    headerBadge: {
        backgroundColor: '#f44336',
        color: '#fff',
        borderRadius: 12,
        padding: '2px 8px',
        fontSize: 12,
        fontWeight: 700
    },
    headerActions: {
        display: 'flex',
        gap: 8,
        alignItems: 'center'
    },
    btnMarkAll: {
        backgroundColor: '#2ea761ff',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '7px 14px',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600
    },
    center: {
        textAlign: 'center',
        padding: '60px 20px'
    },
    loadingText: {
        color: '#888',
        fontSize: 15
    },
    emptyIconWrap: {
        marginBottom: 14,
        display: 'flex',
        justifyContent: 'center'
    },
    emptyText: {
        fontSize: 17,
        fontWeight: 600,
        color: '#444',
        margin: '0 0 6px'
    },
    emptySubText: {
        fontSize: 13,
        color: '#888',
        margin: 0
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
    },
    card: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        borderRadius: 10,
        border: '1px solid #eee',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        position: 'relative',
        transition: 'box-shadow .2s'
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    cardBody: {
        flex: 1,
        minWidth: 0
    },
    productName: {
        margin: '0 0 4px',
        fontSize: 13,
        fontWeight: 700,
        color: '#333',
        display: 'flex',
        alignItems: 'center'
    },
    message: {
        margin: '0 0 6px',
        fontSize: 14,
        color: '#444',
        lineHeight: 1.5
    },
    cardMeta: {
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    agentName: {
        fontSize: 12,
        color: '#888',
        display: 'flex',
        alignItems: 'center'
    },
    date: {
        fontSize: 12,
        color: '#aaa'
    },
    cardActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flexShrink: 0
    },
    btnRead: {
        background: 'none',
        border: '1px solid #4CAF50',
        color: '#4CAF50',
        borderRadius: 6,
        cursor: 'pointer',
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0
    },
    btnDelete: {
        background: 'none',
        border: '1px solid #eee',
        color: '#999',
        borderRadius: 6,
        cursor: 'pointer',
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0
    },
    unreadDot: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: '#1976D2'
    }
};

export default Notifications;

// ── Hook réutilisable pour compter les non lus (à importer dans Sidebar) ──────
export const useUnreadCount = (userId) => {
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        const uid = userId?._id || userId?.id || userId;
        if (!uid) return;

        const fetchCount = async () => {
            try {
                const res = await fetch(`/api/notifications?recipientId=${uid}`);
                const data = await res.json().catch(() => []);
                if (res.ok) setCount(Array.isArray(data) ? data.filter(n => !n.read).length : 0);
            } catch {
                setCount(0);
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    return count;
};