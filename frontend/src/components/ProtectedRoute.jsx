// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner} />
                <p style={styles.loadingText}>Chargement...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const styles = {
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        gap: '1rem',
    },
    loadingSpinner: {
        width: 50,
        height: 50,
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #16a34a',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        fontSize: '1.125rem',
        color: '#16a34a',
        fontWeight: '500',
    },
};

// Animation spin injectée une seule fois
if (!document.getElementById('__protected-route-style')) {
    const s = document.createElement('style');
    s.id = '__protected-route-style';
    s.textContent = '@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}';
    document.head.appendChild(s);
}

export default ProtectedRoute;