import React from 'react';
import { 
FiPieChart, FiBox, FiMessageSquare, FiActivity, FiUser, FiUserPlus,
FiPlusSquare, FiBell, FiBarChart2, FiUsers, FiShield, FiLogOut, FiSun, FiMoon,
FiX
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.css';

const Sidebar = ({
    role = 'agent',
    activeTab,
    setActiveTab,
    onLogout,
    user,
    unreadCount = 0,
    extraBadges = {},
    isOpen = false,
    onClose = () => {},
}) => {
    const { theme, toggleTheme } = useTheme();

    // ─── Config selon le rôle ─────────────────────────────────────────────
    const config = {
        agent: {
            title: 'Espace Agent',
            menuItems: [
                { key: 'overview', label: "Vue d'ensemble", icon: <FiPieChart size={18} /> },
                { key: 'products', label: 'Gérer Produits', icon: <FiBox size={18} /> },
                { key: 'messages', label: 'Messagerie', icon: <FiMessageSquare size={18} /> },
                { key: 'aiAnalysis', label: 'Analyse IA', icon: <FiActivity size={18} /> },
                { key: 'profile', label: 'Mon Profil', icon: <FiUser size={18} /> },
            ],
        },
        fournisseur: {
            title: 'Espace Fournisseur',
            menuItems: [
                { key: 'addProduct', label: 'Ajouter Produit', icon: <FiPlusSquare size={18} /> },
                { key: 'myProducts', label: 'Mes Produits', icon: <FiBox size={18} /> },
                { key: 'messages', label: 'Messages', icon: <FiMessageSquare size={18} /> },
                { key: 'notifications', label: 'Notifications', icon: <FiBell size={18} />, badge: true },
            ],
        },
        administrateur: {
            title: 'AdminPanel',
            titleIcon: <FiShield size={24} color="#3b82f6" />,
            menuItems: [
                { key: 'dashboard', label: "Statistiques", icon: <FiBarChart2 size={18} /> },
                { key: 'users', label: 'Utilisateurs', icon: <FiUsers size={18} />, dynamicBadge: 'users' },
                { key: 'products', label: 'Produits', icon: <FiBox size={18} /> },
                { key: 'messages', label: 'Messages', icon: <FiMessageSquare size={18} /> },
                { key: 'createAgent', label: 'Crée un agent', icon: <FiUserPlus size={18} /> },
            ],
        }
    };

    const cfg = config[role];

    // Initiales pour l'avatar
    const initiales =
        ((user?.prenom?.[0] || '') + (user?.nom?.[0] || '')).toUpperCase() || 'A';
    const nomComplet =
        `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Utilisateur';
    const roleLabel =
        role === 'agent' ? 'Agent' :
            role === 'fournisseur' ? 'Fournisseur' :
                'Administrateur';

    return (
        <div style={styles.sidebar} className={`sidebar${isOpen ? ' mobileOpen' : ''}`}>
            <div className="sidebarTopBar">
                <div style={styles.logoContainer} className="logoContainer">
                    {cfg.titleIcon && <span style={styles.logoIcon}>{cfg.titleIcon}</span>}
                    <h2 style={styles.title}>{cfg.title}</h2>
                </div>
                <button
                    type="button"
                    className="sidebarCloseButton"
                    onClick={onClose}
                    aria-label="Fermer le menu"
                >
                    <FiX size={22} />
                </button>
            </div>

            {/* ── Navigation ── */}
            <nav style={styles.nav} className="nav">
                {cfg.menuItems.map(item => {
                    const isActive = activeTab === item.key;

                    // Badge fournisseur (unreadCount)
                    const showUnreadBadge = item.badge && unreadCount > 0;
                    // Badge dynamique (ex: total users pour admin)
                    const dynamicBadgeValue = item.dynamicBadge ? extraBadges[item.dynamicBadge] : null;

                    return (
                        <button
                            key={item.key}
                            onClick={() => {
                                setActiveTab(item.key);
                                if (onClose) onClose();
                            }}
                            style={isActive ? styles.activeButton : styles.menuButton}
                            className={isActive ? 'activeButton' : 'menuButton'}
                        >
                            <span style={styles.btnContent} className="btnContent">
                                <span style={styles.btnLabel} className="btnLabel">
                                    <span style={styles.btnIcon} className="btnIcon">{item.icon}</span>
                                    {item.label}
                                </span>
                                {showUnreadBadge && (
                                    <span style={styles.badge}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                                {dynamicBadgeValue != null && (
                                    <span style={styles.badgeDynamic}>
                                        {dynamicBadgeValue > 99 ? '99+' : dynamicBadgeValue}
                                    </span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* ── Footer : infos utilisateur + déconnexion ── */}
            <div style={styles.footer} className="footer">
                <div style={styles.userInfo} className="userInfo">
                    <div style={styles.avatar} className="avatar">{initiales}</div>
                    <div style={styles.userText} className="userText">
                        <span style={styles.userName} className="userName">{nomComplet}</span>
                        <span style={styles.userRole} className="userRole">{roleLabel}</span>
                    </div>
                </div>
                <button onClick={toggleTheme} style={styles.themeBtn} className="themeBtn" title="Changer le thème">
                    {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
                </button>
                <button onClick={onLogout} style={styles.logoutBtn} className="logoutBtn" title="Déconnexion">
                    <FiLogOut size={18} />
                </button>
            </div>
        </div>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
    sidebar: {
        width: '230px',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        flexShrink: 0,
        borderRight: '1px solid var(--border-color)',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '2rem',
    },
    logoIcon: { fontSize: '1.6rem' },
    title: {
        margin: 0,
        fontSize: 18,
        fontWeight: 700,
        color: 'var(--text-primary)',
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flex: 1,
    },
    menuButton: {
        width: '100%',
        padding: '10px 14px',
        backgroundColor: 'transparent',
        border: 'none',
        borderLeft: '4px solid transparent',
        color: 'var(--text-secondary)',
        borderRadius: '6px',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: 14,
        fontWeight: 500,
    },
    activeButton: {
        width: '100%',
        padding: '10px 14px',
        backgroundColor: 'var(--border-color)',
        border: 'none',
        borderLeft: '4px solid var(--accent-color)',
        color: 'var(--text-primary)',
        borderRadius: '6px',
        cursor: 'pointer',
        textAlign: 'left',
        fontWeight: 700,
        fontSize: 14,
    },
    btnContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    btnLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
    },
    btnIcon: { 
        display: 'flex', 
        alignItems: 'center'
    },
    badge: {
        backgroundColor: '#ef4444',
        color: '#fff',
        borderRadius: 10,
        padding: '1px 7px',
        fontSize: 11,
        fontWeight: 700,
        minWidth: 18,
        textAlign: 'center',
    },
    badgeDynamic: {
        backgroundColor: '#64748b',
        color: '#fff',
        borderRadius: 10,
        padding: '1px 7px',
        fontSize: 11,
        fontWeight: 700,
        minWidth: 18,
        textAlign: 'center',
    },

    // ── Footer ──
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-color)',
        marginTop: 'auto',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        overflow: 'hidden',
        flex: 1,
    },
    avatar: {
        width: 36,
        height: 36,
        backgroundColor: 'var(--accent-color)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 13,
        flexShrink: 0,
        color: 'white',
    },
    userText: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    userName: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    userRole: {
        fontSize: 11,
        color: 'var(--text-muted)',
    },
    themeBtn: {
        background: 'transparent',
        border: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        borderRadius: 6,
        flexShrink: 0,
        transition: 'all 0.2s',
    },
    logoutBtn: {
        background: 'transparent',
        border: '1px solid var(--border-color)',
        color: '#ef4444',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        borderRadius: 6,
        flexShrink: 0,
        transition: 'all 0.2s',
    },
};

export default Sidebar;