import React, { useState } from 'react';
import ProductCard from './ProductCard';

const ProductsSection = ({
  displayProducts = [],
  searchQuery = '',
  isFavorite = () => false,
  handleAddFavorite = () => { },
  handleOpenComments = () => { },
  getAverageRating = () => 0,
  getProductComments = () => [],
  getScoreColor = () => '#000',
  getRiskColor = () => '#000',
  setSearchQuery = () => { },
  user = null,
  onClickCard = () => { }
}) => {
  const [showAll, setShowAll] = useState(false);
  const safeSearchQuery = searchQuery ? searchQuery.toString() : '';

  const isSearchActive = safeSearchQuery.trim().length > 0;
  const itemsToShow = (showAll || isSearchActive) ? displayProducts : displayProducts.slice(0, 4);

  return (
    <section id="products-section" style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>
          {safeSearchQuery.trim() ? '🔍 Résultats' : 'Nos Produits'}
        </h2>

        {displayProducts.length === 0 ? (
          <div style={styles.noResults}>
            <span style={{ fontSize: '4rem' }}>🔍</span>
            <h3>Aucun produit trouvé</h3>
            <button onClick={() => setSearchQuery('')} style={styles.btnGreen}>
              Voir tous les produits
            </button>
          </div>
        ) : (
          <>
            <div style={styles.productsGrid}>
              {itemsToShow.map((produit) => {
                // ✅ Utilise _id (champ réel MongoDB)
                const productId = produit._id || produit.id_produit || produit.id;
                return (
                  <ProductCard
                    key={productId}
                    produit={produit}
                    user={user}
                    onFavorite={() => handleAddFavorite(produit)}
                    onComment={() => handleOpenComments(produit)}
                    onClickCard={() => onClickCard(produit)}
                    isFavorite={isFavorite(productId)}
                    averageRating={getAverageRating(productId)}
                    commentCount={getProductComments(productId).length}
                    getScoreColor={getScoreColor}
                    getRiskColor={getRiskColor}
                    localisation={produit.localisation}
                  />
                );
              })}
            </div>

            {displayProducts.length > 4 && !isSearchActive && (
              <div style={styles.loadMoreContainer}>
                <button
                  onClick={() => setShowAll(!showAll)}
                  style={styles.btnOutline}
                >
                  {showAll ? 'Voir moins ↑' : 'Voir plus ↓'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

const styles = {
  section: { padding: '4rem 1.5rem', backgroundColor: 'var(--bg-card)' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' },
  sectionTitle: { fontSize: '3rem', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center', marginBottom: '2.5rem' },
  productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' },
  noResults: { textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-main)', borderRadius: '1rem', border: '1px dashed var(--border-color)' },
  btnGreen: { padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', marginTop: '1rem' },
  loadMoreContainer: { display: 'flex', justifyContent: 'flex-start', marginTop: '2.5rem' },
  btnOutline: { padding: '0.7rem 1.4rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1.5px solid var(--border-color)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.2s ease' },
};

export default ProductsSection;
