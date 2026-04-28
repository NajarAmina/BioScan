import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

// ✅ Détecte automatiquement si on est sur PC ou téléphone
const getApiUrl = () => {
  const hostname = window.location.hostname;
  // Si on accède depuis une IP locale (téléphone) → utilise cette IP avec port 5000
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:5000`;
  }
  // Si on est sur PC → utilise le proxy localhost
  return 'http://localhost:5000';
};

const API_URL = getApiUrl();

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Lien invalide. Utilisez le lien reçu par email.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      // ✅ Utilise l'URL complète au lieu du chemin relatif
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Impossible de mettre à jour le mot de passe');
      }
      setSuccess(data.message || 'Mot de passe mis à jour.');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Nouveau mot de passe</h2>
        <p style={styles.infoText}>
          Choisissez un nouveau mot de passe pour votre compte. Le lien reçu par email expire après 1 heure.
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {!token ? (
          <p style={styles.text}>
            <Link to="/login" style={styles.link}>Retour à la connexion</Link>
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                style={styles.input}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <small style={styles.hint}>Minimum 6 caractères</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                style={styles.input}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
            </button>
          </form>
        )}

        <p style={styles.text}>
          <Link to="/login" style={styles.link}>← Retour à la connexion</Link>
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
    backgroundColor: '#f5f5f5',
    padding: '1rem'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '450px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '16px',
    color: '#1f2937',
    fontSize: '2rem',
    fontWeight: '700'
  },
  infoText: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
    lineHeight: '1.5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.875rem'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  button: {
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '10px'
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #fecaca',
    fontWeight: '500',
    fontSize: '0.875rem'
  },
  success: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #bbf7d0',
    fontWeight: '500',
    fontSize: '0.875rem'
  },
  hint: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    marginTop: '4px',
    display: 'block'
  },
  text: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  link: {
    color: '#16a34a',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default ResetPassword;
