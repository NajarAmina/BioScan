import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import useFavorites from '../../hooks/useFavorites';
import Navbar from './Navbar';
import Footer from './Footer';
import ProductCard from './ProductCard';
import ResultatAnalyseModal from '../modals/ResultatAnalyseModal';

const FavoritesPage = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const isConsommateur = user?.role === 'consommateur';
    
    // Si pas consommateur, on pourrait rediriger ou afficher un message vide.
    const { favorites, removeFavorite } = useFavorites(user?.id, user?.role);

    const getProductId = (product) =>
        product?._id || product?.id_produit || product?.id;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleComment = (product) => {
        navigate('/commentaires', { state: { product } });
    };

    const [selectedProduct, setSelectedProduct] = useState(null);

    return (
        <div style={styles.pageContainer}>
            <Navbar
                user={user}
                favoritesCount={isConsommateur ? favorites.length : 0}
                onFavoritesClick={() => navigate('/favoris')}
                onHistoryClick={() => navigate('/historique')}
                onProfileClick={() => navigate('/profil')}
                onLogout={handleLogout}
                variant="solid"
            />

            <main style={styles.mainContent}>
                <div style={styles.pageHeader}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}>
                        <FiArrowLeft size={20} /> Retour
                    </button>
                    <h1 style={styles.title}>
                        <FiHeart style={{ color: '#ef4444', marginRight: '12px' }} />
                        Mes Favoris
                    </h1>
                </div>

                <div style={styles.content}>
                    {!isConsommateur ? (
                        <div style={styles.empty}>
                            <p style={styles.emptyText}>Cette page est réservée aux consommateurs.</p>
                        </div>
                    ) : favorites.length === 0 ? (
                        <div style={styles.empty}>
                            <span style={styles.emptyIcon}><FiHeart /></span>
                            <p style={styles.emptyText}>Aucun favori pour le moment. Explorez nos produits et ajoutez-en !</p>
                            <button style={styles.exploreBtn} onClick={() => navigate('/')}>
                                Explorer les produits
                            </button>
                        </div>
                    ) : (
                        <div style={styles.grid}>
                            {favorites.map((product) => {
                                const productId = getProductId(product);
                                return (
                                    <ProductCard
                                        key={productId}
                                        produit={product}
                                        user={user}
                                        isFavorite={true}
                                        onFavorite={() => removeFavorite(productId)}
                                        onComment={() => handleComment(product)}
                                        onClickCard={(p) => setSelectedProduct(p)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Rendu conditionnel de la modale d'analyse */}
            {selectedProduct && (
                <ResultatAnalyseModal 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                />
            )}

            <Footer />
        </div>
    );
};

const styles = {
    pageContainer: {
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        backgroundColor: 'var(--bg-main)'
    },
    mainContent: {
        flex: 1, paddingTop: '100px', paddingBottom: '60px',
        maxWidth: '1200px', margin: '0 auto', width: '100%',
        paddingLeft: '20px', paddingRight: '20px'
    },
    pageHeader: {
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '30px'
    },
    backBtn: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'none', border: 'none', color: 'var(--text-secondary)',
        cursor: 'pointer', fontSize: '1rem', padding: '0',
        marginBottom: '16px', transition: 'color 0.2s'
    },
    title: { 
        margin: 0, fontSize: '2.5rem', color: 'var(--text-primary)', 
        display: 'flex', alignItems: 'center', fontWeight: 'bold' 
    },
    content: { width: '100%' },
    empty: { 
        textAlign: 'center', padding: '5rem 1rem', display: 'flex', 
        flexDirection: 'column', alignItems: 'center', 
        backgroundColor: 'var(--bg-card)', borderRadius: '20px',
        border: '1px dashed var(--border-color)'
    },
    emptyIcon: { fontSize: '4rem', color: 'rgba(239, 68, 68, 0.5)', marginBottom: '20px' },
    emptyText: { color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '20px' },
    exploreBtn: {
        padding: '12px 24px', backgroundColor: 'var(--primary)', color: '#fff',
        border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold',
        cursor: 'pointer', transition: 'opacity 0.2s'
    },
    grid: { 
        display: 'grid', gap: '20px', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' 
    },
};

export default FavoritesPage;
