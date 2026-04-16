import React from 'react';
import { FiHeart, FiTrash2, FiX } from 'react-icons/fi';

const FavoritesModal = ({ favorites, onClose, onRemoveFavorite }) => {
  // ✅ Récupère l'id réel du produit (_id MongoDB)
  const getProductId = (product) =>
    product?._id || product?.id_produit || product?.id;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <FiHeart style={{ marginRight: '10px', color: '#ef4444' }} /> Mes Favoris
          </h2>
          <button onClick={onClose} style={styles.closeBtn}><FiX /></button>
        </div>

        {favorites.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}><FiHeart /></span>
            <p style={styles.emptyText}>Aucun favori pour le moment.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {favorites.map((product) => {
              const productId = getProductId(product);
              return (
                <div key={productId} style={styles.card}>
                  {/* Image */}
                  {product.image ? (
                    <img src={product.image} alt={product.nom} style={styles.image} />
                  ) : (
                    <div style={{...styles.image, backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                       <FiHeart color="var(--text-muted)"/>
                    </div>
                  )}

                  {/* Infos produit */}
                  <div style={styles.info}>
                    <h4 style={styles.productName}>{product.nom}</h4>
                    {product.description && (
                      <p style={styles.productDesc}>{product.description}</p>
                    )}
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    style={styles.removeBtn}
                    onClick={() => onRemoveFavorite(productId)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <FiTrash2 size={16} /> Retirer
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    justifyContent: 'center', alignItems: 'center', zIndex: 1050,
  },
  modal: {
    backgroundColor: 'var(--bg-glass, var(--bg-card))', padding: '24px', borderRadius: '20px',
    width: '90%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '24px',
  },
  title: { margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', fontWeight: 'bold' },
  closeBtn: { 
    border: 'none', background: 'var(--bg-main)', width: '36px', height: '36px', 
    borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', 
    fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)', 
    transition: 'background 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' 
  },
  empty: { textAlign: 'center', padding: '3rem 1rem' },
  emptyIcon: { fontSize: '4rem', display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'rgba(239, 68, 68, 0.5)' },
  emptyText: { color: 'var(--text-secondary)', fontSize: '1.1rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: {
    display: 'flex', alignItems: 'center', gap: '16px',
    border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px',
    backgroundColor: 'var(--bg-main)', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  image: { width: '70px', height: '70px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0 },
  info: { flex: 1 },
  productName: { margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' },
  productDesc: { 
    margin: '6px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)', 
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' 
  },
  removeBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', backgroundColor: 'transparent', color: '#ef4444',
    border: '1px solid #ef4444', borderRadius: '10px', cursor: 'pointer',
    fontWeight: '600', fontSize: '0.9rem', flexShrink: 0, transition: 'all 0.2s',
  },
};

export default FavoritesModal;
