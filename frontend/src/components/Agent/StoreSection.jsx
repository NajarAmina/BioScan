import React, { useState, useRef, useEffect } from 'react';
import './ProductManagement.css';

// ─── Autocomplete Adresse Nominatim (identique à AddProductTab) ───────────────
const AdresseAutocomplete = ({ value, onChange, onSelectCoords }) => {
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
            setSuggestions(data || []);
            setOpen((data || []).length > 0);
        } catch {
            setSuggestions([]); setOpen(false);
        } finally {
            setLoadingAddr(false);
        }
    };

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);
        onChange(val);
        // Reset coords si l'utilisateur retape manuellement
        onSelectCoords({ lat: null, lng: null });
        setHighlighted(-1);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
    };

    const handleSelect = (item) => {
        const addr = item.display_name.replace(/, Tunisie$/, '').replace(/, Tunisia$/, '');
        setQuery(addr);
        onChange(addr);
        onSelectCoords({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
        setSuggestions([]);
        setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!open) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
        else if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); handleSelect(suggestions[highlighted]); }
        else if (e.key === 'Escape') setOpen(false);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Adresse en Tunisie 📍 — tapez pour chercher"
                    value={query}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    className="pm-input"
                    autoComplete="off"
                />
                {loadingAddr && (
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#999' }}>
                        ⏳
                    </span>
                )}
            </div>

            {open && (
                <ul style={addrStyles.dropdown}>
                    {suggestions.map((item, i) => {
                        const addr = item.display_name.replace(/, Tunisie$/, '').replace(/, Tunisia$/, '');
                        const parts = addr.split(', ');
                        return (
                            <li
                                key={item.place_id}
                                onMouseDown={() => handleSelect(item)}
                                onMouseEnter={() => setHighlighted(i)}
                                style={{ ...addrStyles.dropdownItem, ...(i === highlighted ? addrStyles.dropdownItemHighlighted : {}) }}
                            >
                                <div style={{ fontWeight: 600, fontSize: 13 }}>📍 {parts[0]}</div>
                                {parts.slice(1).join(', ') && (
                                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{parts.slice(1).join(', ')}</div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

const addrStyles = {
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
        zIndex: 1000,
        listStyle: 'none',
        margin: '6px 0 0 0',
        padding: '6px 0',
        maxHeight: 260,
        overflowY: 'auto',
    },
    dropdownItem: {
        padding: '12px 16px',
        cursor: 'pointer',
        fontSize: 14,
        color: 'var(--text-secondary)',
        transition: 'background-color 0.15s ease',
    },
    dropdownItemHighlighted: {
        backgroundColor: 'var(--bg-input)',
        color: 'var(--text-primary)',
        fontWeight: 600,
    },
};

// ─── StoreSection ─────────────────────────────────────────────────────────────
const StoreSection = ({ pointsDeVente, newPoint, setNewPoint, onAddPoint, onDeletePoint }) => {

    return (
        <div>
            <h3 className="pm-section-title">➕ Ajouter un point de vente</h3>

            {/* Ligne : Nom + Adresse autocomplete + Bouton */}
            <div className="pm-point-form">
                <input
                    placeholder="Nom du point de vente"
                    value={newPoint.nom}
                    onChange={e => setNewPoint({ ...newPoint, nom: e.target.value })}
                    className="pm-input"
                />

                <AdresseAutocomplete
                    value={newPoint.adresse}
                    onChange={val => setNewPoint(prev => ({ ...prev, adresse: val }))}
                    onSelectCoords={({ lat, lng }) => setNewPoint(prev => ({ ...prev, lat, lng }))}
                />

                <button onClick={onAddPoint} className="pm-btn pm-btn-success">+ Ajouter</button>
            </div>

            {/* Aperçu coordonnées GPS */}
            {newPoint.lat && newPoint.lng ? (
                <div className="pm-coord-preview">
                    <span>✅ GPS : {newPoint.lat.toFixed(5)}, {newPoint.lng.toFixed(5)}</span>
                    <a
                        href={`https://www.google.com/maps?q=${newPoint.lat},${newPoint.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="pm-maps-link"
                    >
                        🗺️ Vérifier sur Google Maps
                    </a>
                </div>
            ) : (
                newPoint.adresse?.trim() && (
                    <p className="pm-gps-hint">
                        💡 Sélectionnez une adresse dans la liste pour remplir les coordonnées GPS automatiquement.
                    </p>
                )
            )}

            <h3 className="pm-section-title" style={{ marginTop: 24 }}>📋 Liste des points de vente</h3>

            {pointsDeVente.length === 0 ? (
                <p className="pm-empty">Aucun point de vente enregistré.</p>
            ) : (
                pointsDeVente.map(pv => (
                    <div key={pv._id} className="pm-point-card">
                        <div>
                            <strong className="pm-point-name">{pv.nom}</strong>
                            <p className="pm-point-address">📍 {pv.adresse}</p>
                            {pv.lat && pv.lng && (
                                <div className="pm-maps-box">
                                    <span className="pm-gps-text">
                                        GPS : {Number(pv.lat).toFixed(5)}, {Number(pv.lng).toFixed(5)}
                                    </span>
                                    <a
                                        href={`https://www.google.com/maps?q=${pv.lat},${pv.lng}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="pm-maps-link"
                                    >
                                        🗺️ Voir sur Google Maps
                                    </a>
                                </div>
                            )}
                        </div>
                        <button onClick={() => onDeletePoint(pv)} className="pm-btn-danger-sm">
                            🗑️
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

export default StoreSection;
