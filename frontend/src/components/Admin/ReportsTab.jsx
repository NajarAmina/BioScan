import React, { useState, useEffect } from 'react';

const MESSAGES_KEY = 'platform_messages';

/**
 * Onglet Rapports — messages reçus par l'administrateur
 */
const ReportsTab = () => {
    const [messages, setMessages] = useState([]);
    const [expanded, setExpanded] = useState(null);

    const loadMessages = () => {
        const all = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
        const inbox = all
            .filter(m => m.toRole === 'administrateur')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMessages(inbox);
    };

    useEffect(() => { loadMessages(); }, []);

    const unread = messages.filter(m => !m.read).length;

    const markRead = (id) => {
        const all = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
        const updated = all.map(m => m.id === id ? { ...m, read: true } : m);
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
        loadMessages();
    };

    const handleExpand = (id) => {
        if (expanded !== id) markRead(id);
        setExpanded(prev => prev === id ? null : id);
    };

    return (
        <div style={S.wrapper}>
            <div style={S.header}>
                <div>
                    <h2 style={S.title}>📬 Messages reçus</h2>
                    <p style={S.subtitle}>
                        Messages envoyés par les fournisseurs et agents.
                        {unread > 0 && <span style={S.unreadBadge}>{unread} non lu{unread > 1 ? 's' : ''}</span>}
                    </p>
                </div>
                <button onClick={loadMessages} style={S.refreshBtn}>↻ Actualiser</button>
            </div>

            {messages.length === 0 ? (
                <div style={S.emptyBox}>Aucun message reçu pour le moment.</div>
            ) : (
                <div style={S.list}>
                    {messages.map(m => (
                        <div
                            key={m.id}
                            style={{ ...S.card, ...((!m.read) ? S.cardUnread : {}) }}
                        >
                            <div style={S.cardHeader} onClick={() => handleExpand(m.id)}>
                                <div style={S.cardLeft}>
                                    {!m.read && <span style={S.dot}>●</span>}
                                    <div>
                                        <strong style={S.subject}>{m.subject || '(sans sujet)'}</strong>
                                        <span style={S.from}>
                                            De : {m.fromName || m.fromRole || 'Inconnu'}
                                            {m.fromRole && ` (${m.fromRole})`}
                                        </span>
                                    </div>
                                </div>
                                <div style={S.cardRight}>
                                    <span style={S.date}>
                                        {new Date(m.createdAt).toLocaleString('fr-FR')}
                                    </span>
                                    <span style={S.chevron}>{expanded === m.id ? '▲' : '▼'}</span>
                                </div>
                            </div>

                            {expanded === m.id && (
                                <div style={S.body}>
                                    <p style={S.content}>{m.content}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const S = {
    wrapper: {},
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    title: { margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' },
    subtitle: { margin: 0, color: '#64748b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
    unreadBadge: { backgroundColor: '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999 },
    refreshBtn: { padding: '0.5rem 1.2rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' },
    emptyBox: { padding: '1.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', color: '#94a3b8', textAlign: 'center' },
    list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    card: { backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden', cursor: 'pointer' },
    cardUnread: { borderLeft: '4px solid #3b82f6', backgroundColor: '#f0f7ff' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', gap: '1rem', flexWrap: 'wrap' },
    cardLeft: { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1 },
    dot: { color: '#3b82f6', fontSize: 10, marginTop: 4, flexShrink: 0 },
    subject: { display: 'block', fontSize: '0.9rem', color: '#1e293b' },
    from: { display: 'block', fontSize: '0.78rem', color: '#64748b', marginTop: 2 },
    cardRight: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 },
    date: { fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap' },
    chevron: { fontSize: 11, color: '#94a3b8' },
    body: { padding: '0 1.25rem 1rem', borderTop: '1px solid #f1f5f9' },
    content: { margin: '0.75rem 0 0', fontSize: '0.875rem', color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.6 },
};

export default ReportsTab;