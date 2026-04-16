import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import './Dashboard.css';

import Sidebar from '../components/Shared/Sidebar';   // ✅ modifié
import AddProductTab from '../components/Shared/AddProductTab';
import MyProductsTab from '../components/Suplier/MyProductsTab';
import Notifications, { useUnreadCount } from '../components/Suplier/Notifications'; // ✅ hook importé
import Messagerie from '../components/Shared/Messagerie';

const SupplierDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('addProduct');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // ✅ callback après ajout produit
    const handleProductAdded = () => {
        setActiveTab('myProducts'); // redirige vers mes produits
    };

    // ✅ récupérer le nombre de notifications non lues
    const unreadCount = useUnreadCount(user?.id);

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
                role="fournisseur"              // ✅ ajouté
                activeTab={activeTab}
                setActiveTab={(key) => { setActiveTab(key); setIsSidebarOpen(false); }}
                onLogout={handleLogout}         // ✅ renommé pour cohérence
                unreadCount={unreadCount}       // ✅ ajouté
                user={user}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div
                className={`dashboardOverlay ${isSidebarOpen ? 'visible' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <div className="dashboardContent">
                {activeTab === 'addProduct' && (
                    <AddProductTab
                        user={user}
                        role="fournisseur"
                        onSuccess={handleProductAdded}
                    />
                )}

                {activeTab === 'myProducts' && <MyProductsTab user={user} />}

                {activeTab === 'messages' && (
                    <Messagerie user={user} role="fournisseur" />
                )}

                {activeTab === 'notifications' && (
                    <Notifications user={user} />
                )}
            </div>
        </div>
    );
};

export default SupplierDashboard;
