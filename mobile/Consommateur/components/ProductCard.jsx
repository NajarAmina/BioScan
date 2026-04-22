// mobile/components/ProductCard.jsx
import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';

export default function ProductCard({
  produit, user, isFavorite = false,
  onFavorite, onComment, onPress, baseUrl,
}) {
  const nom = produit?.nom || 'Produit sans nom';
  const marque = produit?.marque || produit?.brand || 'Marque non spécifiée';
  const isConsommateur = user?.role === 'consommateur';

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('data:image')) return img;
    if (img.startsWith('http')) return img;
    const normalized = img.replace(/\\/g, '/');
    const path = normalized.startsWith('/') ? normalized : `/${normalized}`;
    return `${baseUrl}${path}`;
  };
  const imageUrl = getImageUrl(produit?.image);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Image */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.noImage}>
          <Text style={{ fontSize: 40 }}>🌿</Text>
        </View>
      )}

      {/* Overlay bas */}
      <View style={styles.overlay}>
        <Text style={styles.name} numberOfLines={1}>{nom}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{marque}</Text>
      </View>

      {/* Boutons action */}
      <View style={styles.actions}>
        {/* Favori */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={(e) => { e.stopPropagation?.(); onFavorite && onFavorite(produit); }}
        >
          <Text style={{ fontSize: 16 }}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        {/* Commentaire */}
        {isConsommateur && onComment && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={(e) => { e.stopPropagation?.(); onComment(produit); }}
          >
            <Text style={{ fontSize: 16 }}>💬</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 14,
    marginBottom: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.07,
    shadowRadius: 10, elevation: 3,
    height: 200,
  },
  image: { width: '100%', height: '100%' },
  noImage: {
    width: '100%', height: '100%',
    backgroundColor: '#f1f5f9',
    justifyContent: 'center', alignItems: 'center',
  },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  name: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  actions: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'column', gap: 8,
  },
  actionBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
});
