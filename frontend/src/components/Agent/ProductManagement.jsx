// src/components/Agent/ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AddProductTab from '../Shared/AddProductTab';

import UpdateForm from './UpdateForm';
import ProductCard from './AgentProductCard';
import StoreSection from './StoreSection';

// ==================== STYLES COMMUNS ====================
const S = {
    page: { padding: '8px 0', fontFamily: 'sans-serif' },
    pageTitle: { fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#222' },
    tabs: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
    tab: { padding: '8px 16px', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', backgroundColor: '#fff', fontSize: 14, color: '#555', fontWeight: 500 },
    tabActive: { backgroundColor: '#1976D2', color: '#fff', border: '1px solid #1976D2' },
    loading: { padding: 32, textAlign: 'center', color: '#888', fontSize: 15 },
    empty: { color: '#888', fontStyle: 'italic', padding: '16px 0' },
    errorBanner: { backgroundColor: '#FFF3E0', border: '1px solid #FF9800', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#E65100', fontSize: 14, display: 'flex', alignItems: 'center', gap: 12 },
    retryBtn: { marginLeft: 'auto', padding: '6px 14px', backgroundColor: '#FF9800', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
    cardTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#222' },

    formCard: { backgroundColor: '#f9f9f9', padding: 20, borderRadius: 10, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: 12 },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none' },
    btnSuccess: { backgroundColor: '#4CAF50', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
    btnEdit: { backgroundColor: '#1976D2', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
    btnDanger: { backgroundColor: '#f44336', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
    btnDangerSm: { backgroundColor: '#f44336', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
    btnSecondary: { backgroundColor: '#fff', color: '#555', border: '1px solid #ccc', padding: '9px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: 13 },

    card: { backgroundColor: '#fff', padding: 16, marginBottom: 12, borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
    cardRow: { display: 'flex', gap: 14, alignItems: 'flex-start' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
    cardDesc: { margin: '0 0 6px', fontSize: 14, color: '#555' },
    cardActions: { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 120 },
    meta: { margin: '2px 0', fontSize: 12, color: '#777' },
    badge: { fontSize: 11, padding: '2px 8px', borderRadius: 12, backgroundColor: '#E8F5E9', color: '#2E7D32', fontWeight: 600 },
    productImg: { width: 70, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 },
    sectionTitle: { fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 12 },
    pointForm: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'start', marginBottom: 12 },
    pointCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: '10px 14px', marginBottom: 8, borderRadius: 8, border: '1px solid #e5e7eb' },
    mapsLink: { display: 'inline-block', color: '#1976D2', fontSize: 12, fontWeight: 600, textDecoration: 'none', marginTop: 4 },
    mapsBox: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 4, padding: '6px 10px', backgroundColor: '#E3F2FD', borderRadius: 6 },
};

// ==================== LISTE PAYS ====================
const PAYS = ['Tunisie', 'France', 'Algérie', 'Maroc', 'Italie', 'Espagne', 'Allemagne', 'États-Unis'];

// ==================== COMPOSANTS INTERNES (Toast + ConfirmModal) ====================
const Toast = ({ toasts }) => (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
            <div key={t.id} style={{
                padding: '12px 20px', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 14,
                backgroundColor: t.type === 'success' ? '#4CAF50' : t.type === 'error' ? '#f44336' : '#1976D2',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>{t.msg}</div>
        ))}
    </div>
);

const ConfirmModal = ({ open, message, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 8888, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: '28px 32px', maxWidth: 400, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                <p style={{ marginBottom: 24, fontSize: 15, color: '#333', lineHeight: 1.6 }}>{message}</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button onClick={onCancel} style={S.btnSecondary}>Annuler</button>
                    <button onClick={onConfirm} style={S.btnDanger}>Confirmer</button>
                </div>
            </div>
        </div>
    );
};

// ==================== FETCH HELPER ====================
const API_TIMEOUT_MS = 25000;
async function fetchJsonWithTimeout(url, options = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT_MS);

    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    try {
        const res = await fetch(url, { ...options, headers, signal: ctrl.signal });
        let data = null;
        try { data = await res.json(); } catch { }
        if (!res.ok) throw new Error((data?.message || data?.error) || `Erreur ${res.status}`);
        return data;
    } catch (e) {
        if (e.name === 'AbortError') throw new Error(`Délai dépassé (${API_TIMEOUT_MS / 1000}s)`);
        throw e;
    } finally {
        clearTimeout(timer);
    }
}

const ProductManagement = ({ onSelectProduct }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [pointsDeVente, setPointsDeVente] = useState([]);
    const [activeTab, setActiveTab] = useState('approved');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [editingProductId, setEditingProductId] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });

    const emptyForm = { nom: '', description: '', code_barre: '', origine: '', ingredients: '', image: '', pointsDeVente: [] };
    const [productForm, setProductForm] = useState(emptyForm);

    // ✅ newPoint avec lat/lng inclus
    const [newPoint, setNewPoint] = useState({ nom: '', adresse: '', lat: null, lng: null });

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const [r0, r1, r2] = await Promise.allSettled([
                fetchJsonWithTimeout('/api/produits'),
                fetchJsonWithTimeout('/api/produits/pending'),
                fetchJsonWithTimeout('/api/pointDeVente'),
            ]);

            setProducts(r0.status === 'fulfilled' ? (Array.isArray(r0.value) ? r0.value : r0.value?.produits || []) : []);
            setPendingProducts(r1.status === 'fulfilled' ? (Array.isArray(r1.value) ? r1.value : r1.value?.produits || []) : []);
            setPointsDeVente(r2.status === 'fulfilled' ? (Array.isArray(r2.value) ? r2.value : []) : []);
        } catch (err) {
            setErrorMsg(`Erreur de chargement : ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const toast = (msg, type = 'success') => {
        const id = Date.now();
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    };

    const askConfirm = (message) => new Promise(resolve => {
        setConfirm({ open: true, message, onConfirm: () => { setConfirm(c => ({ ...c, open: false })); resolve(true); } });
    });

    // ── Actions produits ──────────────────────────────────────────────────────
    const acceptProduct = async (product) => {
        try {
            await fetchJsonWithTimeout(`/api/produits/${product._id}/approve`, { method: 'PUT', body: JSON.stringify({ validatedBy: user?.id || user?._id }) });
            await loadAll();
            toast(`Produit "${product.nom}" accepté ✅`);
        } catch (err) { toast(err.message, 'error'); }
    };

    const refuseProduct = async (product) => {
        const ok = await askConfirm(`Refuser et supprimer "${product.nom}" ?`);
        if (!ok) return;
        try {
            await fetchJsonWithTimeout(`/api/produits/${product._id}/reject`, { method: 'PUT', body: JSON.stringify({ rejectedBy: user?.id || user?._id }) });
            await loadAll();
            toast(`Produit "${product.nom}" refusé`, 'info');
        } catch (err) { toast(err.message, 'error'); }
    };

    const startEdit = (p) => {
        setEditingProductId(p._id);
        setProductForm({
            nom: p.nom || '',
            description: p.description || '',
            code_barre: p.code_barre || '',
            origine: p.origine || '',
            ingredients: Array.isArray(p.ingredients) ? p.ingredients.map(i => i?.nom || i).filter(Boolean).join(', ') : (p.ingredients || ''),
            image: p.image || '',
            pointsDeVente: Array.isArray(p.pointsDeVente) ? p.pointsDeVente.map(pv => pv?._id || pv).filter(Boolean) : []
        });
        setActiveTab('approved');
    };

    const saveEdit = async (originalProduct) => {
        try {
            await fetchJsonWithTimeout(`/api/produits/${originalProduct._id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...productForm, modifiedBy: user?.id || user?._id }),
            });
            setEditingProductId(null);
            setProductForm(emptyForm);
            await loadAll();
            toast(`Produit "${originalProduct.nom}" modifié ✅`);
        } catch (err) { toast(err.message, 'error'); }
    };

    const deleteProduct = async (product) => {
        const ok = await askConfirm(`Supprimer "${product.nom}" ?`);
        if (!ok) return;
        try {
            await fetchJsonWithTimeout(`/api/produits/${product._id}`, { method: 'DELETE' });
            await loadAll();
            toast(`Produit "${product.nom}" supprimé`, 'info');
        } catch (err) { toast(err.message, 'error'); }
    };

    // ── Actions points de vente ───────────────────────────────────────────────
    // ✅ handleAddPoint transmet lat/lng à l'API
    const handleAddPoint = async () => {
        if (!newPoint.nom.trim() || !newPoint.adresse.trim()) return toast('Nom et adresse requis', 'error');
        try {
            await fetchJsonWithTimeout('/api/pointDeVente', {
                method: 'POST',
                body: JSON.stringify({
                    nom: newPoint.nom.trim(),
                    adresse: newPoint.adresse.trim(),
                    lat: newPoint.lat || null,
                    lng: newPoint.lng || null,
                })
            });
            // ✅ Reset complet avec lat/lng
            setNewPoint({ nom: '', adresse: '', lat: null, lng: null });
            await loadAll();
            toast('Point de vente ajouté ✅');
        } catch (err) { toast(err.message, 'error'); }
    };

    const handleDeletePoint = async (pv) => {
        const ok = await askConfirm(`Supprimer le point "${pv.nom}" ?`);
        if (!ok) return;
        try {
            await fetchJsonWithTimeout(`/api/pointDeVente/${pv._id}`, { method: 'DELETE' });
            await loadAll();
            toast(`Point "${pv.nom}" supprimé`, 'info');
        } catch (err) { toast(err.message, 'error'); }
    };

    // ==================== RENDER ====================
    return (
        <div style={S.page}>
            <h2 style={S.pageTitle}>📦 Gérer les Produits</h2>

            {errorMsg && (
                <div style={S.errorBanner}>
                    ⚠️ {errorMsg}
                    <button onClick={loadAll} style={S.retryBtn}>🔄 Réessayer</button>
                </div>
            )}

            <div style={S.tabs}>
                {[
                    { key: 'approved', label: `✅ Produits validés (${products.length})` },
                    { key: 'pending', label: `⏳ En attente (${pendingProducts.length})` },
                    { key: 'add', label: '➕ Nouveau produit' },
                    { key: 'points', label: `📍 Points de vente (${pointsDeVente.length})` },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setEditingProductId(null); }}
                        style={{ ...S.tab, ...(activeTab === tab.key ? S.tabActive : {}) }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={S.loading}>⏳ Chargement...</div>
            ) : (
                <>
                    {activeTab === 'approved' && (
                        <div>
                            {products.length === 0 ? <p style={S.empty}>Aucun produit validé.</p> : products.map(p => (
                                <ProductCard
                                    key={p._id}
                                    product={p}
                                    isEditing={editingProductId === p._id}
                                    onEdit={() => startEdit(p)}
                                    onDelete={() => deleteProduct(p)}
                                    S={S}
                                >
                                    <h4 style={S.cardTitle}>✏️ Modifier : {p.nom}</h4>
                                    <UpdateForm
                                        form={productForm}
                                        setForm={setProductForm}
                                        pointsDeVente={pointsDeVente}
                                        onSubmit={() => saveEdit(p)}
                                        onCancel={() => { setEditingProductId(null); setProductForm(emptyForm); }}
                                        S={S}
                                        PAYS={PAYS}
                                    />
                                </ProductCard>
                            ))}
                        </div>
                    )}

                    {activeTab === 'pending' && (
                        <div>
                            {pendingProducts.length === 0 ? <p style={S.empty}>Aucun produit en attente.</p> : pendingProducts.map(p => (
                                <ProductCard
                                    key={p._id}
                                    product={p}
                                    pending
                                    onClickCard={() => {
                                        if (typeof onSelectProduct === 'function') {
                                            return onSelectProduct(p._id);
                                        }
                                        navigate('/dashboard/AgentDashboard?tab=aiAnalysis');
                                    }}
                                    S={S}
                                />
                            ))}
                        </div>
                    )}

                    {activeTab === 'add' && (
                        <AddProductTab
                            user={user}
                            role="agent"
                            onSuccess={() => { loadAll(); setActiveTab('approved'); toast('Produit ajouté ✅'); }}
                        />
                    )}

                    {activeTab === 'points' && (
                        <StoreSection
                            pointsDeVente={pointsDeVente}
                            newPoint={newPoint}
                            setNewPoint={setNewPoint}
                            onAddPoint={handleAddPoint}
                            onDeletePoint={handleDeletePoint}
                            S={S}
                        />
                    )}
                </>
            )}

            <Toast toasts={toasts} />
            <ConfirmModal
                open={confirm.open}
                message={confirm.message}
                onConfirm={confirm.onConfirm}
                onCancel={() => setConfirm(c => ({ ...c, open: false }))}
            />
        </div>
    );
};

export default ProductManagement;
