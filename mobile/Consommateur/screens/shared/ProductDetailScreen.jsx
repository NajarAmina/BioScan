// mobile/screens/shared/ProductDetailScreen.jsx
import React from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Linking,
} from 'react-native';
import { BASE_URL } from '../../../services/api';

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('data:image')) return img;
  const normalized = img.replace(/\\/g, '/');
  const path = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return img.startsWith('http') ? img : `${BASE_URL}${path}`;
};

const getNovaBadgeColor = (novaGroup) => {
  switch (Number(novaGroup)) {
    case 1: return { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' };
    case 2: return { bg: '#fefce8', border: '#fde047', text: '#ca8a04' };
    case 3: return { bg: '#fff7ed', border: '#fdba74', text: '#ea580c' };
    case 4: return { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' };
    default: return { bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca' };
  }
};

const getNoveDescription = (n) => {
  switch (Number(n)) {
    case 1: return 'Aliments non transformés';
    case 2: return 'Ingrédients culinaires';
    case 3: return 'Produits transformés';
    case 4: return 'Ultra-transformés';
    default: return 'Niveau inconnu';
  }
};

const getRiskColor = (risk) => {
  if (risk == null) return '#64748b';
  const v = risk.toString().toLowerCase();
  if (v === '0' || v === 'faible' || v === 'low') return '#10b981';
  if (v === 'moyen' || v === 'medium') return '#f59e0b';
  if (v === '1' || v === 'élevé' || v === 'high') return '#ef4444';
  return '#64748b';
};

export default function ProductDetailScreen({ product, onBack, user, isFavorite, onFavorite }) {
  if (!product) return null;

  const imageUrl = getImageUrl(product.image);
  const novaGroup = product.ai_predictions?.nova_group || product.nova_group || 1;
  const novaBadge = getNovaBadgeColor(novaGroup);
  const bioscore = product.ai_predictions?.bioscore || product.scoreBio || 0;
  const cardioRisk = product.ai_predictions?.cardio_risk;
  const diabetesRisk = product.ai_predictions?.diabetes_risk;
  const marque = product.marque || product.brand || 'Non spécifiée';
  const origin = product.origine || 'Inconnue';
  const barcode = product.code_barre || product.codeBarres;
  const pid = product._id || product.id;
  const favored = isFavorite ? isFavorite(pid) : false;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Bouton retour */}
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
      )}

      {/* Image */}
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.noImage}>
          <Text style={{ fontSize: 40 }}>📷</Text>
          <Text style={{ color: '#94a3b8', marginTop: 8 }}>Aucune image</Text>
        </View>
      )}

      {/* Score santé */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>{bioscore}</Text>
          <Text style={styles.scoreLabel}>/100{'\n'}Score Santé</Text>
        </View>
        <View style={[styles.novaBadge, { backgroundColor: novaBadge.bg, borderColor: novaBadge.border }]}>
          <Text style={[styles.novaText, { color: novaBadge.text }]}>NOVA {novaGroup}</Text>
          <Text style={[styles.novaDesc, { color: novaBadge.text }]}>{getNoveDescription(novaGroup)}</Text>
        </View>
        {onFavorite && (
          <TouchableOpacity
            style={[styles.favBtn, favored && styles.favBtnActive]}
            onPress={() => onFavorite(product)}
          >
            <Text style={{ fontSize: 22 }}>{favored ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoBox}>
        {/* Infos de base */}
        <Text style={styles.brandTag}>{marque}</Text>
        <Text style={styles.productName}>{product.nom}</Text>
        <Text style={styles.metaText}>📍 Origine : <Text style={styles.bold}>{origin}</Text></Text>
        {barcode && <Text style={styles.metaText}>🏷️ Code-barres : <Text style={styles.bold}>{barcode}</Text></Text>}
        {product.description ? (
          <Text style={styles.description}>{product.description}</Text>
        ) : null}

        {/* Ingrédients */}
        {product.ingredients?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧪 Composition</Text>
            <View style={styles.pillsRow}>
              {product.ingredients.map((ing, idx) => (
                <View key={idx} style={[styles.pill, ing.estBio && styles.pillBio]}>
                  <Text style={[styles.pillText, ing.estBio && styles.pillTextBio]}>
                    {ing.estBio ? '🌱 ' : ''}{ing.nom}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Risques IA */}
        {(cardioRisk != null || diabetesRisk != null) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 Analyse IA & Santé</Text>
            <View style={styles.riskRow}>
              {cardioRisk != null && (
                <View style={styles.riskCard}>
                  <Text style={styles.riskIcon}>❤️</Text>
                  <Text style={styles.riskLabel}>Risque Cardio</Text>
                  <Text style={[styles.riskValue, { color: getRiskColor(cardioRisk) }]}>
                    {cardioRisk === 0 || cardioRisk === '0' ? 'Faible' : 'Élevé'}
                  </Text>
                </View>
              )}
              {diabetesRisk != null && (
                <View style={styles.riskCard}>
                  <Text style={styles.riskIcon}>🩸</Text>
                  <Text style={styles.riskLabel}>Risque Diabète</Text>
                  <Text style={[styles.riskValue, { color: getRiskColor(diabetesRisk) }]}>
                    {diabetesRisk === 0 || diabetesRisk === '0' ? 'Faible' : 'Élevé'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Points de vente */}
        {product.pointsDeVente?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏪 Points de Vente</Text>
            {product.pointsDeVente.map((pv, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.pvCard}
                onPress={() => pv.adresse && Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pv.adresse)}`
                )}
              >
                <Text style={styles.pvName}>{pv.nom || 'Magasin'}</Text>
                {pv.adresse && <Text style={styles.pvAddr}>📍 {pv.adresse}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* LLM Ingrédients */}
        {product.ai_predictions?.llm?.ingredients?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔬 Analyse détaillée des ingrédients</Text>
            {product.ai_predictions.llm.ingredients.map((ing, idx) => (
              <View key={idx} style={styles.llmCard}>
                <Text style={styles.llmIngName}>{ing.nom || ing.name}</Text>
                {ing.risque && (
                  <Text style={[styles.llmRisk, { color: getRiskColor(ing.risque) }]}>
                    Risque : {ing.risque}
                  </Text>
                )}
                {ing.description && (
                  <Text style={styles.llmDesc}>{ing.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  backBtn: {
    margin: 16, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  backBtnText: { color: '#1e293b', fontWeight: '600', fontSize: 15 },

  image: { width: '100%', height: 280, backgroundColor: '#f1f5f9' },
  noImage: {
    width: '100%', height: 200, backgroundColor: '#f1f5f9',
    justifyContent: 'center', alignItems: 'center',
  },

  scoreRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, flexWrap: 'wrap',
  },
  scoreBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0fdf4', borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: '#86efac', gap: 6,
  },
  scoreValue: { fontSize: 28, fontWeight: '900', color: '#16a34a' },
  scoreLabel: { fontSize: 11, color: '#16a34a', fontWeight: '600', lineHeight: 16 },

  novaBadge: {
    flex: 1, borderRadius: 12, padding: 10,
    borderWidth: 1, minWidth: 120,
  },
  novaText: { fontSize: 14, fontWeight: '800' },
  novaDesc: { fontSize: 11, fontWeight: '500', marginTop: 2 },

  favBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
    justifyContent: 'center', alignItems: 'center',
  },
  favBtnActive: { backgroundColor: '#fff0f0', borderColor: '#fca5a5' },

  infoBox: { padding: 16, gap: 8 },
  brandTag: { fontSize: 12, fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 24, fontWeight: '800', color: '#0f172a', lineHeight: 30 },
  metaText: { fontSize: 14, color: '#475569', marginTop: 2 },
  bold: { fontWeight: '700', color: '#0f172a' },
  description: { fontSize: 14, color: '#334155', lineHeight: 22, marginTop: 8 },

  section: {
    marginTop: 20, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },

  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  pillBio: { borderColor: '#4ade80', backgroundColor: '#f0fdf4' },
  pillText: { fontSize: 13, color: '#1f2937' },
  pillTextBio: { color: '#15803d' },

  riskRow: { flexDirection: 'row', gap: 12 },
  riskCard: {
    flex: 1, backgroundColor: '#f8fafc', borderRadius: 12,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  riskIcon: { fontSize: 24 },
  riskLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', textAlign: 'center' },
  riskValue: { fontSize: 16, fontWeight: '800', textAlign: 'center' },

  pvCard: {
    backgroundColor: '#f8fafc', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8,
  },
  pvName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  pvAddr: { fontSize: 12, color: '#64748b', marginTop: 2 },

  llmCard: {
    backgroundColor: '#f0f9ff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#bae6fd', marginBottom: 10, gap: 4,
  },
  llmIngName: { fontSize: 15, fontWeight: '700', color: '#0c4a6e' },
  llmRisk: { fontSize: 13, fontWeight: '600' },
  llmDesc: { fontSize: 13, color: '#334155', lineHeight: 18 },
});
