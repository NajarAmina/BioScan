import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

/**
 * Profile — composant partagé Agent + Consommateur
 *
 * Props :
 *   user        — objet utilisateur courant
 *   updateUser  — fonction pour mettre à jour l'utilisateur
 *   onLogout    — (optionnel) callback déconnexion → affiche le bouton Déconnexion
 *   onBack      — (optionnel) callback retour       → affiche le bouton Retour
 */
const Profile = ({ user, updateUser, onLogout, onBack }) => {
    const isAgent = user?.role === 'agent';

    /* ── Formulaire profil ─────────────────────────────────────────────────── */
    const [profileForm, setProfileForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        adresse: '',
    });

    /* ── Formulaire mot de passe ───────────────────────────────────────────── */
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    /* ── Mot de passe oublié ───────────────────────────────────────────────── */
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    /* ── Init formulaire depuis user ───────────────────────────────────────── */
    useEffect(() => {
        if (!user) return;
        setProfileForm({
            nom: user.nom || '',
            prenom: user.prenom || '',
            email: user.email || '',
            adresse: user.adresse || '',
        });
        setResetEmail(user.email || '');
    }, [user]);

    /* ── Handlers ──────────────────────────────────────────────────────────── */
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
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setPasswordError(data.message || 'Erreur lors de la mise à jour.');
                return;
            }
            setPasswordSuccess('Mot de passe mis à jour avec succès !');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch {
            setPasswordError('Erreur réseau. Veuillez réessayer.');
        }
    };

    const handleForgotPassword = async () => {
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
                body: JSON.stringify({ email: emailToSend }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Impossible d'envoyer la demande.");
            setResetSuccess(data.message || 'Si un compte existe pour cet email, vous recevrez un lien de réinitialisation.');
        } catch (err) {
            setResetError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setResetLoading(false);
        }
    };

    const toggleShow = (field) =>
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

    /* ── Labels selon rôle ─────────────────────────────────────────────────── */
    const spaceLabel = isAgent ? 'Espace Agent' : 'Espace Personnel';
    const roleLabel = isAgent ? 'Agent' : 'Consommateur';
    const btnPrimary = isAgent ? styles.primaryButton : styles.primaryButtonGreen;
    const btnSecondary = isAgent ? styles.secondaryButton : styles.secondaryButtonGreen;

    /* ── Rendu ─────────────────────────────────────────────────────────────── */
    return (
        <div style={styles.page}>

            {/* En-tête */}
            <header style={styles.header}>
                <div style={styles.headerText}>
                    {onBack && (
                        <button style={styles.backBtn} type="button" onClick={onBack}>
                            ← Retour
                        </button>
                    )}
                    <p style={styles.subtitle}>{spaceLabel}</p>
                    <h1 style={styles.title}>Mon profil</h1>
                    <p style={styles.description}>
                        Gérez vos informations personnelles et renforcez la sécurité de votre compte.
                    </p>
                </div>

                <div style={styles.profileCard}>
                    <div style={styles.avatar}>
                        {user?.prenom?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={styles.profileDetails}>
                        <p style={styles.profileLabel}>Utilisateur</p>
                        <h3 style={styles.profileName}>
                            {`${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Utilisateur'}
                        </h3>
                        <p style={styles.profileRole}>{roleLabel}</p>
                        <p style={styles.profileEmail}>{user?.email || 'Adresse email non renseignée'}</p>
                    </div>
                </div>
            </header>

            {/* Carte principale */}
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <h2 style={styles.cardTitle}>Informations personnelles</h2>
                    <p style={styles.cardSubtitle}>
                        Mettez à jour vos informations de profil et renforcez la sécurité de votre compte.
                    </p>
                </div>

                {/* Formulaire infos */}
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

                    {/* Adresse — agents uniquement */}
                    {isAgent && (
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

                    <div style={styles.formFooter}>
                        <button type="submit" style={btnPrimary}>
                            Enregistrer les modifications
                        </button>
                        {onLogout && (
                            <button type="button" style={styles.logoutButton} onClick={onLogout}>
                                Déconnexion
                            </button>
                        )}
                    </div>
                </form>

                {/* Section sécurité — tous les rôles */}
                <div style={styles.securitySection}>
                    <div style={styles.subSectionHeader}>
                        <h3 style={styles.subSectionTitle}>Sécurité du compte</h3>
                        <p style={styles.subSectionText}>
                            Changez votre mot de passe pour protéger votre compte.
                        </p>
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
                                    />
                                </div>
                                {resetError && <p style={styles.errorMessage}>⚠️ {resetError}</p>}
                                {resetSuccess && <p style={styles.successMessage}>✅ {resetSuccess}</p>}
                                <div style={styles.resetButtons}>
                                    <button type="button" style={btnSecondary} onClick={() => setShowForgotPassword(false)}>
                                        Annuler
                                    </button>
                                    <button type="button" style={btnPrimary} onClick={handleForgotPassword} disabled={resetLoading}>
                                        {resetLoading ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Mot de passe actuel */}
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
                                        <button type="button" style={styles.eyeButton} onClick={() => toggleShow('current')}>
                                            <EyeIcon open={showPasswords.current} />
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        style={styles.forgotPasswordLink}
                                        onClick={() => { setShowForgotPassword(true); setResetError(''); setResetSuccess(''); }}
                                    >
                                        Mot de passe oublié ?
                                    </button>
                                </div>

                                {/* Nouveau + confirmation */}
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
                                            <button type="button" style={styles.eyeButton} onClick={() => toggleShow('new')}>
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
                                            <button type="button" style={styles.eyeButton} onClick={() => toggleShow('confirm')}>
                                                <EyeIcon open={showPasswords.confirm} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {passwordError && <p style={styles.errorMessage}>⚠️ {passwordError}</p>}
                                {passwordSuccess && <p style={styles.successMessage}>✅ {passwordSuccess}</p>}

                                <button type="submit" style={btnPrimary}>
                                    Mettre à jour le mot de passe
                                </button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

/* ── Styles ──────────────────────────────────────────────────────────────────── */
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
    headerText: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    backBtn: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        fontSize: '0.95rem',
        cursor: 'pointer',
        padding: '0 0 8px 0',
        alignSelf: 'flex-start',
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
        flexShrink: 0,
    },
    profileDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    profileLabel: {
        margin: 0,
        fontSize: '0.85rem',
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
        fontSize: '0.9rem',
        color: '#6b7280',
        wordBreak: 'break-word',
    },
    card: {
        width: '100%',
        padding: '28px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 18px 50px rgba(15, 23, 42, 0.05)',
        boxSizing: 'border-box',
    },
    cardHeader: {
        marginBottom: '24px',
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
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        maxWidth: '1100px',
    },
    formFooter: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: '18px',
    },
    fieldColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    fieldFull: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
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
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease',
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
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease',
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
    },
    forgotPasswordLink: {
        alignSelf: 'flex-end',
        background: 'none',
        border: 'none',
        color: '#4b5563',
        fontSize: '0.85rem',
        cursor: 'pointer',
        padding: '4px 0',
        textDecoration: 'none',
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
        margin: '0 0 6px',
        fontSize: '1rem',
        color: '#111827',
    },
    subSectionText: {
        margin: 0,
        fontSize: '0.95rem',
        lineHeight: 1.6,
        color: '#6b7280',
    },
    resetHint: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
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
        boxShadow: '0 12px 30px rgba(79,70,229,0.18)',
    },
    primaryButtonGreen: {
        width: 'fit-content',
        padding: '14px 28px',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: '#ffffff',
        backgroundColor: '#16a34a',
        border: 'none',
        borderRadius: '999px',
        cursor: 'pointer',
        boxShadow: '0 12px 30px rgba(22,163,74,0.18)',
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
    secondaryButtonGreen: {
        padding: '14px 24px',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: '#15803d',
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '999px',
        cursor: 'pointer',
    },
    logoutButton: {
        padding: '14px 24px',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: '#ef4444',
        backgroundColor: 'transparent',
        border: '1px solid #ef4444',
        borderRadius: '999px',
        cursor: 'pointer',
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

export default Profile;