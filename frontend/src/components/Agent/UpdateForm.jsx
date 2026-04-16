import React from 'react';

const UpdateForm = ({ form, setForm, pointsDeVente, onSubmit, onCancel, S, PAYS }) => {
    const readFile = (file) => new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(String(reader.result || ''));
        reader.onerror = () => rej(new Error('Erreur lecture image'));
        reader.readAsDataURL(file);
    });

    return (
        <div style={S.formCard}>
            <div style={S.formGrid}>
                <input
                    placeholder="Nom du produit *"
                    value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                    style={S.input}
                />
                <input
                    placeholder="Code-barre *"
                    value={form.code_barre}
                    onChange={e => setForm({ ...form, code_barre: e.target.value })}
                    style={S.input}
                />
            </div>

            {/* Autocomplete simplifié pour le pays */}
            <select
                value={form.origine}
                onChange={e => setForm({ ...form, origine: e.target.value })}
                style={S.input}
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
                style={{ ...S.input, minHeight: 80, resize: 'vertical' }}
            />

            <textarea
                placeholder="Ingrédients"
                value={form.ingredients}
                onChange={e => setForm({ ...form, ingredients: e.target.value })}
                style={{ ...S.input, minHeight: 60, resize: 'vertical' }}
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
                style={S.input}
            />

            {form.image && (
                <img src={form.image} alt="Aperçu" style={{ maxWidth: 180, borderRadius: 8, marginTop: 6 }} />
            )}

            <label style={{ fontSize: 13, color: '#555' }}>Points de vente</label>
            <select
                multiple
                value={form.pointsDeVente || []}
                onChange={e => {
                    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                    setForm({ ...form, pointsDeVente: selected });
                }}
                style={{ ...S.input, minHeight: 90 }}
            >
                {pointsDeVente.map(pv => (
                    <option key={pv._id} value={pv._id}>
                        {pv.nom} — {pv.adresse}
                    </option>
                ))}
            </select>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={onSubmit} style={S.btnSuccess}>💾 Enregistrer les modifications</button>
                <button onClick={onCancel} style={S.btnSecondary}>Annuler</button>
            </div>
        </div>
    );
};

export default UpdateForm;