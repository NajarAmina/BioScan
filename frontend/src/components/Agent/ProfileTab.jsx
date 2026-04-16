import React, { useState, useEffect } from 'react';

const EyeIcon = ({ open }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {open ? (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        ) : (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </>
        )}
    </svg>
);

const ProfileTab = ({ user, updateUser }) => {
    const [profileForm, setProfileForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        adresse: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        setProfileForm({
            nom: user.nom || '',
            prenom: user.prenom || '',
            email: user.email || '',
            adresse: user.adresse || ''
        });
        setResetEmail(user.email || '');
    }, [user]);

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        updateUser(profileForm);
        alert('Profil mis à jour avec succès !');
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword.length < 6) {
            setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('Les mots de passe ne correspondent pas.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/${user._id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setPasswordError(data.message || 'Erreur lors de la mise à jour.');
                return;
            }

            setPasswordSuccess('Mot de passe mis à jour avec succès !');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordError('Erreur réseau. Veuillez réessayer.');
        }
    };

    const toggleShow = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setResetError('');
        setResetSuccess('');
        setResetLoading(true);

        const emailToSend = resetEmail.trim().toLowerCase() || profileForm.email.trim().toLowerCase();
        if (!emailToSend) {
            setResetError('Veuillez entrer une adresse email valide.');
            setResetLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailToSend })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || 'Impossible d’envoyer la demande de réinitialisation.');
            }
            setResetSuccess(
                data.message ||
                'Si un compte existe pour cet email, vous recevrez un lien de réinitialisation.'
            );
        } catch (err) {
            setResetError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.headerText}>
                    <p style={styles.subtitle}>Espace Agent</p>
                    <h1 style={styles.title}>Mon profil</h1>
                    <p style={styles.description}>
                        Gérez vos informations personnelles et renforcez la sécurité de votre compte.
                    </p>
                </div>

                <div style={styles.profileCard}>
                    <div style={styles.avatar}>
                        {user?.prenom?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div style={styles.profileDetails}>
                        <p style={styles.profileLabel}>Utilisateur</p>
                        <h3 style={styles.profileName}>{`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Agent'}</h3>
                        <p style={styles.profileRole}>{user?.role === 'agent' ? 'Agent' : user?.role || 'Utilisateur'}</p>
                        <p style={styles.profileEmail}>{user?.email || 'Adresse email non renseignée'}</p>
                    </div>
                </div>
            </header>

            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <div style={styles.titleIconRow}>
                        <div>
                            <h2 style={styles.cardTitle}>Informations personnelles et sécurité</h2>
                            <p style={styles.cardSubtitle}>Mettez à jour vos informations de profil et renforcez la sécurité de votre compte.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleProfileUpdate} style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.fieldColumn}>
                            <label style={styles.label}>Prénom</label>
                            <input
                                style={styles.input}
                                type="text"
                                value={profileForm.prenom}
                                onChange={(e) => setProfileForm({ ...profileForm, prenom: e.target.value })}
                                required
                            />
                        </div>
                        <div style={styles.fieldColumn}>
                            <label style={styles.label}>Nom</label>
                            <input
                                style={styles.input}
                                type="text"
                                value={profileForm.nom}
                                onChange={(e) => setProfileForm({ ...profileForm, nom: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.fieldFull}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            required
                        />
                    </div>

                    {user?.role === 'agent' && (
                        <div style={styles.fieldFull}>
                            <label style={styles.label}>Adresse</label>
                            <input
                                style={styles.input}
                                type="text"
                                value={profileForm.adresse}
                                onChange={(e) => setProfileForm({ ...profileForm, adresse: e.target.value })}
                            />
                        </div>
                    )}

                    <button type="submit" style={styles.primaryButton}>Enregistrer les modifications</button>
                </form>

                {user?.role === 'agent' && (
                    <div style={styles.securitySection}>
                        <div style={styles.subSectionHeader}>
                            <h3 style={styles.subSectionTitle}>Sécurité du compte</h3>
                            <p style={styles.subSectionText}>Changez votre mot de passe pour protéger votre espace agent.</p>
                        </div>

                        <form onSubmit={handlePasswordUpdate} style={styles.form}>
                            {showForgotPassword ? (
                                <div style={styles.resetHint}>
                                    <div style={styles.fieldFull}>
                                        <label style={styles.label}>Email</label>
                                        <input
                                            style={styles.input}
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => {
                                                setResetEmail(e.target.value);
                                                setResetError('');
                                                setResetSuccess('');
                                            }}
                                            placeholder="votre@email.com"
                                            required
                                        />
                                    </div>
                                    {resetError && <p style={styles.errorMessage}>⚠️ {resetError}</p>}
                                    {resetSuccess && <p style={styles.successMessage}>✅ {resetSuccess}</p>}
                                    
                                    <div style={styles.resetButtons}>
                                        <button type="button" style={styles.secondaryButton} onClick={() => setShowForgotPassword(false)}>
                                            Annuler
                                        </button>
                                        <button type="button" style={styles.primaryButton} onClick={handleForgotPassword} disabled={resetLoading}>
                                            {resetLoading ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={styles.fieldFull}>
                                        <label style={styles.label}>Mot de passe actuel</label>
                                        <div style={styles.inputWrapper}>
                                            <input
                                                style={styles.inputWithIcon}
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                style={styles.eyeButton}
                                                onClick={() => toggleShow('current')}
                                                title={showPasswords.current ? 'Masquer' : 'Afficher'}
                                            >
                                                <EyeIcon open={showPasswords.current} />
                                            </button>
                                        </div>
                                        {/* LIEN DÉPLACÉ ICI POUR ÊTRE SOUS LE CHAMP */}
                                        <button 
                                            type="button" 
                                            style={styles.forgotPasswordLink} 
                                            onClick={() => {
                                                setShowForgotPassword(true);
                                                setResetError('');
                                                setResetSuccess('');
                                            }}
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </div>

                                    <div style={styles.row}>
                                        <div style={styles.fieldColumn}>
                                            <label style={styles.label}>Nouveau mot de passe</label>
                                            <div style={styles.inputWrapper}>
                                                <input
                                                    style={styles.inputWithIcon}
                                                    type={showPasswords.new ? 'text' : 'password'}
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    style={styles.eyeButton}
                                                    onClick={() => toggleShow('new')}
                                                    title={showPasswords.new ? 'Masquer' : 'Afficher'}
                                                >
                                                    <EyeIcon open={showPasswords.new} />
                                                </button>
                                            </div>
                                        </div>

                                        <div style={styles.fieldColumn}>
                                            <label style={styles.label}>Confirmer le mot de passe</label>
                                            <div style={styles.inputWrapper}>
                                                <input
                                                    style={styles.inputWithIcon}
                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    style={styles.eyeButton}
                                                    onClick={() => toggleShow('confirm')}
                                                    title={showPasswords.confirm ? 'Masquer' : 'Afficher'}
                                                >
                                                    <EyeIcon open={showPasswords.confirm} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {passwordError && <p style={styles.errorMessage}>⚠️ {passwordError}</p>}
                                    {passwordSuccess && <p style={styles.successMessage}>✅ {passwordSuccess}</p>}

                                    <button type="submit" style={styles.primaryButton}>
                                        Mettre à jour le mot de passe
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        color: '#1f2937',
        fontFamily: 'Inter, system-ui, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
    },
    subtitle: {
        margin: 0,
        fontSize: '0.9rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        color: '#6366f1',
    },
    title: {
        margin: '8px 0',
        fontSize: '2rem',
        lineHeight: 1.1,
        color: '#111827',
    },
    description: {
        margin: 0,
        fontSize: '1rem',
        lineHeight: 1.6,
        color: '#4b5563',
        maxWidth: '560px',
    },
    profileCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        minWidth: '280px',
        maxWidth: '360px',
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)',
    },
    avatar: {
        display: 'grid',
        placeItems: 'center',
        width: '68px',
        height: '68px',
        borderRadius: '50%',
        backgroundColor: '#eef2ff',
        color: '#4338ca',
        fontSize: '1.8rem',
        fontWeight: 700,
    },
    profileDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    profileLabel: {
        margin: 0,
        fontSize: '0.85rem',
        fontWeight: 400,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: '#6b7280',
    },
    profileName: {
        margin: 0,
        fontSize: '1.1rem',
        color: '#111827',
    },
    profileRole: {
        margin: 0,
        fontSize: '0.95rem',
        color: '#4b5563',
    },
    profileEmail: {
        margin: 0,
        fontSize: '0.95rem',
        color: '#6b7280',
        wordBreak: 'break-word',
    },
    card: {
        width: '100%',
        minWidth: 0,
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 18px 50px rgba(15, 23, 42, 0.05)',
    },
    cardHeader: {
        marginBottom: '20px',
    },
    cardTitle: {
        margin: '0 0 8px',
        fontSize: '1.2rem',
        color: '#111827',
    },
    cardSubtitle: {
        margin: 0,
        fontSize: '0.95rem',
        lineHeight: 1.6,
        color: '#6b7280',
    },
    securitySection: {
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #e5e7eb',
    },
    subSectionHeader: {
        marginBottom: '18px',
    },
    subSectionTitle: {
        margin: '0 0 8px',
        fontSize: '1rem',
        color: '#111827',
    },
    subSectionText: {
        margin: 0,
        fontSize: '0.95rem',
        lineHeight: 1.6,
        color: '#6b7280',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        maxWidth: '1100px',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '18px',
        width: '100%',
    },
    fieldColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    fieldFull: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
    },
    label: {
        margin: 0,
        fontSize: '0.95rem',
        fontWeight: 600,
        color: '#374151',
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        fontSize: '0.95rem',
        color: '#111827',
        backgroundColor: '#f9fafb',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        outline: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxSizing: 'border-box',
    },
    inputWrapper: {
        position: 'relative',
        width: '100%',
    },
    inputWithIcon: {
        width: '100%',
        padding: '14px 48px 14px 16px',
        fontSize: '0.95rem',
        color: '#111827',
        backgroundColor: '#f9fafb',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        outline: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxSizing: 'border-box',
    },
    eyeButton: {
        position: 'absolute',
        right: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        opacity: 0.65,
        transition: 'opacity 0.15s ease',
    },
    // NOUVEAU STYLE POUR LE LIEN "MOT DE PASSE OUBLIÉ"
    forgotPasswordLink: {
        alignSelf: 'flex-end',
        background: 'none',
        border: 'none',
        color: '#4b5563',
        fontSize: '0.85rem',
        cursor: 'pointer',
        padding: '4px 0',
        marginTop: '4px',
        textDecoration: 'none',
    },
    resetHint: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '16px',
        padding: '16px',
        borderRadius: '14px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
    },
    resetButtons: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    secondaryButton: {
        padding: '14px 24px',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: '#374151',
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '999px',
        cursor: 'pointer',
    },
    primaryButton: {
        width: 'fit-content',
        padding: '14px 28px',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: '#ffffff',
        backgroundColor: '#4f46e5',
        border: 'none',
        borderRadius: '999px',
        cursor: 'pointer',
        boxShadow: '0 12px 30px rgba(79, 70, 229, 0.18)',
    },
    errorMessage: {
        margin: 0,
        fontWeight: 600,
        color: '#dc2626',
    },
    successMessage: {
        margin: 0,
        fontWeight: 600,
        color: '#16a34a',
    },
};

export default ProfileTab;