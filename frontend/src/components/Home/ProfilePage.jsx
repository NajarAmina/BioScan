import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import Profile from '../Shared/Profile';   // ✅ composant partagé

const ProfilePage = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div style={styles.pageContainer}>
            <Navbar
                user={user}
                onFavoritesClick={() => navigate('/favoris')}
                onHistoryClick={() => navigate('/historique')}
                onProfileClick={() => navigate('/profil')}
                onLogout={handleLogout}
                variant="solid"
            />

            <main style={styles.mainContent}>
                <Profile
                    user={user}
                    updateUser={updateUser}
                    onLogout={handleLogout}
                    onBack={() => navigate(-1)}
                />
            </main>

            <Footer />
        </div>
    );
};

const styles = {
    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
    },
    mainContent: {
        flex: 1,
        paddingTop: '100px',
        paddingBottom: '60px',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        paddingLeft: '20px',
        paddingRight: '20px',
        boxSizing: 'border-box',
    },
};

export default ProfilePage;