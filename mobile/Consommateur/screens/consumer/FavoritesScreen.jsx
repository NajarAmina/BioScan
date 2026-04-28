// mobile/screens/consumer/FavoritesScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import useFavorites from '../../../hooks/useFavorites';
import ProductCard from '../../components/ProductCard';
import ProductDetailScreen from '../shared/ProductDetailScreen';
import { BASE_URL } from '../../../services/api';

export default function FavoritesScreen({ navigation }) {
  const { user } = useAuth();
 const { favorites, isFavorite, removeFavorite } = useFavorites(user?._id || user?.id, user?.role);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getProductId = (p) => p?._id || p?.id_produit || p?.id;

  if (selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        isFavorite={isFavorite}
        onFavorite={(p) => { removeFavorite(getProductId(p)); setSelectedProduct(null); }}
        user={user}
      />
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 60, marginBottom: 16 }}>❤️</Text>
        <Text style={styles.emptyTitle}>Aucun favori</Text>
        <Text style={styles.emptyText}>Explorez les produits et ajoutez vos favoris</Text>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => navigation.navigate('Accueil')}
        >
          <Text style={styles.exploreBtnText}>Explorer les produits</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => String(getProductId(item))}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <Text style={styles.header}>❤️ Mes Favoris ({favorites.length})</Text>
      }
      renderItem={({ item }) => (
        <ProductCard
          produit={item}
          user={user}
          isFavorite={true}
          onFavorite={() => {
            Alert.alert('Retirer', `Retirer ${item.nom} des favoris ?`, [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Retirer', style: 'destructive', onPress: () => removeFavorite(getProductId(item)) },
            ]);
          }}
          onPress={() => setSelectedProduct(item)}
          baseUrl={BASE_URL}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  header: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  empty: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 40, backgroundColor: '#f8fafc', gap: 8,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  exploreBtn: {
    backgroundColor: '#16a34a', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 16,
  },
  exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
