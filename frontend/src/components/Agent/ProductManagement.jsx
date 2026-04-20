// src/components/Agent/ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AddProductTab from '../Shared/AddProductTab';

import UpdateForm from './UpdateForm';
import ProductCard from './AgentProductCard';
import StoreSection from './StoreSection';
import './ProductManagement.css';

// ==================== LISTE PAYS ====================
const PAYS = ['Tunisie', 'France', 'Algérie', 'Maroc', 'Italie', 'Espagne', 'Allemagne', 'États-Unis'];

// ==================== COMPOSANTS INTERNES (Toast + ConfirmModal) ====================
const Toast = ({ toasts }) => (
    <div className="pm-toast-container">
        {toasts.map(t => (
            <div key={t.id} className={`pm-toast ${t.type}`}>
                {t.type === 'success' && '✅'}
                {t.type === 'error' && '❌'}
                {t.type === 'info' && 'ℹ️'}
                {t.msg}
            </div>
        ))}
    </div>
);

const ConfirmModal = ({ open, message, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div className="pm-modal-overlay">
            <div className="pm-modal-card">
                <p>{message}</p>
                <div className="pm-modal-actions">
                    <button onClick={onCancel} className="pm-btn pm-btn-secondary">Annuler</button>
                    <button onClick={onConfirm} className="pm-btn pm-btn-danger">Confirmer</button>
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
        <div className="pm-page">
            <h2 className="pm-page-title">
                <span className="pm-title-icon">📦</span>
                Gérer les Produits
            </h2>

            {errorMsg && (
                <div className="pm-error-banner">
                    ⚠️ {errorMsg}
                    <button onClick={loadAll} className="pm-retry-btn">🔄 Réessayer</button>
                </div>
            )}

            <div className="pm-tabs">
                {[
                    { key: 'approved', label: 'Produits validés', count: products.length, icon: '✅' },
                    { key: 'pending', label: 'En attente', count: pendingProducts.length, icon: '⏳' },
                    { key: 'add', label: 'Nouveau produit', icon: '➕' },
                    { key: 'points', label: 'Points de vente', count: pointsDeVente.length, icon: '📍' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setEditingProductId(null); }}
                        className={`pm-tab ${activeTab === tab.key ? 'active' : ''}`}
                    >
                        {tab.icon} {tab.label}
                        {tab.count !== undefined && (
                            <span className="tab-count">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="pm-loading">
                    <div className="pm-spinner" />
                    Chargement des données...
                </div>
            ) : (
                <>
                    {activeTab === 'approved' && (
                        <div>
                            {products.length === 0 ? <p className="pm-empty">Aucun produit validé.</p> : products.map(p => (
                                <ProductCard
                                    key={p._id}
                                    product={p}
                                    isEditing={editingProductId === p._id}
                                    onEdit={() => startEdit(p)}
                                    onDelete={() => deleteProduct(p)}
                                >
                                    <h4 className="pm-edit-title"> Modifier : {p.nom}</h4>
                                    <UpdateForm
                                        form={productForm}
                                        setForm={setProductForm}
                                        pointsDeVente={pointsDeVente}
                                        onSubmit={() => saveEdit(p)}
                                        onCancel={() => { setEditingProductId(null); setProductForm(emptyForm); }}
                                        PAYS={PAYS}
                                    />
                                </ProductCard>
                            ))}
                        </div>
                    )}

                    {activeTab === 'pending' && (
                        <div>
                            {pendingProducts.length === 0 ? <p className="pm-empty">Aucun produit en attente.</p> : pendingProducts.map(p => (
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
