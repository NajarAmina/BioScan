import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EyeIcon = ({ visible }) =>
  visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

// ✅ Style global injecté une seule fois pour supprimer l'œil natif du navigateur
const hideNativeEyeStyle = `
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear {
    display: none !important;
  }
  input[type="password"]::-webkit-credentials-auto-fill-button,
  input[type="password"]::-webkit-strong-password-auto-fill-button {
    display: none !important;
  }
`;

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDevResetUrl('');
    setResetLoading(true);

    if (!resetEmail.trim()) {
      setError('Veuillez entrer votre email');
      setResetLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim().toLowerCase() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data.message === 'Erreur serveur' && data.error
            ? `${data.message} (${data.error})`
            : data.message || "Impossible d'envoyer la demande";
        throw new Error(msg);
      }
      setSuccess(
        data.message ||
          'Si un compte existe pour cet email, vous recevrez un message avec un lien de réinitialisation.'
      );
      if (data.resetUrl) setDevResetUrl(data.resetUrl);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      const userData = await login(email, password);

      switch (userData.role.toLowerCase()) {
        case 'administrateur':
          navigate('/dashboard/AdminDashboard', { replace: true });
          break;
        case 'consommateur':
          navigate('/', { replace: true });
          break;
        case 'fournisseur':
          navigate('/dashboard/SupplierDashboard', { replace: true });
          break;
        case 'agent':
        case 'agent_saisie':
          navigate('/dashboard/AgentDashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  if (showResetForm) {
    return (
      <div style={styles.container}>
        {/* ✅ Supprime l'œil natif du navigateur */}
        <style>{hideNativeEyeStyle}</style>

        <div style={styles.card}>
          <h2 style={styles.title}>Mot de passe oublié</h2>

          {error && <div style={styles.error}>{error}</div>}

          {!success ? (
            <form onSubmit={handleForgotPassword} style={styles.form}>
              <p style={styles.infoText}>
                Entrez l'adresse email de votre compte. Si elle est reconnue, vous recevrez un lien pour choisir un nouveau mot de passe.
              </p>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setError('');
                  }}
                  style={styles.input}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  ...styles.button,
                  opacity: resetLoading ? 0.7 : 1,
                  cursor: resetLoading ? 'not-allowed' : 'pointer'
                }}
                disabled={resetLoading}
              >
                {resetLoading ? 'Envoi en cours…' : 'Envoyer le lien par email'}
              </button>
            </form>
          ) : (
            <div style={{ ...styles.success, whiteSpace: 'pre-line' }} role="status">
              {success}
              {devResetUrl ? (
                <div style={{ marginTop: '12px' }}>
                  <a
                    href={devResetUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.resetLink}
                  >
                    Ouvrir le lien de réinitialisation (dev)
                  </a>
                </div>
              ) : null}
            </div>
          )}

          <p style={styles.text}>
            <button
              type="button"
              onClick={() => {
                setShowResetForm(false);
                setResetEmail('');
                setSuccess('');
                setDevResetUrl('');
                setError('');
              }}
              style={styles.backLink}
            >
              ← Retour à la connexion
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ✅ Supprime l'œil natif du navigateur (Chrome, Edge, Safari) */}
      <style>{hideNativeEyeStyle}</style>

      <div style={styles.card}>
        <h2 style={styles.title}>Connexion</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              style={styles.input}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe</label>
            <div style={styles.passwordWrapper}>
              <input
                // ✅ Quand showPassword=true → type="text" (pas d'œil natif)
                // Quand showPassword=false → type="password" + CSS masque l'œil natif
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                style={styles.passwordInput}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              {/* ✅ Notre seul et unique bouton œil */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={styles.eyeButton}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </div>

          <p style={styles.forgotPassword}>
            <button
              type="button"
              onClick={() => setShowResetForm(true)}
              style={styles.forgotLink}
            >
              Mot de passe oublié ?
            </button>
          </p>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.text}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={styles.link}>
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-main)',
    padding: '1rem',
    position: 'relative'
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    padding: '45px 40px',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-light)',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid var(--border-color)',
    zIndex: 1
  },
  title: {
    textAlign: 'center',
    marginBottom: '35px',
    color: 'var(--text-primary)',
    fontSize: '2.2rem',
    fontWeight: '800',
    letterSpacing: '-0.5px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: 'var(--bg-input)',
    border: '1.5px solid var(--border-input)',
    borderRadius: '12px',
    fontSize: '14.5px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease',
    color: 'var(--text-primary)'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  passwordInput: {
    width: '100%',
    padding: '14px 44px 14px 16px',
    backgroundColor: 'var(--bg-input)',
    border: '1.5px solid var(--border-input)',
    borderRadius: '12px',
    fontSize: '14.5px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease',
    color: 'var(--text-primary)',
    MsRevealPassword: 'none',
  },
  eyeButton: {
    position: 'absolute',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-muted)',
    lineHeight: 1
  },
  button: {
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1.05rem',
    fontWeight: '700',
    marginTop: '10px',
    transition: 'transform 0.1s, opacity 0.2s',
    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.2)'
  },
  error: {
    backgroundColor: 'transparent',
    color: '#ef4444',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #ef4444',
    fontWeight: '500',
    fontSize: '0.875rem'
  },
  success: {
    backgroundColor: 'transparent',
    color: 'var(--accent-color)',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid var(--accent-color)',
    fontWeight: '500',
    fontSize: '0.875rem',
    lineHeight: '1.5'
  },
  text: {
    textAlign: 'center',
    marginTop: '20px',
    color: 'var(--text-muted)',
    fontSize: '0.875rem'
  },
  link: {
    color: 'var(--accent-color)',
    textDecoration: 'underline',
    fontWeight: '700'
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-color)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '700',
    padding: 0,
    textDecoration: 'underline'
  },
  forgotPassword: {
    textAlign: 'right',
    margin: '-10px 0 15px 0'
  },
  forgotLink: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    padding: 0,
    textDecoration: 'none'
  },
  resetLink: {
    color: 'var(--accent-color)',
    textDecoration: 'underline',
    fontWeight: '700'
  },
  infoText: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
    lineHeight: '1.5'
  }
};

export default Login;
