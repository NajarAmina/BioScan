// src/components/Home/ScannerSection.jsx
import React, { useState } from 'react';
import ResultatAnalyse from '../Shared/ResultatAnalyse';

const ScannerSection = ({ barcode, setBarcode, handleBarcodeScan, scannedProduct, scanError, onResetProduct }) => {
    const [focused, setFocused] = useState(false);

    // Si un produit est sélectionné → affichage détail pleine largeur
    if (scannedProduct) {
        return (
            <section id="scanner" style={styles.section}>
                <div style={styles.bgBlobs}>
                    <div style={styles.blob1} />
                    <div style={styles.blob2} />
                </div>

                <div style={styles.container}>
                    <button onClick={onResetProduct} style={styles.backBtn}>
                        <span style={styles.backArrow}>←</span>
                        Retour à l'analyseur
                    </button>

                    <div style={{ animation: 'fadeInUp 0.45s ease forwards' }}>
                        <ResultatAnalyse product={scannedProduct} />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="scanner" style={styles.section}>
            <div style={styles.bgBlobs}>
                <div style={styles.blob1} />
                <div style={styles.blob2} />
            </div>

            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <span style={styles.badge}>DÉCOUVERTE</span>
                    <h2 style={styles.title}>L'Analyseur</h2>
                    <p style={styles.subtitle}>
                        Tapez ou scannez le code-barres d'un produit pour révéler instantanément sa composition détaillée, son origine et son impact santé.
                    </p>
                </div>

                {/* Scanner */}
                <div style={styles.scannerInterface}>
                    <div style={{
                        ...styles.inputBox,
                        boxShadow: focused
                            ? '0 0 0 4px rgba(22, 163, 74, 0.2)'
                            : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}>
                        <span style={styles.iconScan}>📟</span>
                        <input
                            type="text"
                            value={barcode}
                            onChange={(e) => {
                                const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 13);
                                setBarcode(onlyDigits);
                            }}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            placeholder="Tapez le code-barres de votre produit"
                            style={styles.input}
                            maxLength={13}
                        />
                        <button
                            onClick={handleBarcodeScan}
                            style={{
                                ...styles.btnAnalyze,
                                opacity: barcode.length === 13 ? 1 : 0.6,
                                cursor: barcode.length === 13 ? 'pointer' : 'not-allowed'
                            }}
                            disabled={barcode.length !== 13}
                        >
                            Analyser ⚡
                        </button>
                    </div>

                    {scanError && (
                        <div style={styles.errorBox}>
                            <span style={styles.errorIcon}>⚠️</span>
                            <div>
                                <h4 style={styles.errorTitle}>Produit Introuvable</h4>
                                <p style={styles.errorText}>Aucun produit correspondant n'a été trouvé. Vérifiez le code.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

const styles = {
    section: {
        position: 'relative',
        padding: '6rem 1.5rem',
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
    },
    bgBlobs: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
    },
    blob1: {
        position: 'absolute',
        top: '-10%', left: '-5%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%',
    },
    blob2: {
        position: 'absolute',
        bottom: '-10%', right: '-5%',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%',
    },
    container: {
        position: 'relative',
        zIndex: 1,
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%',
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        padding: '0.6rem 1.25rem',
        backgroundColor: '#fff',
        color: '#1e293b',
        border: '1px solid #e2e8f0',
        borderRadius: '100px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
    },
    backArrow: {
        fontSize: '1.1rem',
        lineHeight: 1,
    },
    header: {
        textAlign: 'left',
        marginBottom: '2rem',
    },
    badge: {
        display: 'inline-block',
        padding: '0.4rem 1.2rem',
        backgroundColor: '#1f2937',
        color: '#fff',
        borderRadius: '2rem',
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        fontWeight: '700',
        marginBottom: '1rem',
    },
    title: {
        fontSize: '3rem',
        fontWeight: '800',
        color: '#0f172a',
        margin: '0 0 1rem 0',
        letterSpacing: '-1px',
    },
    subtitle: {
        fontSize: '1.05rem',
        color: '#64748b',
        maxWidth: '500px',
        margin: '0',
        lineHeight: 1.6,
    },
    scannerInterface: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    inputBox: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: '0.5rem 0.5rem 0.5rem 1.25rem',
        borderRadius: '100px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
    },
    iconScan: { fontSize: '1.5rem', marginRight: '0.75rem', opacity: 0.7 },
    input: {
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: '1.05rem',
        color: '#1e293b',
        letterSpacing: '0.05em',
    },
    btnAnalyze: {
        backgroundColor: '#16a34a',
        color: 'white',
        border: 'none',
        padding: '0.85rem 1.5rem',
        borderRadius: '100px',
        fontWeight: '700',
        fontSize: '1rem',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
        transition: 'all 0.2s',
    },
    errorBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: '#fef2f2',
        borderLeft: '4px solid #ef4444',
        padding: '1.25rem',
        borderRadius: '0.75rem',
        marginTop: '1rem',
    },
    errorIcon: { fontSize: '1.5rem' },
    errorTitle: { margin: '0 0 0.25rem 0', color: '#991b1b', fontSize: '1rem', fontWeight: '700' },
    errorText: { margin: 0, color: '#b91c1c', fontSize: '0.9rem' },
};

export default ScannerSection;