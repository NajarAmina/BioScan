import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'consommateur'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('📝 Tentative d\'inscription:', formData);

    // Validations
    if (!formData.nom || !formData.prenom || !formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      // 🔴 UTILISER la fonction register du contexte
      const userData = await register(formData);

      console.log('Inscription réussie:', userData);
      setSuccess('Inscription réussie ! Redirection...');

      // 🔴 REDIRECTION SELON LE RÔLE
      setTimeout(() => {
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
          default:
            navigate('/', { replace: true });
        }
      }, 1500);

    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setError(error.message || 'Erreur lors de l\'inscription. Cet email existe peut-être déjà.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Inscription</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nom *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                style={styles.input}
                placeholder="Votre nom"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Prénom *</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                style={styles.input}
                placeholder="Votre prénom"
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Type de compte *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="consommateur">Consommateur</option>
              <option value="fournisseur">Fournisseur</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirmer le mot de passe *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            S'inscrire
          </button>
        </form>

        <p style={styles.text}>
          Déjà un compte? <Link to="/login" style={styles.link}>Se connecter</Link>
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
    padding: '20px',
    position: 'relative'
  },
  card: {
    backgroundColor: 'var(--bg-card)',
    padding: '45px 40px',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-light)',
    width: '100%',
    maxWidth: '550px',
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
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  formGroup: {
    marginBottom: '20px'
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
  button: {
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1.05rem',
    fontWeight: '700',
    marginTop: '15px',
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
    fontWeight: '500'
  },
  success: {
    backgroundColor: 'transparent',
    color: 'var(--accent-color)',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid var(--accent-color)',
    fontWeight: '500'
  },
  text: {
    textAlign: 'center',
    marginTop: '20px',
    color: 'var(--text-muted)'
  },
  link: {
    color: 'var(--accent-color)',
    textDecoration: 'underline',
    fontWeight: '700'
  }
};

export default Register;