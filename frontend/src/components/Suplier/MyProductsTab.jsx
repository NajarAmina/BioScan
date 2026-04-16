import React, { useEffect, useState, useCallback } from 'react';
import AddProductTab from '../Shared/AddProductTab';

const MyProductsTab = ({ user }) => {
    const [myProducts, setMyProducts] = useState([]); // initialisé par défaut à un tableau vide
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProducts = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`/api/produits?createdBy=${encodeURIComponent(user.id)}`);
            if (!res.ok) throw new Error('Erreur lors du chargement des produits');
            const data = await res.json();
            setMyProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setMyProducts([]);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (editingProduct) {
        return (
            <AddProductTab 
                user={user} 
                role="fournisseur" 
                productToEdit={editingProduct} 
                onCancelEdit={() => setEditingProduct(null)}
                onSuccess={() => {
                    setEditingProduct(null);
                    fetchProducts();
                }} 
            />
        );
    }

    const filteredProducts = myProducts.filter((p) => 
        p.nom && p.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={styles.header}>
                <h2 style={{ margin: 0, color: '#111827' }}>Mes Produits</h2>
                <div style={styles.searchWrapper}>
                    <input 
                        type="text" 
                        placeholder="Rechercher par nom..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
            </div>

            {myProducts.length === 0 ? (
                <p>Vous n'avez pas encore de produits.</p>
            ) : filteredProducts.length === 0 ? (
                <p>Aucun produit ne correspond à votre recherche.</p>
            ) : (
                <div style={styles.productsList}>
                    {filteredProducts.map((p) => (
                        <div key={p._id} style={styles.productCard}>
                            <div style={styles.productRow}>
                                <div style={styles.productInfoWrap}>
                                    {p.image ? (
                                        <img 
                                            src={p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image.startsWith('/') ? '' : '/'}${p.image}`} 
                                            alt={p.nom} 
                                            style={styles.productImage} 
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                        />
                                    ) : null}
                                    {/* Placeholder au cas où pas d'image ou erreur de chargement */}
                                    <div style={{...styles.productImagePlaceholder, display: p.image ? 'none' : 'flex'}}>
                                        <span style={{fontSize: '24px'}}>📦</span>
                                    </div>
                                    
                                    <div>
                                        <div style={styles.productName}>{p.nom}</div>
                                        <div style={styles.productMeta}>
                                            Code-barre: {p.code_barre || '—'} • Origine: {p.origine || '—'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor:
                                            p.status === 'approved' ? '#d1fae5' :
                                                p.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                        color:
                                            p.status === 'approved' ? '#059669' :
                                                p.status === 'rejected' ? '#dc2626' : '#92400e'
                                    }}>
                                        {p.status === 'approved' ? '✅ Accepté' :
                                            p.status === 'rejected' ? '❌ Rejeté' : '⏳ En attente'}
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={() => setEditingProduct(p)} 
                                        style={styles.editBtn}
                                    >
                                        ✏️ Modifier
                                    </button>
                                </div>
                            </div>
                            {p.description && <p style={styles.productDesc}>{p.description}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
    searchWrapper: { flex: '1', display: 'flex', justifyContent: 'flex-end' },
    searchInput: { width: '100%', maxWidth: '300px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', color: '#111827', backgroundColor: '#f9fafb' },
    productsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    productCard: { backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' },
    productRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
    productInfoWrap: { display: 'flex', alignItems: 'center', gap: '15px' },
    productImage: { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' },
    productImagePlaceholder: { width: '60px', height: '60px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' },
    productName: { fontSize: '17px', fontWeight: '800', color: '#111827' },
    productMeta: { color: '#64748b', fontSize: '13px', marginTop: '4px' },
    productDesc: { marginTop: '12px', color: '#475569', fontSize: '14.5px', lineHeight: '1.5' },
    statusBadge: { padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', alignSelf: 'flex-end' },
    editBtn: { background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#334155', transition: 'all 0.2s', alignSelf: 'flex-end', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }
};

export default MyProductsTab;