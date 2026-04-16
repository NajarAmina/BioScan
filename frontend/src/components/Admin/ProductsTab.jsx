import React, { useState, useEffect } from 'react';
import './ProductsTab.css';

const getStatusLabel = (status) => ({
    approved: '✅ Accepté',
    rejected: '❌ Rejeté',
    pending: '⏳ En attente',
}[status] || '⏳ En attente');

/**
 * Retourne le nom complet d'un utilisateur peuplé.
 */
const getUserLabel = (user) => {
    if (!user) return null;
    if (typeof user === 'string') return user; // id non peuplé
    const prenom = user.prenom || user.firstName || '';
    const nom    = user.nom   || user.lastName  || user.name || user.username || '';
    const full   = `${prenom} ${nom}`.trim();
    return full || user.email || user._id || '—';
};

const ProductsTab = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Nouveaux états pour le formulaire
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        nom: '', marque: '', code_barre: '', origine: '', risque: '', scoreBio: 0, image: '', status: 'approved'
    });
    const [formLoading, setFormLoading] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/produits');
            const data = await res.json().catch(() => []);
            if (!res.ok) throw new Error(data.message || 'Erreur chargement');
            const list = Array.isArray(data) ? data : [];
            setProducts(list);
        } catch (err) {
            setError(err.message || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (p) => {
        setEditingProduct(p);
        setFormData({
            nom: p.nom || '',
            marque: p.marque || '',
            code_barre: p.code_barre || p.codeBarres || '',
            origine: p.origine || '',
            risque: p.risque || '',
            scoreBio: p.scoreBio || 0,
            image: p.image || '',
            status: p.status || 'approved'
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
        try {
            const res = await fetch(`/api/produits/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erreur lors de la suppression');
            fetchProducts();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const url = editingProduct ? `/api/produits/${editingProduct._id}` : '/api/produits';
            const method = editingProduct ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Erreur lors de la sauvegarde');
            
            setShowForm(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (err) {
            alert(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const filtered = filterStatus === 'all'
        ? products
        : products.filter(p => p.status === filterStatus);

    return (
        <div className="products-tab-wrapper">
            <div className="products-header">
                <div className="products-title-area">
                    <h2>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        Gestion des produits
                    </h2>
                    <p>Découvrez, modifiez ou supprimez des produits en toute simplicité.</p>
                </div>
                <div className="products-actions">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="select-filter">
                        <option value="all">Tous les statuts</option>
                        <option value="approved">Acceptés</option>
                        <option value="pending">En attente</option>
                        <option value="rejected">Rejetés</option>
                    </select>
                </div>
            </div>

            {error && <div className="products-error-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>{error}</div>}
            {loading && <div className="products-info-box">⏳ Chargement des données...</div>}

            {!loading && filtered.length === 0 && (
                <div className="products-info-box">Aucun produit trouvé pour les critères sélectionnés.</div>
            )}

            {!loading && filtered.length > 0 && (
                <div className="table-container">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                {['Produit', 'Statut', 'Fournisseur', 'Agent validateur', 'Date ajout', 'Actions'].map(h => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => {
                                const fournisseur = getUserLabel(p.createdBy);
                                const agent       = getUserLabel(p.validatedBy);

                                return (
                                    <tr key={p._id}>
                                        <td>
                                            <div className="product-cell">
                                                <div className="product-thumb">
                                                    {p.image
                                                        ? <img src={p.image} alt={p.nom} />
                                                        : <span>📦</span>}
                                                </div>
                                                <div>
                                                    <div className="product-name">{p.nom}</div>
                                                    <div className="product-meta">
                                                        {p.code_barre || p.codeBarres || '—'} • {p.origine || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${p.status || 'pending'}`}>
                                                <span className="status-dot"></span>
                                                {getStatusLabel(p.status)}
                                            </span>
                                        </td>
                                        <td>
                                            {fournisseur ? <span className="user-label">{fournisseur}</span> : <span className="no-agent">Non renseigné</span>}
                                        </td>
                                        <td>
                                            {agent ? <span className="user-label">{agent}</span> : <span className="no-agent">En attente</span>}
                                        </td>
                                        <td>
                                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '—'}
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button onClick={() => handleEdit(p)} className="btn-icon btn-icon-edit" title="Modifier">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button onClick={() => handleDelete(p._id)} className="btn-icon btn-icon-delete" title="Supprimer">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">✏️ Modifier le produit</h3>
                            <button type="button" onClick={() => setShowForm(false)} className="modal-close-btn" title="Fermer">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modern-form">
                            <div className="form-group">
                                <label className="form-label">Nom du produit <span className="required-mark">*</span></label>
                                <input type="text" name="nom" required value={formData.nom} onChange={handleInputChange} className="form-input" placeholder="Ex: Céréales Miel..." />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Marque</label>
                                    <input type="text" name="marque" value={formData.marque} onChange={handleInputChange} className="form-input" placeholder="Ex: Nestlé" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Code barre</label>
                                    <input type="text" name="code_barre" value={formData.code_barre} onChange={handleInputChange} className="form-input" placeholder="Ex: 8000000000" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Origine</label>
                                    <input type="text" name="origine" value={formData.origine} onChange={handleInputChange} className="form-input" placeholder="Pays ou région" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Risque / Nutri-Score</label>
                                    <input type="text" name="risque" value={formData.risque} onChange={handleInputChange} className="form-input" placeholder="Ex: Bon, A, Faible..." />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Score Bio (0-100)</label>
                                    <input type="number" name="scoreBio" value={formData.scoreBio} onChange={handleInputChange} className="form-input" min="0" max="100" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Statut</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="form-input">
                                        <option value="approved">✅ Accepté</option>
                                        <option value="pending">⏳ En attente</option>
                                        <option value="rejected">❌ Rejeté</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Image (Optionnel)</label>
                                <div className="file-input-wrapper">
                                    <div>🖼️ Glissez ou cliquez pour uploader une image</div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="form-input-file" />
                                </div>
                                {formData.image && typeof formData.image === 'string' && (
                                    <img src={formData.image} alt="Preview" className="img-preview" />
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" disabled={formLoading}>Annuler</button>
                                <button type="submit" className="btn-primary" disabled={formLoading}>
                                    {formLoading ? '⏳ Enregistrement...' : '💾 Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsTab;
