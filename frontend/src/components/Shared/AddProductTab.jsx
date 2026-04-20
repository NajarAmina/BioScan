import React, { useState, useRef, useEffect } from 'react';

// ─── Liste des pays ───────────────────────────────────────────────────────────
const PAYS = [
    'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola',
    'Antigua-et-Barbuda', 'Arabie Saoudite', 'Argentine', 'Arménie', 'Australie', 'Autriche',
    'Azerbaïdjan', 'Bahamas', 'Bahreïn', 'Bangladesh', 'Barbade', 'Belgique', 'Belize',
    'Bénin', 'Bhoutan', 'Biélorussie', 'Birmanie', 'Bolivie', 'Bosnie-Herzégovine', 'Botswana',
    'Brésil', 'Brunei', 'Bulgarie', 'Burkina Faso', 'Burundi', 'Cambodge', 'Cameroun', 'Canada',
    'Cap-Vert', 'Centrafrique', 'Chili', 'Chine', 'Chypre', 'Colombie', 'Comores', 'Congo',
    'Corée du Nord', 'Corée du Sud', 'Costa Rica', "Côte d'Ivoire", 'Croatie', 'Cuba', 'Danemark',
    'Djibouti', 'Dominique', 'Égypte', 'Émirats Arabes Unis', 'Équateur', 'Érythrée', 'Espagne',
    'Estonie', 'Éthiopie', 'Fidji', 'Finlande', 'France', 'Gabon', 'Gambie', 'Géorgie', 'Ghana',
    'Grèce', 'Grenade', 'Guatemala', 'Guinée', 'Guinée-Bissau', 'Guinée équatoriale', 'Guyana',
    'Haïti', 'Honduras', 'Hongrie', 'Inde', 'Indonésie', 'Irak', 'Iran', 'Irlande', 'Islande',
    'Israël', 'Italie', 'Jamaïque', 'Japon', 'Jordanie', 'Kazakhstan', 'Kenya', 'Kosovo', 'Koweït',
    'Laos', 'Lettonie', 'Liban', 'Libéria', 'Libye', 'Lituanie', 'Luxembourg', 'Madagascar',
    'Malaisie', 'Malawi', 'Maldives', 'Mali', 'Malte', 'Maroc', 'Maurice', 'Mauritanie', 'Mexique',
    'Moldavie', 'Monaco', 'Mongolie', 'Monténégro', 'Mozambique', 'Namibie', 'Népal', 'Niger',
    'Nigéria', 'Norvège', 'Nouvelle-Zélande', 'Oman', 'Ouganda', 'Ouzbékistan', 'Pakistan',
    'Palestine', 'Panama', 'Paraguay', 'Pays-Bas', 'Pérou', 'Philippines', 'Pologne', 'Portugal',
    'Qatar', 'République démocratique du Congo', 'République dominicaine', 'République tchèque',
    'Roumanie', 'Royaume-Uni', 'Russie', 'Rwanda', 'Sénégal', 'Serbie', 'Sierra Leone',
    'Singapour', 'Slovaquie', 'Slovénie', 'Somalie', 'Soudan', 'Sri Lanka', 'Suède', 'Suisse',
    'Syrie', 'Tanzanie', 'Tchad', 'Thaïlande', 'Togo', 'Trinité-et-Tobago', 'Tunisie',
    'Turquie', 'Ukraine', 'Uruguay', 'Vatican', 'Venezuela', 'Vietnam', 'Yémen', 'Zambie', 'Zimbabwe'
];

