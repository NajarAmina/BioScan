import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import './Dashboard.css';

import Sidebar from '../components/Shared/Sidebar';
import OverviewTab from '../components/Admin/OverviewTab';
import UsersTab from '../components/Admin/UsersTab';
import ProductsTab from '../components/Admin/ProductsTab';
import ReportsTab from '../components/Admin/ReportsTab';
import Messagerie from '../components/Shared/Messagerie';
import CreateAgent from '../components/Admin/CreateAgent';
import { apiFetch, AuthExpiredError } from '../utils/apiFetch';

const API = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [allUsers, setAllUsers] = useState([]);
    const [statsByRole, setStatsByRole] = useState({});
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ✅ CORRECTION : useEffect manquant — charge les utilisateurs au montage
    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            setFetchError('');
            try {
                const res = await apiFetch(`${API}/users`, {
                    headers: { 'Content-Type': 'application/json' },
                });

                const users = await res.json();
                setAllUsers(users);

                // ✅ Calcul des stats par rôle depuis la liste reçue
                const stats = users.reduce((acc, u) => {
                    // ✅ Normaliser agent_saisie → agent
                    let role = u.role || 'inconnu';
                    if (role === 'agent_saisie') role = 'agent';

                    acc[role] = (acc[role] || 0) + 1;
                    return acc;
                }, {});
                stats.total = users.length;
                setStatsByRole(stats);

            } catch (err) {
                if (err instanceof AuthExpiredError) {
                    // évite d'afficher le bandeau: on redirige vers login
                    navigate('/');
                    return;
                }
                console.error('❌ Erreur chargement users:', err.message);
                setFetchError(err.message);
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [navigate]); // ← se lance au montage (navigate est stable)

    // Si l'utilisateur est logout (token expiré), sortir du dashboard
    useEffect(() => {
        if (user === null) navigate('/');
    }, [user, navigate]);

    // Gestion de la déconnexion
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Fonction pour afficher le contenu selon l'onglet actif
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <OverviewTab statsByRole={statsByRole} loading={loadingUsers} />;
            case 'users':
                return (
                    <UsersTab
                        allUsers={allUsers}
                        setAllUsers={setAllUsers}
                        statsByRole={statsByRole}
                        loading={loadingUsers}
                    />
                );
            case 'products':
                return <ProductsTab />;
            case 'reports':
                return <ReportsTab />;
            case 'messages':
                return <Messagerie user={user} role="administrateur" />;
            case 'createAgent':
                return <CreateAgent />;
            default:
                return <OverviewTab statsByRole={statsByRole} loading={loadingUsers} />;
        }
    };

    return (
        <div className="dashboardContainer">
            <button
                className="mobileMenuButton"
                type="button"
                onClick={() => setIsSidebarOpen(true)}
            >
                <FiMenu size={20} />
            </button>
            <Sidebar
                role="administrateur"
                activeTab={activeTab}
                setActiveTab={(key) => { setActiveTab(key); setIsSidebarOpen(false); }}
                onLogout={handleLogout}
                user={user}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div
                className={`dashboardOverlay ${isSidebarOpen ? 'visible' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />
            <div className="dashboardContent">
                {/* Affichage erreur globale de chargement */}
                {fetchError && (
                    <div style={styles.errorBanner}>
                        ⚠️ Impossible de charger les utilisateurs : {fetchError}
                        <button
                            onClick={() => setFetchError('')}
                            style={styles.errorClose}
                        >
                            ✕
                        </button>
                    </div>
                )}
                {renderContent()}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: '30px',
    },
    errorBanner: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '0.5rem',
        color: '#991b1b',
        fontSize: '0.875rem',
        marginBottom: '1rem',
    },
    errorClose: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#991b1b',
        fontWeight: 700,
        fontSize: '1rem',
    },
};

export default AdminDashboard;
