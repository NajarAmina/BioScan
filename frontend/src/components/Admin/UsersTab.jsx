import React, { useState } from 'react';
import { apiFetch, AuthExpiredError } from '../../utils/apiFetch';

const getRoleColor = (role) => ({
    consommateur: '#10b981',
    fournisseur: '#3b82f6',
    agent: '#8b5cf6',
    agent_saisie: '#8b5cf6',
    administrateur: '#f59e0b',
    admin: '#f59e0b',
}[role] || '#6b7280');

const getRoleLabel = (role) => ({
    consommateur: '🛒 Consommateur',
    fournisseur: '🏭 Fournisseur',
    agent: '👮 Agent',
    agent_saisie: '👮 Agent',
}[role] || role);

const formatDate = (dateStr, id) => {
    let d;
    if (dateStr) {
        d = new Date(dateStr);
    } else if (id && typeof id === 'string' && id.length === 24) {
        // Fallback: extraire la date depuis l'ObjectId MongoDB
        d = new Date(parseInt(id.substring(0, 8), 16) * 1000);
    }

    if (!d || isNaN(d.getTime())) return 'N/A';

    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(' à', '').replace(/,?\s+/, ' à ');
};

const API = 'http://localhost:5000/api';

/**
 * Props :
 *  - allUsers        : tableau d'utilisateurs
 *  - setAllUsers     : setter
 *  - statsByRole     : { total, consommateur, fournisseur, agent, administrateur }
 *  - loading         : boolean
 */
