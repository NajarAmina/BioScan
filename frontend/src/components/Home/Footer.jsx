// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.footerGrid}>
                    {/* À propos */}
                    <div>
                        <h3 style={{ color: 'white', marginBottom: '0.75rem' }}>🌱 BioScan </h3>
                        <p style={styles.footerText}>
                            Plateforme intelligente pour analyser, tracer et sécuriser vos produits alimentaires grâce à l'IA.
                        </p>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '0.75rem' }}>Contact</h4>
                        <p style={styles.footerText}>📧 support@BioScan.com</p>
                        <p style={styles.footerText}>📞 +33 1 23 45 67 89</p>
                        <p style={styles.footerText}>📍 Medenine, Tunis </p>
                    </div>

                    {/* Réseaux sociaux */}
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '0.75rem' }}>Suivez-nous</h4>
                        {['Facebook', 'Twitter'].map((social) => (
                            <a key={social} href="#!" style={styles.footerLink}>{social}</a>
                        ))}
                    </div>
                </div>

                <p style={{ ...styles.footerText, textAlign: 'center', borderTop: '1px solid #374151', paddingTop: '1rem', marginTop: '1rem' }}>
                    © 2026 FoodTrace AI. Tous droits réservés.
                </p>
            </div>
        </footer>
    );
};

const styles = {
    footer: { backgroundColor: '#111827', color: 'white', padding: '3rem 2rem 1.5rem' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' },
    footerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', marginBottom: '1.5rem' },
    footerText: { fontSize: '0.875rem', color: '#9ca3af', lineHeight: 1.7, marginBottom: '0.4rem' },
    footerLink: {
        display: 'block', color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem', lineHeight: 2, transition: 'color 0.2s',
        hover: { color: '#10b981' }
    },
};

export default Footer;