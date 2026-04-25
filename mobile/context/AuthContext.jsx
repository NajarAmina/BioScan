// mobile/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext(null);

const API_AUTH = '/auth';

export const ROLES = {
  VISITEUR: 'visiteur',
  CONSOMMATEUR: 'consommateur',
};

const normalizeStoredUser = (u) => (u ? { ...u, id: String(u.id || u._id) } : null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charge le user stocké au démarrage
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) setUser(normalizeStoredUser(JSON.parse(storedUser)));
      } catch {
        await AsyncStorage.multiRemove(['user', 'token']);
      } finally {
        setLoading(false);
      }
    };
    loadAuth();
  }, []);

  // ---------- LOGIN ----------
  const login = async (email, password) => {
    const res = await api.post(`${API_AUTH}/login`, {
      email: String(email).trim().toLowerCase(),
      password,
    });
    const { token, user: userData } = res.data;
    const u = normalizeStoredUser(userData);
    if (token) await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  // ---------- REGISTER ----------
  const register = async (userData) => {
    const res = await api.post(`${API_AUTH}/register`, {
      nom: userData.nom,
      prenom: userData.prenom,
      email: String(userData.email).trim().toLowerCase(),
      password: userData.password,
      role: userData.role,
    });
    const { token, user: newUser } = res.data;
    const u = normalizeStoredUser(newUser);
    if (token) await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  // ---------- FORGOT PASSWORD ----------
  const forgotPassword = async (email) => {
    const res = await api.post(`${API_AUTH}/forgot-password`, { email });
    return res.data;
  };

  // ---------- LOGOUT ----------
  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  // ---------- UPDATE USER ----------
  const updateUser = async (updatedData) => {
    if (!user) return null;
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
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
    logout,
    updateUser,
    hasRole,
    isAuthenticated: !!user,
    isVisiteur: user?.role === ROLES.VISITEUR,
    isConsommateur: user?.role === ROLES.CONSOMMATEUR,
    isFournisseur: user?.role === ROLES.FOURNISSEUR,
    isAgent: user?.role === ROLES.AGENT,
    isAdmin: user?.role === ROLES.ADMINISTRATEUR,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
