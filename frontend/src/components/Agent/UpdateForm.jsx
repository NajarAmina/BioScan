import React from 'react';
import './ProductManagement.css';

const UpdateForm = ({ form, setForm, pointsDeVente, onSubmit, onCancel, PAYS }) => {
    const readFile = (file) => new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(String(reader.result || ''));
        reader.onerror = () => rej(new Error('Erreur lecture image'));
        reader.readAsDataURL(file);
    });

    return (
        <div className="pm-form-card">
            <div className="pm-form-grid">
                <input
                    placeholder="Nom du produit *"
                    value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                    className="pm-input"
                />
                <input
                    placeholder="Code-barre *"
                    value={form.code_barre}
                    onChange={e => setForm({ ...form, code_barre: e.target.value })}
                    className="pm-input"
                />
            </div>

            {/* Autocomplete simplifié pour le pays */}
            <select
                value={form.origine}
                onChange={e => setForm({ ...form, origine: e.target.value })}
                className="pm-input"
            >
                <option value="">-- Choisir le pays d'origine --</option>
                {PAYS.map(pays => (
                    <option key={pays} value={pays}>{pays}</option>
                ))}
            </select>

            <textarea
                placeholder="Description *"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="pm-input"
                style={{ minHeight: 80, resize: 'vertical' }}
            />

            <textarea
                placeholder="Ingrédients"
                value={form.ingredients}
                onChange={e => setForm({ ...form, ingredients: e.target.value })}
                className="pm-input"
                style={{ minHeight: 60, resize: 'vertical' }}
            />

            <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                        const base64 = await readFile(file);
                        setForm({ ...form, image: base64 });
                    } catch {
                        alert("Impossible de lire l'image");
                    }
                }}
                className="pm-input"
            />

            {form.image && (
                <img src={form.image} alt="Aperçu" className="pm-img-preview" />
            )}

            <label className="pm-form-label">Points de vente</label>
            <select
                multiple
                value={form.pointsDeVente || []}
                onChange={e => {
                    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                    setForm({ ...form, pointsDeVente: selected });
                }}
                className="pm-input"
                style={{ minHeight: 90 }}
            >
                {pointsDeVente.map(pv => (
                    <option key={pv._id} value={pv._id}>
                        {pv.nom} — {pv.adresse}
                    </option>
                ))}
            </select>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={onSubmit} className="pm-btn pm-btn-success">💾 Enregistrer les modifications</button>
                <button onClick={onCancel} className="pm-btn pm-btn-secondary">Annuler</button>
            </div>
        </div>
    );
};

export default UpdateForm;