// ─── Autocomplete Pays ────────────────────────────────────────────────────────
const PaysAutocomplete = ({ value, onChange }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const wrapperRef = useRef(null);

    useEffect(() => { setQuery(value || ''); }, [value]);
    useEffect(() => {
        const h = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val); onChange(val); setHighlighted(-1);
        if (!val.trim()) { setSuggestions([]); setOpen(false); return; }
        const filtered = PAYS.filter(p => p.toLowerCase().startsWith(val.toLowerCase())).slice(0, 8);
        setSuggestions(filtered); setOpen(filtered.length > 0);
    };

    const handleSelect = (pays) => {
        setQuery(pays); onChange(pays); setSuggestions([]); setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!open) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
        else if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); handleSelect(suggestions[highlighted]); }
        else if (e.key === 'Escape') setOpen(false);
    };

    return (
        <div ref={wrapperRef} style={styles.autocompleteWrapper}>
            <input
                type="text" placeholder="Origine (pays) *" value={query}
                onChange={handleInput} onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setOpen(true)}
                style={styles.input} className="add-product-input" autoComplete="off"
            />
            {open && (
                <ul style={styles.dropdown}>
                    {suggestions.map((pays, i) => (
                        <li key={pays}
                            onMouseDown={() => handleSelect(pays)}
                            onMouseEnter={() => setHighlighted(i)}
                            style={{ ...styles.dropdownItem, ...(i === highlighted ? styles.dropdownItemHighlighted : {}) }}
                        >
                            <span style={{ fontWeight: 700, color: '#1976D2' }}>{pays.slice(0, query.length)}</span>
                            <span>{pays.slice(query.length)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ─── Autocomplete Adresse Nominatim ──────────────────────────────────────────
const AdresseAutocomplete = ({ value, onChange, onSelectCoords, placeholder }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const [loadingAddr, setLoadingAddr] = useState(false);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => { setQuery(value || ''); }, [value]);
    useEffect(() => {
        const h = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const fetchSuggestions = async (val) => {
        if (val.trim().length < 1) { setSuggestions([]); setOpen(false); return; }
        setLoadingAddr(true);
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=tn&addressdetails=1&limit=8&q=${encodeURIComponent(val)}`;
            const res = await fetch(url, { headers: { 'Accept-Language': 'fr', 'User-Agent': 'AddProductApp/1.0' } });
            const data = await res.json();
            setSuggestions(data || []); setOpen((data || []).length > 0);
        } catch {
            setSuggestions([]); setOpen(false);
        } finally {
            setLoadingAddr(false);
        }
    };

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val); onChange(val); setHighlighted(-1);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
    };

    const handleSelect = (item) => {
        const addr = item.display_name.replace(/, Tunisie$/, '').replace(/, Tunisia$/, '');
        setQuery(addr); onChange(addr);
        if (onSelectCoords) onSelectCoords({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
        setSuggestions([]); setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!open) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
        else if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); handleSelect(suggestions[highlighted]); }
        else if (e.key === 'Escape') setOpen(false);
    };

    return (
        <div ref={wrapperRef} style={styles.autocompleteWrapper}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder={placeholder || 'Adresse 📍'}
                    value={query}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    style={{ ...styles.input, paddingRight: '32px' }}
                    className="add-product-input"
                    autoComplete="off"
                />
                {loadingAddr && (
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#999' }}>
                        ⏳
                    </span>
                )}
            </div>
            {open && (
                <ul style={styles.dropdown}>
                    {suggestions.map((item, i) => {
                        const addr = item.display_name.replace(/, Tunisie$/, '').replace(/, Tunisia$/, '');
                        const parts = addr.split(', ');
                        return (
                            <li key={item.place_id}
                                onMouseDown={() => handleSelect(item)}
                                onMouseEnter={() => setHighlighted(i)}
                                style={{ ...styles.dropdownItem, ...(i === highlighted ? styles.dropdownItemHighlighted : {}) }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '13px' }}>📍 {parts[0]}</div>
                                {parts.slice(1).join(', ') && (
                                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{parts.slice(1).join(', ')}</div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

const AddProductTab = ({ user, role = 'fournisseur', onSuccess, productToEdit = null, onCancelEdit }) => {

    const isEditMode = !!productToEdit;

    // ─── Config selon le rôle ─────────────────────────────────────────────────
    const config = {
        agent: {
            directApprove: true,
            submitLabel: isEditMode ? '✅ Enregistrer les modifications' : '✅ Ajouter et publier',
            url: isEditMode ? `/api/produits/${productToEdit._id}` : '/api/produits',
            method: isEditMode ? 'PUT' : 'POST',
            status: isEditMode ? productToEdit.status : 'approved',
            successMsg: isEditMode ? 'Produit modifié avec succès ✅' : 'Produit ajouté et publié directement ✅',
        },
        fournisseur: {
            directApprove: false,
            submitLabel: isEditMode ? '✅ Soumettre les modifications' : '✅ Soumettre le produit',
            url: isEditMode ? `/api/produits/${productToEdit._id}` : '/api/produits/pending',
            method: isEditMode ? 'PUT' : 'POST',
            status: 'pending', // Les modifications d'un fournisseur remettent le produit en attente
            successMsg: isEditMode ? 'Produit modifié et renvoyé en validation ✅' : 'Produit soumis et en attente de validation ✅',
        },
    };

    const cfg = config[role];

    // ─── State ────────────────────────────────────────────────────────────────
    const [productForm, setProductForm] = useState({
        nom: productToEdit?.nom || '',
        marque: productToEdit?.marque || '',
        description: productToEdit?.description || '',
        code_barre: productToEdit?.code_barre || '',
        origine: productToEdit?.origine || '',
        ingredients: productToEdit?.ingredients ? productToEdit.ingredients.map(i => i.nom).join(', ') : '',
        image: productToEdit?.image || '',
        pointsDeVente: productToEdit?.pointsDeVente ? productToEdit.pointsDeVente.map(p => p._id) : []
    });

    const [pointsDeVente, setPointsDeVente] = useState(productToEdit?.pointsDeVente || []);
    const [newPoint, setNewPoint] = useState({ nom: '', adresse: '', lat: null, lng: null });
    const [addingPoint, setAddingPoint] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasBarcode, setHasBarcode] = useState(!!productToEdit?.code_barre);

    const canSubmit =
        productForm.nom?.trim() &&
        productForm.marque?.trim() &&
        productForm.description?.trim() &&
        productForm.origine?.trim() &&
        productForm.ingredients?.trim() &&
        productForm.image &&
        (productForm.pointsDeVente && productForm.pointsDeVente.length > 0) &&
        (!hasBarcode || productForm.code_barre?.trim());

    const isMongoObjectId = (v) => /^[a-fA-F0-9]{24}$/.test(String(v || '').trim());

    const readFileAsDataUrl = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Erreur lecture image'));
            reader.readAsDataURL(file);
        });

    // ─── Ajouter un point de vente ────────────────────────────────────────────
    const handleAddPoint = async (e) => {
        e.preventDefault();
        if (!newPoint.nom.trim() || !newPoint.adresse.trim()) {
            alert("Veuillez remplir le nom et l'adresse du point de vente");
            return;
        }
        setAddingPoint(true);
        try {
            const res = await fetch('/api/pointDeVente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: newPoint.nom.trim(),
                    adresse: newPoint.adresse.trim(),
                    lat: newPoint.lat || null,
                    lng: newPoint.lng || null,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Erreur ajout point de vente');

            setPointsDeVente(prev => [...prev, data]);
            setProductForm(prev => ({
                ...prev,
                pointsDeVente: [...(prev.pointsDeVente || []), data._id],
            }));
            setNewPoint({ nom: '', adresse: '', lat: null, lng: null });
        } catch (err) {
            alert(err.message || "Erreur lors de l'ajout du point de vente");
        } finally {
            setAddingPoint(false);
        }
    };

    // ─── Retirer un point de la liste ─────────────────────────────────────────
    const removePoint = (id) => {
        setPointsDeVente(prev => prev.filter(p => p._id !== id));
        setProductForm(prev => ({
            ...prev,
            pointsDeVente: (prev.pointsDeVente || []).filter(pid => pid !== id),
        }));
    };

    // ─── Soumettre le produit ─────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id) { alert('Veuillez vous connecter'); return; }
        if (!canSubmit) { alert('Veuillez remplir les champs obligatoires (*)'); return; }

        setLoading(true);
        try {
            const cleanedPoints = (productForm.pointsDeVente || [])
                .map(id => String(id).trim())
                .filter(id => id && isMongoObjectId(id));

            const payload = {
                ...productForm,
                pointsDeVente: cleanedPoints,
                createdBy: user.id,
                status: cfg.status,
            };

            // Éviter l'erreur d'index "unique sparse" vide sur MongoDB
            if (!hasBarcode || !payload.code_barre.trim()) {
                delete payload.code_barre;
            }

            const res = await fetch(cfg.url, {
                method: cfg.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Erreur lors de la soumission');

            // Reset formulaire
            setProductForm({ nom: '', marque: '', description: '', code_barre: '', origine: '', ingredients: '', image: '', pointsDeVente: [] });
            setPointsDeVente([]);
            setHasBarcode(false);

            if (onSuccess) {
                onSuccess();
            } else {
                alert(cfg.successMsg);
            }
        } catch (err) {
            alert(err.message || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#111827' }}>
                    {isEditMode ? ' Modifier le produit' : 'Ajouter un Nouveau Produit'}
                </h2>
                {isEditMode && onCancelEdit && (
                    <button type="button" onClick={onCancelEdit} style={{ padding: '10px 18px', background: '#f8fafc', color: '#1e293b', border: '1.5px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Annuler la modification
                    </button>
                )}
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>

                {/* ── Infos produit ── */}
                <input
                    placeholder="Nom du produit *"
                    value={productForm.nom}
                    onChange={e => setProductForm({ ...productForm, nom: e.target.value })}
                    style={styles.input} className="add-product-input"
                />

                <textarea
                    placeholder="Marque *"
                    value={productForm.marque}
                    onChange={e => setProductForm({ ...productForm, marque: e.target.value })}
                    style={styles.textarea} className="add-product-input"
                />

                <textarea
                    placeholder="Description*"
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    style={styles.textarea} className="add-product-input"
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 2px' }}>
                    <input
                        type="checkbox"
                        id="hasBarcodeCheck"
                        checked={hasBarcode}
                        onChange={(e) => {
                            setHasBarcode(e.target.checked);
                            if (!e.target.checked) setProductForm({ ...productForm, code_barre: '' });
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                    />
                    <label htmlFor="hasBarcodeCheck" style={{ fontSize: '15px', color: '#1e293b', cursor: 'pointer', fontWeight: '500', userSelect: 'none' }}>
                        Ce produit possède un code-barre
                    </label>
                </div>

                {hasBarcode && (
                    <input
                        placeholder="Code-barre *"
                        value={productForm.code_barre}
                        onChange={e => setProductForm({ ...productForm, code_barre: e.target.value })}
                        style={styles.input} className="add-product-input"
                    />
                )}

                <PaysAutocomplete
                    value={productForm.origine}
                    onChange={val => setProductForm({ ...productForm, origine: val })}
                />

                <textarea
                    placeholder="Ingrédients *"
                    value={productForm.ingredients}
                    onChange={e => setProductForm({ ...productForm, ingredients: e.target.value })}
                    style={styles.textarea} className="add-product-input"
                />

                <label style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600', marginLeft: '4px' }}>Image du produit *</label>
                <input
                    type="file" accept="image/*"
                    onChange={async e => {
                        const file = e.target.files?.[0]; if (!file) return;
                        try { setProductForm({ ...productForm, image: await readFileAsDataUrl(file) }); }
                        catch { alert("Impossible de lire l'image"); }
                    }}
                    style={{ ...styles.input, backgroundColor: 'transparent', border: 'none', padding: '0' }}
                    className="add-product-input"
                />
                {productForm.image && (
                    <img src={productForm.image} alt="Preview" style={{ maxWidth: '220px', borderRadius: '8px', marginTop: '4px' }} />
                )}

                {/* ── Section Points de vente ── */}
                <div style={styles.sectionBox}>
                    <p style={styles.sectionTitle}>🏪 Points de vente *</p>

                    {pointsDeVente.length > 0 ? (
                        <div style={styles.pointsList}>
                            {pointsDeVente.map(p => (
                                <div key={p._id} style={styles.pointItem}>
                                    <div style={{ flex: 1 }}>
                                        <span style={styles.pointNom}>{p.nom}</span>
                                        <span style={styles.pointAdresse}>📍 {p.adresse}</span>
                                        {p.lat && p.lng && (
                                            <a
                                                href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                                                target="_blank" rel="noreferrer" style={styles.mapsLink}
                                            >
                                                🗺️ Voir sur Google Maps
                                            </a>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => removePoint(p._id)} style={styles.removeBtn} className="remove-point-btn" title="Retirer">
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={styles.emptyPoints}>Aucun point de vente ajouté pour l'instant.</p>
                    )}

                    {/* Formulaire nouveau point */}
                    <div style={styles.addPointBox}>
                        <p style={styles.addPointTitle}>➕ Nouveau point de vente</p>

                        <input
                            placeholder="Nom (ex: Carrefour La Marsa)"
                            value={newPoint.nom}
                            onChange={e => setNewPoint({ ...newPoint, nom: e.target.value })}
                            style={styles.input}
                            className="add-product-input"
                        />

                        <AdresseAutocomplete
                            value={newPoint.adresse}
                            placeholder="Adresse — tapez pour chercher, sélectionnez pour remplir les coords 📍"
                            onChange={val => setNewPoint(prev => ({ ...prev, adresse: val }))}
                            onSelectCoords={({ lat, lng }) => setNewPoint(prev => ({ ...prev, lat, lng }))}
                        />

                        {newPoint.lat && newPoint.lng ? (
                            <div style={styles.coordsPreview}>
                                <span>✅ Coordonnées : {newPoint.lat.toFixed(5)}, {newPoint.lng.toFixed(5)}</span>
                                <a
                                    href={`https://www.google.com/maps?q=${newPoint.lat},${newPoint.lng}`}
                                    target="_blank" rel="noreferrer" style={styles.mapsLink}
                                >
                                    🗺️ Vérifier sur Google Maps
                                </a>
                            </div>
                        ) : (
                            <p style={styles.coordsHint}>
                                💡 Sélectionnez une adresse dans la liste pour remplir automatiquement les coordonnées GPS.
                            </p>
                        )}

                        <button type="button" onClick={handleAddPoint} style={styles.addPointBtn} className="add-product-btn" disabled={addingPoint}>
                            {addingPoint ? '⏳ Ajout en cours...' : '+ Ajouter ce point de vente'}
                        </button>
                    </div>
                </div>

                {/* ── Bouton soumettre ── */}
                <button
                    type="submit"
                    style={{ ...styles.submitButton, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    className="add-product-btn"
                    disabled={loading}
                >
                    {loading ? 'Envoi en cours...' : cfg.submitLabel}
                </button>

            </form>
        </div>
    );
};

// Injection d'un CSS global pour les petites animations et pseudo-classes
const globalStyles = `
    .add-product-input {
        transition: all 0.3s ease;
    }
    .add-product-input:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
        background-color: #ffffff !important;
        outline: none;
    }
    .add-product-btn {
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }
    .add-product-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
    }
    .add-product-btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
    }
    .remove-point-btn:hover {
        background-color: rgba(239, 68, 68, 0.2) !important;
        color: #b91c1c !important;
    }
`;

if (typeof document !== 'undefined') {
    if (!document.getElementById('add-product-styles')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = 'add-product-styles';
        styleSheet.innerText = globalStyles;
        document.head.appendChild(styleSheet);
    }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
    form: { display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1900px', backgroundColor: '#ffffff', padding: '35px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' },
    input: { padding: '14px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', width: '100%', boxSizing: 'border-box', fontSize: '15px', backgroundColor: '#f8fafc', color: '#1e293b' },
    textarea: { padding: '14px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', minHeight: '100px', fontSize: '15px', resize: 'vertical', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'inherit' },
    autocompleteWrapper: { position: 'relative', width: '100%' },
    dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1000, listStyle: 'none', margin: '6px 0 0 0', padding: '6px 0', maxHeight: '260px', overflowY: 'auto' },
    dropdownItem: { padding: '12px 16px', cursor: 'pointer', fontSize: '14.5px', color: '#334155', transition: 'background-color 0.2s' },
    dropdownItemHighlighted: { backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: '600' },

    submitButton: { backgroundColor: '#2563eb', color: '#ffffff', padding: '16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '16px', marginTop: '10px' },

    sectionBox: { border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.015)' },
    sectionTitle: { margin: '0 0 4px 0', fontWeight: '800', fontSize: '16.5px', color: '#0f172a' },
    emptyPoints: { margin: 0, fontSize: '14px', color: '#64748b', fontStyle: 'italic' },

    pointsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    pointItem: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' },
    pointNom: { display: 'inline-block', fontWeight: '700', fontSize: '15.5px', color: '#0f172a', marginBottom: '4px' },
    pointAdresse: { display: 'block', fontSize: '13.5px', color: '#475569' },
    mapsLink: { display: 'inline-block', marginTop: '8px', fontSize: '13px', fontWeight: '600', color: '#3b82f6', textDecoration: 'none' },
    removeBtn: { background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '16px', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', transition: 'all 0.2s' },

    addPointBox: { backgroundColor: '#f0f9ff', border: '1.5px dashed #bae6fd', borderRadius: '10px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' },
    addPointTitle: { margin: 0, fontWeight: '700', fontSize: '15px', color: '#0284c7' },
    coordsPreview: { display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px 14px', fontSize: '13.5px', color: '#065f46', flexWrap: 'wrap' },
    coordsHint: { margin: 0, fontSize: '13px', color: '#64748b', fontStyle: 'italic' },
    addPointBtn: { backgroundColor: '#0ea5e9', color: '#ffffff', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14.5px' },
};

export default AddProductTab;