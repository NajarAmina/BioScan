import React, { useState } from 'react';
import { FiUser, FiX, FiSave, FiLogOut } from 'react-icons/fi';

const ProfileModal = ({ user, onClose, onUpdateProfile, onLogout }) => {
    const [name, setName] = useState(user.nom || '');
    const [email, setEmail] = useState(user.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = () => {
        if (password && password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }
        const updatedUser = { ...user, nom: name, email, ...(password ? { password } : {}) };
        onUpdateProfile(updatedUser);
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        <FiUser style={{ marginRight: '10px', color: 'var(--primary)' }} /> 
                        Mon Profil
                    </h2>
                    <button onClick={onClose} style={styles.closeBtn}><FiX /></button>
                </div>

                <div style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nom</label>
                        <input 
                            type="text" 
                            style={styles.input}
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="Votre nom complet"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
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
                            <FiSave size={16} /> Enregistrer
                        </button>
                        <button onClick={onLogout} style={styles.logoutBtn}>
                            <FiLogOut size={16} /> Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        justifyContent: 'center', alignItems: 'center', zIndex: 1050
    },
    modal: {
        backgroundColor: 'var(--bg-glass, var(--bg-card))', padding: '24px', borderRadius: '20px',
        width: '90%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
    },
    header: { 
        display: 'flex', justifyContent: 'space-between', 
        alignItems: 'center', marginBottom: '24px' 
    },
    title: { margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', fontWeight: 'bold' },
    closeBtn: {
        border: 'none', background: 'var(--bg-main)', width: '36px', height: '36px', 
        borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', 
        fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)', 
        transition: 'background 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' },
    input: {
        padding: '12px 14px', borderRadius: '10px',
        border: '1px solid var(--border-color)', fontSize: '1rem',
        backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)',
        fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
    },
    actions: { 
        display: 'flex', justifyContent: 'flex-end', gap: '12px', 
        marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' 
    },
    saveBtn: { 
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', backgroundColor: 'var(--primary)', color: '#fff', 
        border: 'none', borderRadius: '10px', cursor: 'pointer',
        fontWeight: '600', transition: 'background-color 0.2s'
    },
    logoutBtn: { 
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', backgroundColor: 'transparent', color: '#ef4444', 
        border: '1px solid #ef4444', borderRadius: '10px', cursor: 'pointer',
        fontWeight: '600', transition: 'background-color 0.2s'
    }
};

export default ProfileModal;