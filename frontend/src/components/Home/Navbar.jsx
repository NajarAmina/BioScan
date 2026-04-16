// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiHeart, FiClock, FiLogOut, FiSun, FiMoon, FiHome } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({
  user,
  favoritesCount = 0,
  onFavoritesClick,
  onHistoryClick,
  onProfileClick,
  onLogout,
  variant = 'transparent'
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ✅ Responsive correct : écoute le resize en temps réel
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ferme le menu mobile quand on passe en desktop
  useEffect(() => {
    if (!isMobile) setIsMobileMenuOpen(false);
  }, [isMobile]);

  return (
    <nav style={{ ...styles.navbar, ...(variant === 'solid' ? styles.navbarSolid : {}) }}>
      <div style={styles.container}>

        {/* Logo */}
        <div style={styles.logo} onClick={() => navigate('/')}>
          <img
            src="/logo.png"
            alt="BioScan Logo"
            style={styles.logoImage}
          />

          <img
            src="/BioScan2.png"   // ton deuxième logo
            alt="Second Logo"
            style={styles.logoImage}
          />
        </div>

        {/* Menu Desktop */}
        {!isMobile && (
          <div style={styles.desktopMenu}>
            <button style={styles.iconButton} onClick={() => navigate('/')} title="Accueil">
              <FiHome size={20} />
            </button>
            <button style={styles.iconButton} onClick={toggleTheme} title="Changer le thème">
              {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            {user ? (
              <>
                {user?.role === 'consommateur' && (
                  <>
                    <button style={styles.iconButton} onClick={onFavoritesClick} title="Favoris">
                      <FiHeart size={22} style={favoritesCount > 0 ? { fill: '#ffffff' } : {}} />
                      {favoritesCount > 0 && <span style={styles.badge}>{favoritesCount}</span>}
                    </button>
                    <button style={styles.iconButton} onClick={onHistoryClick} title="Historique">
                      <FiClock size={22} />
                    </button>
                  </>
                )}
                <button style={styles.iconButton} onClick={onProfileClick} title="Mon profil">
                  <FiUser size={22} />
                </button>
                <button style={styles.iconButton} onClick={onLogout} title="Déconnexion">
                  <FiLogOut size={22} />
                </button>
              </>
            ) : (
              <>
                <button style={styles.navLinkWhite} onClick={() => navigate('/login')}>
                  Connexion
                </button>
                <button style={styles.navLinkWhite} onClick={() => navigate('/register')}>
                  Inscription
                </button>
              </>
            )}
          </div>
        )}

        {/* Burger icon — visible sur mobile uniquement */}
        {isMobile && (
          <button
            style={styles.burgerBtn}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        )}
      </div>

      {/* Menu déroulant mobile */}
      {isMobile && isMobileMenuOpen && (
        <div style={styles.mobileMenu}>
          <button style={styles.mobileLink} onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}>
            🏠 Accueil
          </button>
          <button style={styles.mobileLink} onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}>
            {theme === 'dark' ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
          </button>
          {user?.role === 'consommateur' && (
            <>
              <button style={styles.mobileLink} onClick={() => { onFavoritesClick(); setIsMobileMenuOpen(false); }}>
                Favoris {favoritesCount > 0 && `(${favoritesCount})`}
              </button>
              <button style={styles.mobileLink} onClick={() => { onHistoryClick(); setIsMobileMenuOpen(false); }}>
                Historique
              </button>
            </>
          )}
          {user ? (
            <>
              <button style={styles.mobileLink} onClick={() => { onProfileClick(); setIsMobileMenuOpen(false); }}>
                Mon profil
              </button>
              <button style={{ ...styles.mobileLink, color: '#ef4444' }} onClick={onLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <button style={styles.mobileLink} onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>
                Connexion
              </button>
              <button style={styles.mobileLink} onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}>
                Inscription
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
    top: 0,
    zIndex: 1000,
  },
  navbarSolid: {
    background: 'linear-gradient(135deg, var(--primary, #10b981), #064e3b)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1.2rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  logoImage: {
    height: '38px',
    width: 'auto',
    objectFit: 'contain',
  },
  logoImageSmall: {
    height: '45px',
    width: 'auto',
    objectFit: 'contain',
    opacity: 0.9
  },
  desktopMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#ffffff',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.2rem',
    transition: 'opacity 0.2s',
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-8px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    borderRadius: '50%',
    minWidth: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLinkWhite: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#ffffff',
    fontWeight: '500',
    padding: '0.4rem 0.6rem',
    transition: 'opacity 0.2s',
  },
  burgerBtn: {
    background: 'none', border: 'none', fontSize: '1.6rem',
    cursor: 'pointer', color: '#ffffff', lineHeight: 1,
  },
  mobileMenu: {
    display: 'flex', flexDirection: 'column',
    padding: '0.75rem 1.5rem 1rem',
    borderTop: '1px solid #f3f4f6',
    gap: '0.25rem',
    backgroundColor: '#ffffff',
  },
  mobileLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    textAlign: 'left', padding: '0.6rem 0.25rem',
    fontSize: '1rem', color: '#374151', fontWeight: '500',
    borderBottom: '1px solid #f3f4f6',
  },
};

export default Navbar;
