// src/components/Home/ProductCard.jsx
import React, { useState } from 'react';

const ProductCard = ({
    produit,
    onComment,
    onFavorite,
    onClickCard,
    isFavorite = false,
    user
}) => {
    const [hovered, setHovered] = useState(false);

    const nom = produit?.nom || 'Produit sans nom';

    console.log("image raw value:", produit?.image);
    // Dans votre ProductCard.jsx, ajoutez plus de logs
    const getImageUrl = (image) => {
        if (!image) return null;

        if (image.startsWith('data:image')) {
            return image;
        }

        console.log("Chemin original:", image);
        const normalized = image.replace(/\\/g, '/');
        console.log("Chemin normalisé:", normalized);

        // Si le chemin contient déjà 'uploads/', ne pas ajouter de slash supplémentaire
        let path = normalized;
        if (!path.startsWith('http') && !path.startsWith('/')) {
            path = `/${path}`;
        }

        const finalUrl = `http://localhost:5000${path}`;
        console.log("URL finale:", finalUrl);
        return finalUrl;
    };
    const imageUrl = getImageUrl(produit?.image);

    const sousTitre = produit?.marque || produit?.brand || 'Marque non spécifiée';

    const isConsommateur = user?.role === 'consommateur';

    const handleFavorite = (e) => {
        e.stopPropagation();
        if (!user) {
            alert('Vous devez être connecté pour ajouter un favori.');
            return;
        }
        if (!isConsommateur) {
            alert('Seuls les consommateurs peuvent ajouter des favoris.');
            return;
        }
        onFavorite(produit);
    };

    const handleComment = (e) => {
        e.stopPropagation();
        onComment(produit);
    };

    return (
        <div
            style={styles.card}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onClickCard && onClickCard(produit)}
        >
            {/* Image */}
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={nom}
                    style={{
                        ...styles.image,
                        transform: hovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x530?text=';
                    }}
                />
            ) : (
                <div style={styles.noImage}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect x="6" y="10" width="36" height="28" rx="3" stroke="#a0aec0" strokeWidth="1.5" fill="none" />
                        <circle cx="18" cy="20" r="4" stroke="#a0aec0" strokeWidth="1.5" fill="none" />
                        <path d="M6 32 L16 22 L24 30 L30 24 L42 34" stroke="#a0aec0" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                    </svg>
                </div>
            )}

            {/* Icônes actions — apparaissent au survol */}
            <div style={{
                ...styles.actions,
                opacity: hovered ? 1 : 0,
            }}>
                {/* Favori */}
                <button
                    style={styles.iconBtn}
                    onClick={handleFavorite}
                    title="Ajouter aux favoris"
                >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill={isFavorite ? '#e11d48' : 'none'} xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 21C12 21 3 14.5 3 8.5C3 5.46 5.46 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.54 3 23 5.46 23 8.5C23 14.5 12 21 12 21Z"
                            stroke={isFavorite ? '#e11d48' : '#1f2937'}
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {/* Commentaire */}
                <button
                    style={styles.iconBtn}
                    onClick={handleComment}
                    title="Laisser un avis"
                >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                            stroke="#1f2937"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {/* Overlay bas — nom + marque */}
            <div style={styles.overlay}>
                <p style={styles.name}>{nom}</p>
                <p style={styles.subtitle}>{sousTitre}</p>
            </div>
        </div>
    );
};

const styles = {
    card: {
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: '3 / 4',
        backgroundColor: 'var(--bg-main)',
        cursor: 'pointer',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-card)',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        transition: 'transform 0.4s ease',
    },
    noImage: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
    },
    actions: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'opacity 0.2s ease',
    },
    iconBtn: {
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        color: '#ffffff'
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '2rem 1rem 1rem',
        background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)',
    },
    name: {
        margin: '0 0 3px',
        fontSize: '15px',
        fontWeight: '500',
        color: '#ffffff',
        lineHeight: 1.3,
    },
    subtitle: {
        margin: 0,
        fontSize: '12px',
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '400',
    },
};

export default ProductCard;