const UsersTab = ({ allUsers = [], setAllUsers, statsByRole = {}, loading = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // ── Filtres ───────────────────────────────────────────────────────────
    const filteredUsers = allUsers.filter(u => {
        const matchSearch =
            u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = filterRole === 'all' || u.role === filterRole;
        return matchSearch && matchRole;
    });

    // ── Supprimer via API ─────────────────────────────────────────────────
    const handleDelete = async (userId) => {
        if (!window.confirm('Supprimer cet utilisateur ?')) return;
        setActionLoading(true);
        setErrorMsg('');
        try {
            const res = await apiFetch(`${API}/users/${userId}`, {
                method: 'DELETE',
            });
            // ✅ Met à jour la liste locale après suppression réussie
            setAllUsers(prev => prev.filter(u => (u._id || u.id) !== userId));
            setShowModal(false);
        } catch (err) {
            if (err instanceof AuthExpiredError) return;
            setErrorMsg(`Erreur suppression : ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Bloquer / Débloquer via API ───────────────────────────────────────
    const handleToggleBlock = async (userId) => {
        const target = allUsers.find(u => (u._id || u.id) === userId);
        if (!target) return;

        setActionLoading(true);
        setErrorMsg('');
        try {
            const res = await apiFetch(`${API}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isBlocked: !target.isBlocked })
            });
            const data = await res.json();
            const updatedUser = data.user || { ...target, isBlocked: !target.isBlocked };

            // ✅ Met à jour uniquement l'utilisateur concerné
            setAllUsers(prev => prev.map(u =>
                (u._id || u.id) === userId ? { ...u, isBlocked: updatedUser.isBlocked } : u
            ));

            // Met à jour la modal si ouverte
            if (selectedUser && (selectedUser._id || selectedUser.id) === userId) {
                setSelectedUser(prev => ({ ...prev, isBlocked: updatedUser.isBlocked }));
            }
        } catch (err) {
            if (err instanceof AuthExpiredError) return;
            setErrorMsg(`Erreur blocage : ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleView = (u) => { setSelectedUser(u); setShowModal(true); setErrorMsg(''); };

    // Identifiant universel (_id MongoDB ou id)
    const uid = (u) => u._id || u.id;

    return (
        <div style={S.container}>
            {/* ── Message d'erreur global ── */}
            {errorMsg && (
                <div style={S.errorBox}>
                    ⚠️ {errorMsg}
                    <button onClick={() => setErrorMsg('')} style={S.errorClose}>✕</button>
                </div>
            )}

            {/* ── Barre recherche + filtre ── */}
            <div style={S.toolbar}>
                <div style={S.searchBox}>
                    <span>🔍</span>
                    <input
                        type="text"
                        placeholder="Rechercher par nom, prénom ou email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={S.searchInput}
                    />
                </div>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={S.select}>
                    <option value="all">Tous les rôles</option>
                    <option value="consommateur">Consommateurs</option>
                    <option value="fournisseur">Fournisseurs</option>
                    <option value="agent_saisie">Agents</option>
                </select>
            </div>

            {/* ── Quick stats ── */}
            <div style={S.quickStats}>
                {[
                    { icon: '🛒', label: 'Consommateurs', value: statsByRole.consommateur || 0 },
                    { icon: '🏭', label: 'Fournisseurs',  value: statsByRole.fournisseur  || 0 },
                    { icon: '👮', label: 'Agents',        value: statsByRole.agent        || 0 },
                ].map((s, i) => (
                    <div key={i} style={S.quickCard}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <div>
                            <span style={S.quickValue}>{s.value}</span>
                            <span style={S.quickLabel}>{s.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Table ── */}
            <div style={S.tableWrap}>
                {loading ? (
                    <div style={S.infoBox}>⏳ Chargement des utilisateurs…</div>
                ) : (
                    <table style={S.table}>
                        <thead>
                            <tr>
                                {['Utilisateur', 'Email', 'Rôle', 'Date Inscription', 'Statut', 'Actions'].map(h => (
                                    <th key={h} style={S.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} style={S.noData}>Aucun utilisateur trouvé</td></tr>
                            ) : filteredUsers.map(u => (
                                <tr key={uid(u)} style={S.tr}>
                                    <td style={S.td}>
                                        <div style={S.userCell}>
                                            <div style={S.avatar}>
                                                {u.prenom?.[0]?.toUpperCase()}{u.nom?.[0]?.toUpperCase()}
                                            </div>
                                            <span style={S.userName}>{u.prenom} {u.nom}</span>
                                        </div>
                                    </td>
                                    <td style={S.td}>{u.email}</td>
                                    <td style={S.td}>
                                        <span style={{ ...S.roleBadge, backgroundColor: getRoleColor(u.role) }}>
                                            {getRoleLabel(u.role)}
                                        </span>
                                    </td>
                                    <td style={S.td}>
                                        {formatDate(u.createdAt, u._id || u.id)}
                                    </td>
                                    <td style={S.td}>
                                        <span style={{
                                            ...S.statusBadge,
                                            backgroundColor: u.isBlocked ? '#fecaca' : '#d1fae5',
                                            color: u.isBlocked ? '#dc2626' : '#059669',
                                        }}>
                                            {u.isBlocked ? '🔒 Bloqué' : '✅ Actif'}
                                        </span>
                                    </td>
                                    <td style={S.td}>
                                        <div style={S.actions}>
                                            <button onClick={() => handleView(u)} style={S.btnView} disabled={actionLoading}>👁️</button>
                                            <button onClick={() => handleToggleBlock(uid(u))}
                                                style={u.isBlocked ? S.btnUnblock : S.btnBlock}
                                                disabled={actionLoading}>
                                                {u.isBlocked ? '🔓' : '🔒'}
                                            </button>
                                            <button onClick={() => handleDelete(uid(u))} style={S.btnDelete} disabled={actionLoading}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Modal détails ── */}
            {showModal && selectedUser && (
                <div style={S.overlay} onClick={() => setShowModal(false)}>
                    <div style={S.modal} onClick={e => e.stopPropagation()}>
                        <div style={S.modalHeader}>
                            <h2 style={S.modalTitle}>👤 Détails Utilisateur</h2>
                            <button onClick={() => setShowModal(false)} style={S.closeBtn}>✕</button>
                        </div>

                        <div style={S.modalAvatarRow}>
                            <div style={S.modalAvatar}>
                                {selectedUser.prenom?.[0]?.toUpperCase()}{selectedUser.nom?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 6px' }}>{selectedUser.prenom} {selectedUser.nom}</h3>
                                <span style={{ ...S.roleBadge, backgroundColor: getRoleColor(selectedUser.role) }}>
                                    {getRoleLabel(selectedUser.role)}
                                </span>
                            </div>
                        </div>

                        <div style={S.detailGrid}>
                            {[
                                { label: 'Email',             value: selectedUser.email },
                                { label: 'Téléphone',         value: selectedUser.telephone || 'N/A' },
                                { label: 'Adresse',           value: selectedUser.adresse || 'N/A' },
                                { label: 'Date Inscription',  value: formatDate(selectedUser.createdAt, selectedUser._id || selectedUser.id) },
                                { label: 'Statut',            value: selectedUser.isBlocked ? '🔒 Bloqué' : '✅ Actif' },
                                { label: 'ID',                value: uid(selectedUser) },
                            ].map((d, i) => (
                                <div key={i} style={S.detailItem}>
                                    <label style={S.detailLabel}>{d.label}</label>
                                    <p style={S.detailValue}>{d.value}</p>
                                </div>
                            ))}
                        </div>

                        <div style={S.modalActions}>
                            <button
                                onClick={() => handleToggleBlock(uid(selectedUser))}
                                style={selectedUser.isBlocked ? S.btnModalUnblock : S.btnModalBlock}
                                disabled={actionLoading}>
                                {actionLoading ? '⏳' : selectedUser.isBlocked ? '🔓 Débloquer' : '🔒 Bloquer'}
                            </button>
                            <button
                                onClick={() => handleDelete(uid(selectedUser))}
                                style={S.btnModalDelete}
                                disabled={actionLoading}>
                                {actionLoading ? '⏳' : '🗑️ Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const S = {
    container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    errorBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#991b1b', fontSize: '0.875rem' },
    errorClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 700 },
    infoBox: { padding: '2rem', textAlign: 'center', color: '#64748b' },
    toolbar: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem 1rem', flex: 1, minWidth: 200 },
    searchInput: { border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%', backgroundColor: 'transparent', color: '#1e293b' },
    select: { padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: 'white', color: '#475569', fontSize: '0.875rem', cursor: 'pointer' },
    quickStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' },
    quickCard: { backgroundColor: 'white', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    quickValue: { display: 'block', fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' },
    quickLabel: { display: 'block', fontSize: '0.75rem', color: '#64748b' },
    tableWrap: { backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '1rem', fontSize: '0.875rem', color: '#1e293b', verticalAlign: 'middle' },
    noData: { padding: '2rem', textAlign: 'center', color: '#94a3b8' },
    userCell: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    avatar: { width: 34, height: 34, backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 },
    userName: { fontWeight: 600 },
    roleBadge: { display: 'inline-block', padding: '0.2rem 0.7rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, color: 'white' },
    statusBadge: { display: 'inline-block', padding: '0.2rem 0.7rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 },
    actions: { display: 'flex', gap: '0.4rem' },
    btnView:    { padding: '0.35rem 0.6rem', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' },
    btnBlock:   { padding: '0.35rem 0.6rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' },
    btnUnblock: { padding: '0.35rem 0.6rem', backgroundColor: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' },
    btnDelete:  { padding: '0.35rem 0.6rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '90%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    modalTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748b' },
    modalAvatarRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', marginBottom: '1.5rem' },
    modalAvatar: { width: 54, height: 54, borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 },
    detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
    detailItem: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
    detailLabel: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500 },
    detailValue: { fontSize: '0.875rem', color: '#1e293b', margin: 0 },
    modalActions: { display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' },
    btnModalBlock:   { flex: 1, padding: '0.75rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 },
    btnModalUnblock: { flex: 1, padding: '0.75rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 },
    btnModalDelete:  { flex: 1, padding: '0.75rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 },
};

export default UsersTab;
