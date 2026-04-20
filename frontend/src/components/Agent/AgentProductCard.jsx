// src/components/Agent/ProductCard.jsx
import React, { useState } from 'react';
import '../Agent/ProductManagement.css';

const ProductCard = ({
    product,
    isEditing = false,
    children,
    onEdit,
    onDelete,
    onAccept,
    onRefuse,
    onClickCard,
    pending = false,
}) => {
    const [hovered, setHovered] = useState(false);
    const isPending = pending || (!!onAccept && !!onRefuse);

    // Fonction MapsLink intégrée
    const MapsLink = ({ localisation }) => {
        if (!localisation?.lat || !localisation?.lng) return null;
        const url = `https://www.google.com/maps?q=${localisation.lat},${localisation.lng}`;
        return (
            <a href={url} target="_blank" rel="noreferrer" className="pm-maps-link">
                🗺️ Voir sur Google Maps
            </a>
        );
    };

    const cardClass = [
        'pm-card',
        isPending ? 'pending' : '',
        onClickCard ? 'clickable' : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            className={cardClass}
            onClick={onClickCard ? () => onClickCard(product) : undefined}
            onMouseEnter={() => onClickCard && setHovered(true)}
            onMouseLeave={() => onClickCard && setHovered(false)}
            style={onClickCard && hovered ? { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(59, 130, 246, 0.12)' } : undefined}
        >
            {isEditing ? (
                children
            ) : (
                <div className="pm-card-row">
                    {product.image && (
                        <img src={product.image} alt={product.nom} className="pm-product-img" />
                    )}

                    <div className="pm-card-body">
                        <div className="pm-card-header">
                            <h3 className="pm-card-title">{product.nom}</h3>
                            {product.origine && <span className="pm-badge">{product.origine}</span>}
                            {isPending && (
                                <span className="pm-badge pending">
                                    En attente
                                </span>
                            )}
                        </div>

                        <p className="pm-card-desc">{product.description}</p>
                        {product.code_barre && (
                            <p className="pm-meta">
                                <span className="pm-meta-icon">🔖</span> {product.code_barre}
                            </p>
                        )}

                        {product.ingredients && (
                            <p className="pm-meta">
                                <span className="pm-meta-icon">🧪</span> {Array.isArray(product.ingredients)
                                    ? product.ingredients.map(i => typeof i === 'object' ? (i.nom || i) : i).filter(Boolean).join(', ')
                                    : product.ingredients}
                            </p>
                        )}

                        {product.pointsDeVente?.length > 0 && (
                            <p className="pm-meta">
                                <span className="pm-meta-icon">📍</span> {product.pointsDeVente.map(pv =>
                                    typeof pv === 'object' ? (pv.nom || pv.adresse || '') : pv
                                ).filter(Boolean).join(', ')}
                            </p>
                        )}

                        <MapsLink localisation={product.localisation} />

                        {isPending && (
                            <p className="pm-submitter">
                                Soumis par : {product.createdByName || product.createdBy?.nom || 'Fournisseur'}
                            </p>
                        )}
                    </div>

                    <div className="pm-card-actions">
                        {isPending ? null : (
                            <>
                                <button onClick={onEdit} className="pm-btn pm-btn-edit"> Modifier</button>
                                <button onClick={onDelete} className="pm-btn pm-btn-danger"> Supprimer</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCard;