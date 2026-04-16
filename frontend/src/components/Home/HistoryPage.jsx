import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiTrash2, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import useHistory from '../../hooks/useHistory';
import Navbar from './Navbar';
import Footer from './Footer';
import ResultatAnalyseModal from '../modals/ResultatAnalyseModal';

const HistoryPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isConsommateur = user?.role === 'consommateur';

    const { searchHistory, removeFromHistory, clearHistory } = useHistory(
        isConsommateur ? user?.id : null
    );

    const [allProducts, setAllProducts] = useState(() => {
        const saved = localStorage.getItem('cached_produits');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/produits?status=approved')
            .then((res) => res.json())
            .then((data) => {
                setAllProducts(data);
                localStorage.setItem('cached_produits', JSON.stringify(data));
            })
            .catch(() => console.error('API indisponible'));
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleUseItem = (e, item) => {
        e.stopPropagation();
        navigate('/', { state: { search: item.query } });
    };

    const handleDeleteItem = (e, id) => {
        e.stopPropagation();
        removeFromHistory(id);
    };

    const handleItemClick = (item) => {
        const query = item.query.trim().toLowerCase();
        
        // Chercher une correspondance (code-barre exact ou nom approchant)
        const found = allProducts.find(
            (p) => 
                p.code_barre === query || 
                p.codeBarres === query ||
                p.nom?.toLowerCase() === query ||
                p.nom?.toLowerCase().includes(query) ||
                p.name?.toLowerCase().includes(query)
        );

        if (found) {
            setSelectedProduct(found);
        }
    };

    const getDisplayName = (query) => {
        const lowerQuery = query.trim().toLowerCase();
        const found = allProducts.find(
            (p) => 
                p.code_barre === lowerQuery || 
                p.codeBarres === lowerQuery ||
                p.nom?.toLowerCase() === lowerQuery ||
                p.nom?.toLowerCase().includes(lowerQuery)
        );
        return found ? found.nom : query;
    };

    return (
        <div style={styles.pageContainer}>
            <Navbar
                user={user}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <h1 style={styles.title}>
                            <FiClock style={{ color: 'var(--primary)', marginRight: '12px' }} />
                            Mon Historique
                        </h1>
                        {searchHistory.length > 0 && (
                            <button style={styles.clearBtn} onClick={clearHistory}>
                                <FiTrash2 size={18} /> Tout supprimer
                            </button>
                        )}
                    </div>
                </div>

                <div style={styles.content}>
                    {!isConsommateur ? (
                        <div style={styles.empty}>
                            <p style={styles.emptyText}>Cette page est réservée aux consommateurs.</p>
                        </div>
                    ) : searchHistory.length === 0 ? (
                        <div style={styles.empty}>
                            <FiClock size={48} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
                            <p style={styles.emptyText}>Aucune recherche pour le moment.</p>
                            <button style={styles.exploreBtn} onClick={() => navigate('/')}>
                                Faire une recherche
                            </button>
                        </div>
                    ) : (
                        <div style={styles.list}>
                            {searchHistory.map((item) => (
                                <div 
                                    key={item.id} 
                                    style={{ ...styles.item, cursor: 'pointer' }}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div style={styles.itemInfo}>
                                        <div style={styles.queryText}>{getDisplayName(item.query)}</div>
                                        <small style={styles.dateText}>{new Date(item.date).toLocaleString('fr-FR')}</small>
                                    </div>
                                    <div style={styles.actions}>
                                        <button style={styles.useBtn} onClick={(e) => handleUseItem(e, item)} title="Relancer la recherche">
                                            <FiSearch size={18} /> <span style={styles.btnText}>Rechercher</span>
                                        </button>
                                        <button style={styles.deleteBtn} onClick={(e) => handleDeleteItem(e, item.id)} title="Supprimer">
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
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
        maxWidth: '1000px', margin: '0 auto', width: '100%',
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
    clearBtn: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px', backgroundColor: 'transparent', color: '#ef4444', 
        border: '1px solid #ef4444', borderRadius: '10px', 
        cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' 
    },
    content: { width: '100%' },
    empty: { 
        textAlign: 'center', padding: '5rem 1rem', display: 'flex', 
        flexDirection: 'column', alignItems: 'center', 
        backgroundColor: 'var(--bg-card)', borderRadius: '20px',
        border: '1px dashed var(--border-color)'
    },
    emptyText: { color: 'var(--text-secondary)', fontSize: '1.2rem', margin: '0 0 20px 0' },
    exploreBtn: {
        padding: '12px 24px', backgroundColor: 'var(--primary)', color: '#fff',
        border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold',
        cursor: 'pointer', transition: 'opacity 0.2s'
    },
    list: { display: 'flex', flexDirection: 'column', gap: '16px' },
    item: { 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '20px', border: '1px solid var(--border-color)', 
        borderRadius: '16px', backgroundColor: 'var(--bg-card)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    itemInfo: { display: 'flex', flexDirection: 'column', gap: '8px' },
    queryText: { color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.2rem' },
    dateText: { color: 'var(--text-muted)', fontSize: '0.95rem' },
    actions: { display: 'flex', gap: '12px' },
    useBtn: { 
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
        backgroundColor: 'var(--primary)', color: '#fff', border: 'none', 
        borderRadius: '10px', cursor: 'pointer', padding: '10px 16px',
        transition: 'background-color 0.2s', fontWeight: '600'
    },
    btnText: { display: 'inline-block' },
    deleteBtn: { 
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'var(--bg-main)', color: '#ef4444', border: '1px solid var(--border-color)', 
        borderRadius: '10px', cursor: 'pointer', padding: '10px',
        transition: 'all 0.2s'
    }
};

export default HistoryPage;
