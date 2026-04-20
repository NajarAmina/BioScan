import React from 'react';
import IngredientAnalysisCard from './IngredientAnalysisCard';

// ── Helper : convertir risque binaire 0/1 → texte lisible ────────────────────
const formatBinaryRisk = (value) => {
    if (value == null) return 'Inconnu';
    const num = Number(value);
    if (num === 0) return 'Faible';
    if (num === 1) return 'Élevé';
    // Fallback pour les valeurs texte du LLM
    return String(value);
};

const ResultatAnalyse = ({ product, isIngredientSearch = false }) => {
    if (!product) return null;

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith('data:image')) return img;
        const normalized = img.replace(/\\/g, '/');
        let path = normalized;
        if (!path.startsWith('http') && !path.startsWith('/')) path = `/${path}`;
        return `http://localhost:5000${path}`;
    };

    const imageUrl = getImageUrl(product.image);
    const origin = product.origine || 'Inconnue';
    const marque = product.marque || product.brand || 'Non spécifiée';
    const barcode = product.code_barre || product.codeBarres;
    const novaGroup = product.ai_predictions?.nova_group || product.nova_group || 1;
    const hasLLM = !!(product.ai_predictions?.llm?.ingredients?.length > 0);
    // ✅ Corrigé : cardio_risk=0 est falsy en JS, on utilise != null
    const hasIASection = hasLLM ||
        product.ai_predictions?.cardio_risk != null ||
        product.ai_predictions?.diabetes_risk != null ||
        product.ai_predictions?.bioscore != null ||
        product.nova_group !== undefined;

    return (
        <div style={{ ...styles.analysisReport, animation: 'fadeInUp 0.5s ease forwards' }}>
            {/* Section Visuelle */}
            {!isIngredientSearch && (
                <div style={styles.reportImageCol}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={product.nom} style={styles.productImage} onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Pas+d%27image'; }} />
                    ) : (
                        <div style={styles.noImagePlaceholder}>📷<br />Aucune image</div>
                    )}

                    <div style={styles.healthScoreCard}>
                        <div style={styles.healthScoreRing}>
                            <span style={styles.healthScoreValue}>{product.ai_predictions?.bioscore || product.scoreBio || 0}</span>
                            <span style={styles.healthScoreLabel}>/100</span>
                        </div>
                        <span style={styles.healthScoreDesc}>Score Santé / Bio (IA)</span>
                    </div>
                </div>
            )}

            {/* Section Infos */}
            <div style={styles.reportInfoCol}>
                <div style={styles.reportHeader}>
                    <div style={styles.brandTag}>{marque}</div>
                    <h3 style={styles.reportTitle}>{product.nom}</h3>
                    {!isIngredientSearch && (
                        <p style={styles.reportOrigin}>📍 Origine : <strong>{origin}</strong></p>
                    )}
                    {product.ai_predictions?.llm?.qualite_globale && (
                        <p style={styles.reportOrigin}>📂 Catégorie qualité : <strong>{product.ai_predictions.llm.qualite_globale}</strong></p>
                    )}
                    {barcode && (
                        <p style={styles.reportBarcode}>🏷️ Code-barres : <strong>{barcode}</strong></p>
                    )}
                </div>

                <p style={styles.reportDesc}>{product.description || "Aucune description détaillée n'est disponible."}</p>

                <div style={styles.ingredientsSection}>
                    <h4 style={styles.sectionHeading}>🧪 Composition</h4>
                    <div style={styles.ingredientsList}>
                        {product.ingredients && product.ingredients.length > 0 ? (
                            product.ingredients.map((ing, idx) => (
                                <div key={ing._id || idx} style={{ ...styles.ingredientPill, borderColor: ing.estBio ? '#4ade80' : '#e5e7eb', backgroundColor: ing.estBio ? '#f0fdf4' : '#f9fafb' }}>
                                    {ing.estBio ? '🌱 ' : ''}{ing.nom}
                                </div>
                            ))
                        ) : (
                            <span style={styles.emptyText}>Aucun ingrédient répertorié.</span>
                        )}
                    </div>
                </div>

                {/* Section Points de Vente */}
                {product.pointsDeVente && product.pointsDeVente.length > 0 && (
                    <div style={styles.pointsVenteSection}>
                        <h4 style={styles.sectionHeading}>🏪 Points de Vente</h4>
                        <div style={styles.pointsVenteList}>
                            {product.pointsDeVente.map((pv, idx) => (
                                <div key={pv._id || idx} style={styles.pointVenteCard}>
                                    <strong style={styles.pointVenteName}>{pv.nom || 'Magasin'}</strong>
                                    {pv.adresse && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pv.adresse)}`}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            style={styles.pointVenteAddress}
                                        >
                                            📍 {pv.adresse}
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section Prédictions IA */}
                {hasIASection && (
                    <div style={styles.aiSection}>
                        <h4 style={styles.sectionHeading}>🤖 Analyse IA & Santé</h4>
                        <div style={styles.aiSectionHeader}>
                            <span style={{
                                ...styles.novaBadge,
                                ...getNovaBadgeStyle(novaGroup)
                            }}>
                                NOVA {novaGroup}
                                <span style={styles.novaDescription}>
                                    {getNoveDescription(novaGroup)}
                                </span>
                            </span>
                        </div>

                        <div style={styles.aiCardsContainer}>
                            {isIngredientSearch && (
                                <div style={styles.aiCard}>
                                    <div style={styles.aiCardIcon}>🌿</div>
                                    <div style={styles.aiCardContent}>
                                        <span style={styles.aiCardTitle}>Score Santé</span>
                                        <span style={{
                                            ...styles.aiCardValue,
                                            color: getProbaColor(100 - (product.ai_predictions?.bioscore || product.scoreBio || 0))
                                        }}>
                                            {product.ai_predictions?.bioscore || product.scoreBio || 0}%
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Risque Cardio — classification binaire 0/1 + proba */}
                            <div style={styles.aiCard}>
                                <div style={styles.aiCardIcon}>🫀</div>
                                <div style={styles.aiCardContent}>
                                    <span style={styles.aiCardTitle}>Risque Cardio</span>
                                    <span style={{ ...styles.aiCardValue, color: getRiskColor(product.ai_predictions?.cardio_risk) }}>
                                        {product.ai_predictions?.cardio_risk != null
                                            ? formatBinaryRisk(product.ai_predictions.cardio_risk)
                                            : 'Inconnu'}
                                        {product.ai_predictions?.cardio_risk_proba != null
                                            ? ` (${product.ai_predictions.cardio_risk_proba}%)`
                                            : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Risque Diabète — classification binaire 0/1 + proba */}
                            <div style={styles.aiCard}>
                                <div style={styles.aiCardIcon}>🩸</div>
                                <div style={styles.aiCardContent}>
                                    <span style={styles.aiCardTitle}>Risque Diabète</span>
                                    <span style={{ ...styles.aiCardValue, color: getRiskColor(product.ai_predictions?.diabetes_risk) }}>
                                        {product.ai_predictions?.diabetes_risk != null
                                            ? formatBinaryRisk(product.ai_predictions.diabetes_risk)
                                            : 'Inconnu'}
                                        {product.ai_predictions?.diabetes_risk_proba != null
                                            ? ` (${product.ai_predictions.diabetes_risk_proba}%)`
                                            : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Exp. Additifs — régression [0-1] affiché en % */}
                            <div style={styles.aiCard}>
                                <div style={styles.aiCardIcon}>🧪</div>
                                <div style={styles.aiCardContent}>
                                    <span style={styles.aiCardTitle}>Exp. Additifs</span>
                                    <span style={{
                                        ...styles.aiCardValue,
                                        color: getProbaColor(product.ai_predictions?.additive_exposure)
                                    }}>
                                        {product.ai_predictions?.additive_exposure != null
                                            ? `${product.ai_predictions.additive_exposure}%`
                                            : 'Inconnu'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section LLM Analysis */}
            {hasLLM && (
                <div style={styles.llmSection}>
                    <h3 style={styles.llmSectionTitle}>🔬 Analyse LLM Détaillée des Ingrédients</h3>

                    {product.ai_predictions.llm.resume_global && (
                        <div style={styles.llmResume}>
                            <p style={{ margin: 0, color: '#334155', fontSize: '0.95rem' }}>
                                {product.ai_predictions.llm.resume_global}
                            </p>
                            {product.ai_predictions.llm.qualite_globale && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.3rem 0.7rem',
                                        borderRadius: '2rem',
                                        backgroundColor: getQualityColor(product.ai_predictions.llm.qualite_globale) + '20',
                                        color: getQualityColor(product.ai_predictions.llm.qualite_globale),
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                    }}>
                                        Qualité : {product.ai_predictions.llm.qualite_globale}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ingredients Cards */}
                    <div style={styles.llmIngredientsContainer}>
                        {product.ai_predictions.llm.ingredients.map((ingredient, idx) => (
                            <IngredientAnalysisCard key={idx} ingredient={ingredient} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const getQualityColor = (qualite) => {
    if (!qualite) return '#64748b';
    const lower = qualite.toLowerCase();
    if (lower === 'excellente') return '#10b981';
    if (lower === 'bonne') return '#3b82f6';
    if (lower === 'modérée') return '#f59e0b';
    if (lower === 'faible') return '#ef4444';
    return '#64748b';
};

const getRiskColor = (risk) => {
    if (risk == null) return '#64748b';
    const lowerRisk = risk.toString().toLowerCase();
    if (lowerRisk === 'low' || lowerRisk === 'faible' || lowerRisk === '0') return '#10b981';
    if (lowerRisk === 'medium' || lowerRisk === 'moyen') return '#f59e0b';
    if (lowerRisk === 'high' || lowerRisk === 'élevé' || lowerRisk === '1') return '#ef4444';
    return '#64748b';
};

const getProbaColor = (proba) => {
    if (proba == null) return '#64748b';
    const val = parseFloat(proba);
    if (isNaN(val)) return '#64748b';
    if (val < 30) return '#10b981';
    if (val < 60) return '#f59e0b';
    return '#ef4444';
};

const getNovaBadgeStyle = (novaGroup) => {
    switch (Number(novaGroup)) {
        case 1: return { backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#16a34a' };
        case 2: return { backgroundColor: '#fefce8', borderColor: '#fde047', color: '#ca8a04' };
        case 3: return { backgroundColor: '#fff7ed', borderColor: '#fdba74', color: '#ea580c' };
        case 4: return { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626' };
        default: return { backgroundColor: '#eef2ff', borderColor: '#c7d2fe', color: '#4338ca' };
    }
};

const getNoveDescription = (novaGroup) => {
    switch (Number(novaGroup)) {
        case 1: return 'Aliments non transformés';
        case 2: return 'Ingrédients culinaires transformés';
        case 3: return 'Produits transformés à consommer occasionnellement';
        case 4: return 'Produits ultra-transformés à limiter';
        default: return 'Niveau NOVA inconnu';
    }
};

const styles = {
    analysisReport: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '1.5rem',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
        width: '100%'
    },
    reportImageCol: { flex: '1 1 180px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
    productImage: { width: '100%', maxWidth: '200px', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '1rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', backgroundColor: '#fff' },
    noImagePlaceholder: { width: '100%', maxWidth: '200px', aspectRatio: '3/4', backgroundColor: '#f1f5f9', borderRadius: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1rem', textAlign: 'center', border: '2px dashed #cbd5e1' },
    healthScoreCard: { backgroundColor: '#fff', padding: '1rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', width: '100%', maxWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', border: '1px solid #f1f5f9' },
    healthScoreRing: { width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'conic-gradient(#16a34a 75%, #dcfce7 0)', border: '3px solid #fff', boxShadow: '0 0 0 1px #e2e8f0' },
    healthScoreValue: { fontSize: '1.25rem', fontWeight: '800', color: '#16a34a', backgroundColor: '#fff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    healthScoreLabel: { position: 'absolute', visibility: 'hidden' },
    healthScoreDesc: { fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },

    reportInfoCol: { flex: '2 1 250px', display: 'flex', flexDirection: 'column', gap: '1rem' },
    reportHeader: { borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' },
    brandTag: { fontSize: '0.8rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' },
    reportTitle: { fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: 1.1 },
    reportOrigin: { fontSize: '0.9rem', color: '#475569', margin: '0 0 0.25rem 0' },
    reportBarcode: { fontSize: '0.9rem', color: '#475569', margin: 0 },
    reportDesc: { fontSize: '0.95rem', color: '#334155', lineHeight: 1.5, margin: 0 },

    ingredientsSection: { marginTop: '0.5rem' },
    sectionHeading: { fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    ingredientsList: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
    ingredientPill: { padding: '0.4rem 0.8rem', borderRadius: '0.5rem', border: '1px solid', fontSize: '0.85rem', fontWeight: '500', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.25rem' },
    emptyText: { color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' },

    pointsVenteSection: { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' },
    pointsVenteList: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' },
    pointVenteCard: { padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', minWidth: '140px' },
    pointVenteName: { fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' },
    pointVenteAddress: { fontSize: '0.75rem', color: '#64748b' },

    aiSection: { marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1' },
    aiSectionHeader: { display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' },
    novaBadge: { display: 'inline-flex', flexDirection: 'column', gap: '0.2rem', padding: '0.75rem 1rem', borderRadius: '1rem', border: '1px solid', fontWeight: '700', maxWidth: 'fit-content' },
    novaDescription: { fontSize: '0.8rem', fontWeight: '500', marginTop: '0.25rem' },
    aiCardsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginTop: '1rem' },
    aiCard: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0', transition: 'transform 0.2s ease', cursor: 'default' },
    aiCardIcon: { fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: '#ffffff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    aiCardContent: { display: 'flex', flexDirection: 'column' },
    aiCardTitle: { fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.25rem' },
    aiCardValue: { fontSize: '1rem', fontWeight: '800' },

    llmSection: { marginTop: '2rem', paddingTop: '2rem', borderTop: '1px dashed #cbd5e1', width: '100%' },
    llmSectionTitle: { fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    llmResume: {
        padding: '1rem',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        backgroundColor: '#f0f9ff',
        marginBottom: '1.5rem'
    },
    llmIngredientsContainer: { display: 'flex', flexDirection: 'column', gap: '1.25rem' }
};

export default ResultatAnalyse;