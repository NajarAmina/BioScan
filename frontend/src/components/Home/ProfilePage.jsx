import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiSave, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

const ProfilePage = () => {
    const { user, login, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    // Redirige si non connecté
    React.useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const [name, setName] = useState(user?.nom || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = () => {
        if (password && password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }
        const updatedUser = { ...user, nom: name, email, ...(password ? { password } : {}) };
        updateUser(updatedUser);
        alert('Profil mis à jour avec succès.');
        setPassword('');
        setConfirmPassword('');
    };

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
                <div style={styles.pageHeader}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}>
                        <FiArrowLeft size={20} /> Retour
                    </button>
                    <h1 style={styles.title}>
                        <FiUser style={{ color: 'var(--primary)', marginRight: '12px' }} />
                        Mon Profil
                    </h1>
                </div>

                <div style={styles.content}>
                    <div style={styles.formCard}>
                        <div style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Nom complet</label>
                                <input 
                                    type="text" 
                                    style={styles.input}
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    placeholder="Votre nom"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Adresse Email</label>
                                <input 
                                    type="email" 
                                    style={styles.input}
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    placeholder="votre.email@exemple.com"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Nouveau mot de passe</label>
                                <input 
                                    type="password" 
                                    style={styles.input}
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    placeholder="Laissez vide pour conserver l'actuel"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Confirmer le mot de passe</label>
                                <input 
                                    type="password" 
                                    style={styles.input}
                                    value={confirmPassword} 
                                    onChange={e => setConfirmPassword(e.target.value)} 
                                />
                            </div>

                            <div style={styles.actions}>
                                <button onClick={handleSubmit} style={styles.saveBtn}>
                                    <FiSave size={18} /> Enregistrer les modifications
                                </button>
                                <button onClick={handleLogout} style={styles.logoutBtn}>
                                    <FiLogOut size={18} /> Déconnexion
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const styles = {
    pageContainer: {
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        backgroundColor: 'var(--bg-main)'
    },
    mainContent: {
        flex: 1, paddingTop: '100px', paddingBottom: '60px',
        maxWidth: '800px', margin: '0 auto', width: '100%',
        paddingLeft: '20px', paddingRight: '20px'
    },
    pageHeader: {
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '30px'
    },
    backBtn: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'none', border: 'none', color: 'var(--text-secondary)',
        cursor: 'pointer', fontSize: '1rem', padding: '0',
        marginBottom: '16px', transition: 'color 0.2s'
    },
    title: { 
        margin: 0, fontSize: '2.5rem', color: 'var(--text-primary)', 
        display: 'flex', alignItems: 'center', fontWeight: 'bold' 
    },
    content: { width: '100%' },
    formCard: {
        backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '20px',
        border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '600' },
    input: {
        padding: '14px 16px', borderRadius: '12px',
        border: '1px solid var(--border-color)', fontSize: '1.05rem',
        backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)',
        fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
    },
    actions: { 
        display: 'flex', flexWrap: 'wrap', gap: '16px', 
        marginTop: '20px', paddingTop: '30px', borderTop: '1px solid var(--border-color)' 
    },
    saveBtn: { 
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        padding: '14px 24px', backgroundColor: 'var(--primary)', color: '#fff', 
        border: 'none', borderRadius: '12px', cursor: 'pointer',
        fontSize: '1.05rem', fontWeight: '600', transition: 'background-color 0.2s',
        flex: '1 1 auto'
    },
    logoutBtn: { 
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        padding: '14px 24px', backgroundColor: 'transparent', color: '#ef4444', 
        border: '1px solid #ef4444', borderRadius: '12px', cursor: 'pointer',
        fontSize: '1.05rem', fontWeight: '600', transition: 'background-color 0.2s',
        flex: '1 1 auto'
    }
};

export default ProfilePage;
