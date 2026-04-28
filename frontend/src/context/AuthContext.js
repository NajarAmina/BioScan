import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

const API_AUTH = 'http://localhost:5000/api/auth';

export const ROLES = {
  VISITEUR: 'visiteur',
  CONSOMMATEUR: 'consommateur',
  FOURNISSEUR: 'fournisseur',
  AGENT: 'agent',
  ADMINISTRATEUR: 'administrateur'
};

// ✅ Normalise user — accepte id OU _id (MongoDB)
const normalizeStoredUser = (u) => {
  if (!u) return null;
  const id = u.id || u._id; // ✅ accepte les deux formats
  return { ...u, id: String(id), _id: String(id) };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(normalizeStoredUser(parsedUser));
      }
    } catch (error) {
      console.error('❌ AuthContext: Erreur de parsing user:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout global si le token a expiré
  useEffect(() => {
    const onExpired = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  // ---------- LOGIN ----------
  const login = async (email, password) => {
    const res = await fetch(`${API_AUTH}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(),
        password
      }),
      credentials: 'include'
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        data.message === 'Erreur serveur' && data.error
          ? `${data.message} (${data.error})`
          : data.message || 'Erreur de connexion';
      throw new Error(msg);
    }

    const u = normalizeStoredUser(data.user);
    if (data.token) localStorage.setItem('token', data.token);
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    return u;
  };

  // ---------- REGISTER ----------
  const register = async (userData) => {
    const res = await fetch(`${API_AUTH}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: userData.nom,
        prenom: userData.prenom,
        email: String(userData.email).trim().toLowerCase(),
        password: userData.password,
        role: userData.role
      }),
      credentials: 'include'
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        data.message === 'Erreur serveur' && data.error
          ? `${data.message} (${data.error})`
          : data.message || "Erreur lors de l'inscription";
      throw new Error(msg);
    }

    const u = normalizeStoredUser(data.user);
    if (data.token) localStorage.setItem('token', data.token);
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    return u;
  };

  // ---------- FORGOT PASSWORD ----------
  const forgotPassword = async (email) => {
    const res = await fetch(`${API_AUTH}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Erreur lors de la récupération du mot de passe');
    return data;
  };

  // ---------- RESET PASSWORD ----------
  const resetPassword = async (token, newPassword) => {
    const res = await fetch(`${API_AUTH}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: newPassword }),
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Erreur lors de la réinitialisation du mot de passe');
    return data;
  };

  // ---------- LOGOUT ----------
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // ---------- UPDATE USER ----------
  const updateUser = (updatedData) => {
    if (!user) return null;
    const updatedUser = normalizeStoredUser({ ...user, ...updatedData });
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  // ---------- CHECK ROLE ----------
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return Array.isArray(allowedRoles)
      ? allowedRoles.includes(user.role)
      : user.role === allowedRoles;
  };

  const value = {
    user,
    loading,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    updateUser,
    hasRole,
    isAuthenticated: !!user,
    isVisiteur: user?.role === ROLES.VISITEUR,
    isConsommateur: user?.role === ROLES.CONSOMMATEUR,
    isFournisseur: user?.role === ROLES.FOURNISSEUR,
    isAgent: user?.role === ROLES.AGENT,
    isAdmin: user?.role === ROLES.ADMINISTRATEUR
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
