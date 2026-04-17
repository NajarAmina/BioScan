import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import ResultatAnalyse from '../Shared/ResultatAnalyse';

const ResultatAnalyseModal = ({ product, onClose }) => {
    // Empêcher le défilement de l'arrière-plan
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Fermer si clic sur l'arrière-plan
    const handleOverlayClick = (e) => {
        if (e.target.id === 'modal-overlay') {
            onClose();
        }
    };

    if (!product) return null;

    return (
        <div id="modal-overlay" style={styles.overlay} onClick={handleOverlayClick}>
            {/* Le wrapper permet de centrer et de gérer la taille max */}
            <div style={styles.modalContainer}>

                {/* Bouton de fermeture flottant au-dessus */}
                <button style={styles.closeBtn} onClick={onClose} aria-label="Fermer">
                    <FiX size={24} />
                </button>

                {/* Contenu principal défilable */}
                <div style={styles.contentScroll}>
                    <ResultatAnalyse product={product} />
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeInOverlay 0.3s ease forwards'
    },
    modalContainer: {
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        display: 'flex',
        flexDirection: 'column',
    },
    closeBtn: {
        position: 'absolute',
        top: '-15px',
        right: '-15px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        color: '#0f172a',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        zIndex: 10,
        transition: 'transform 0.2s',
    },
    contentScroll: {
        width: '100%',
        maxHeight: 'calc(90vh - 40px)',
        overflowY: 'auto',
        borderRadius: '1.5rem',
        // Masquer la scrollbar pour un design plus épuré (optionnel)
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
    }
};

export default ResultatAnalyseModal;
