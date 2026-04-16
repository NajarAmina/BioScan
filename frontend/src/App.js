// src/App.jsx  — extrait routing
//
// ConsumerDashboard.jsx est supprimé.
// ProtectedRoute remplace toute vérification manuelle via localStorage.
//
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import SupplierDashboard from './pages/SupplierDashboard';

// Pages pour le consommateur
import FavoritesPage from './components/Home/FavoritesPage';
import HistoryPage from './components/Home/HistoryPage';
import ProfilePage from './components/Home/ProfilePage';
import ProductCommentsPage from './components/Home/ProductCommentsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>

          {/* ── Routes publiques ──────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ── Home : visiteur (non connecté) OU consommateur ───────── */}
          {/*    Pas de ProtectedRoute ici : un visiteur non connecté     */}
          {/*    peut aussi accéder à Home.                               */}
          <Route path="/" element={<Home />} />

          {/* ── Route consommateur explicitement protégée ─────────────  */}
          {/*    Utile si tu veux un lien direct /espace-consommateur.    */}
          <Route
            path="/consommateur"
            element={
              <ProtectedRoute allowedRoles={['consommateur']}>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* ── Dashboards protégés par rôle ─────────────────────────── */}
          <Route
            path="/dashboard/AdminDashboard"
            element={
              <ProtectedRoute allowedRoles={['administrateur']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/AgentDashboard"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/SupplierDashboard"
            element={
              <ProtectedRoute allowedRoles={['fournisseur']}>
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Nouvelles Pages Consommateur ─────────────────────────── */}
          <Route path="/favoris" element={<FavoritesPage />} />
          <Route path="/historique" element={<HistoryPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/commentaires" element={<ProductCommentsPage />} />

          {/* ── Fallback ─────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
}