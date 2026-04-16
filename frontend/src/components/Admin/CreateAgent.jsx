import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiUserPlus, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const CreateAgent = () => {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: formData.nom,
                    prenom: formData.prenom,
                    email: formData.email,
                    password: formData.password,
                    role: 'agent' 
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Erreur lors de la création de l\'agent.');
            }

            setSuccess('Le profil de l\'Agent a été créé avec succès !');
            setFormData({
                nom: '',
                prenom: '',
                email: '',
                password: '',
                confirmPassword: ''
            });

        } catch (err) {
            console.error('Erreur creation agent:', err);
            setError(err.message || 'Erreur lors de la création. Cet email est peut-être déjà utilisé.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.iconContainer}>
                        <FiUserPlus size={28} color="var(--accent-color, #3b82f6)" />
                    </div>
                    <h2 style={styles.title}>Nouvel Agent de Saisie</h2>
                    <p style={styles.subtitle}>
                        Créez un profil officiel. Ce compte aura accès à l'espace de gestion et d'analyse.
                    </p>
                </div>

                {error && (
                    <div style={styles.errorBanner}>
                        <FiAlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div style={styles.successBanner}>
                        <FiCheckCircle size={18} />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nom</label>
                            <div style={styles.inputWrapper}>
                                <FiUser style={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    style={styles.input}
                                    className="custom-input"
                                    placeholder="Nom de famille"
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Prénom</label>
                            <div style={styles.inputWrapper}>
                                <FiUser style={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    style={styles.input}
                                    className="custom-input"
                                    placeholder="Prénom"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Adresse Email</label>
                        <div style={styles.inputWrapper}>
                            <FiMail style={styles.inputIcon} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={styles.input}
                                className="custom-input"
                                placeholder="agent@plateforme.com"
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mot de passe</label>
                            <div style={styles.inputWrapper}>
                                <FiLock style={styles.inputIcon} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={styles.input}
                                    className="custom-input"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Confirmation</label>
                            <div style={styles.inputWrapper}>
                                <FiLock style={styles.inputIcon} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    style={styles.input}
                                    className="custom-input"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        style={{
                            ...styles.submitBtn,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }} 
                        className="custom-submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Création en cours...' : 'Créer le profil Agent'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAgent;

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.5s ease-out'
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '650px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '2.5rem',
    },
    iconContainer: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: '18px',
        borderRadius: '50%',
        marginBottom: '1.2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        margin: '0 0 0.6rem 0',
        fontSize: '1.8rem',
        color: '#111827',
        fontWeight: '800',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        margin: 0,
        color: '#4b5563',
        fontSize: '0.95rem',
        maxWidth: '85%',
        lineHeight: 1.6,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '22px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#4b5563',
        marginLeft: '4px',
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: '16px',
        color: '#9ca3af',
        fontSize: '1.15rem',
        pointerEvents: 'none',
        transition: 'color 0.3s',
    },
    input: {
        width: '100%',
        padding: '14px 16px 14px 46px',
        borderRadius: '12px',
        border: '1.5px solid #d1d5db',
        backgroundColor: '#f9fafb',
        color: '#111827',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box'
    },
    submitBtn: {
        marginTop: '1.5rem',
        padding: '16px 24px',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1.05rem',
        fontWeight: '700',
        transition: 'all 0.2s',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        borderRadius: '12px',
        marginBottom: '24px',
        fontSize: '0.95rem',
        fontWeight: '500',
        border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    successBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        color: '#22c55e',
        borderRadius: '12px',
        marginBottom: '24px',
        fontSize: '0.95rem',
        fontWeight: '500',
        border: '1px solid rgba(34, 197, 94, 0.2)',
    }
};

// Injection d'un CSS global pour les petites animations et pseudo-classes
const globalStyles = `
    .custom-input:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
        background-color: #ffffff !important;
    }
    .custom-input:focus + svg, .custom-input:focus ~ svg {
        color: #3b82f6 !important;
    }
    .custom-submit-btn {
        box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
    }
    .custom-submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
    .custom-submit-btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

if (typeof document !== 'undefined') {
    // Éviter de dupliquer si le composant est monté plusieurs fois
    if (!document.getElementById('create-agent-styles')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = 'create-agent-styles';
        styleSheet.innerText = globalStyles;
        document.head.appendChild(styleSheet);
    }
}
