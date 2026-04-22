// mobile/screens/consumer/HistoryScreen.jsx
import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import useHistory from '../../../hooks/useHistory';

export default function HistoryScreen({ navigation }) {
  const { user } = useAuth();
  const isConsommateur = user?.role === 'consommateur';
  const { searchHistory, removeFromHistory, clearHistory } = useHistory(
    isConsommateur ? user?.id : null
  );

  const handleClearAll = () => {
    Alert.alert('Confirmation', 'Supprimer tout votre historique ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: clearHistory },
    ]);
  };

  if (searchHistory.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 60, marginBottom: 16 }}>🕐</Text>
        <Text style={styles.emptyTitle}>Aucun historique</Text>
        <Text style={styles.emptyText}>Vos recherches apparaîtront ici</Text>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => navigation.navigate('Accueil')}
        >
          <Text style={styles.exploreBtnText}>Faire une recherche</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={searchHistory}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.headerRow}>
          <Text style={styles.header}>🕐 Mon Historique</Text>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
            <Text style={styles.clearBtnText}>🗑️ Tout supprimer</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Text style={styles.itemQuery}>{item.query}</Text>
            <Text style={styles.itemDate}>
              {new Date(item.date).toLocaleString('fr-FR')}
            </Text>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.reSearchBtn}
              onPress={() => navigation.navigate('HomeMain', { searchQuery: item.query })}
            >
              <Text style={styles.reSearchText}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => removeFromHistory(item.id)}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  header: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  clearBtn: {
    borderWidth: 1, borderColor: '#ef4444', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  clearBtnText: { color: '#ef4444', fontWeight: '600', fontSize: 13 },

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

  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  itemLeft: { flex: 1, gap: 4 },
  itemQuery: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  itemDate: { fontSize: 12, color: '#94a3b8' },
  itemActions: { flexDirection: 'row', gap: 8 },
  reSearchBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center',
  },
  reSearchText: { fontSize: 16 },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center',
  },
  deleteBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
});
