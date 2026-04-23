// mobile/Consommateur/screens/shared/HomeScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Alert,
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import useFavorites from '../../../hooks/useFavorites';
import useHistory from '../../../hooks/useHistory';
import useComments from '../../../hooks/useComments';
import ProductCard from '../../components/ProductCard';
import ProductDetailScreen from './ProductDetailScreen';
import api, { BASE_URL } from '../../../services/api';


export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const isConsommateur = user?.role === 'consommateur';

  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('produit');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const { isFavorite, addFavorite } = useFavorites(user?.id, user?.role);
  const { addToHistory } = useHistory(isConsommateur ? user?.id : null);
  const { getAverageRating, getProductComments } = useComments();

  // Chargement des produits
  useEffect(() => {
    api.get('/produits?status=approved')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAllProducts(res.data);
          setDisplayProducts(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Reset quand recherche effacée
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayProducts(allProducts);
      setSelectedProduct(null);
    }
  }, [searchQuery, allProducts]);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) { setDisplayProducts(allProducts); return; }

    setIsAnalyzing(true);
    try {
      if (searchMode === 'produit') {
        const res = await api.get(`/produits/search?q=${encodeURIComponent(query)}`);
        const results = Array.isArray(res.data) ? res.data : [];
        setDisplayProducts(results);
        if (isConsommateur && results.length > 0) addToHistory(query);
      } else {
        const res = await api.post('/analyses/predict-ingredients-llm', {
          ingredients_text: query,
        });
        const predictions = res.data.predictions || {};
        const ingList = query.split(',').map((s) => s.trim()).filter(Boolean);
        const customProduct = {
          nom: 'Analyse des ingrédients',
          description: `Ingrédients analysés : ${query}`,
          ingredients: ingList.map((nom) => ({ nom, estBio: false })),
          ai_predictions: predictions,
          scoreBio: predictions.bioscore || 0,
          nova_group: predictions.nova_group || 1,
          image: null,
          origine: 'Analyse personnalisée',
          marque: 'BioScan AI',
        };
        setSelectedProduct(customProduct);
        if (isConsommateur) addToHistory(query);
      }
    } catch {
      const lowerQ = query.toLowerCase();
      const results = allProducts.filter(
        (p) =>
          p.nom?.toLowerCase().includes(lowerQ) ||
          (p.ingredients?.some((i) => i.nom?.toLowerCase().includes(lowerQ)))
      );
      setDisplayProducts(results);
      if (isConsommateur && results.length > 0) addToHistory(query);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectProduct = async (produit) => {
    setIsAnalyzing(true);
    try {
      const ingredients = produit?.ingredients || [];
      const ingredientsText = ingredients.length > 0
        ? ingredients.map((i) => i.nom || '').filter(Boolean).join(', ')
        : produit?.description || produit?.nom || '';
      const res = await api.post('/analyses/predict', { ingredients_text: ingredientsText });
      const predictions = res.data.predictions || {};
      setSelectedProduct({
        ...produit,
        ai_predictions: predictions,
        scoreBio: predictions.bioscore ?? produit.scoreBio,
        nova_group: predictions.nova_group ?? produit.nova_group,
      });
    } catch {
      setSelectedProduct(produit);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFavorite = (produit) => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour ajouter des favoris.', [
        { text: 'Connexion', onPress: () => navigation.navigate('Login') },
        { text: 'Annuler', style: 'cancel' },
      ]);
      return;
    }
    addFavorite(produit);
  };

  const handleComment = (produit) => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour commenter.', [
        { text: 'Connexion', onPress: () => navigation.navigate('Login') },
        { text: 'Annuler', style: 'cancel' },
      ]);
      return;
    }
    navigation.navigate('Comments', { product: produit });
  };

  // ✅ Déconnexion avec confirmation
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  // Si un produit est sélectionné → affichage du détail
  if (selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onFavorite={handleFavorite}
        isFavorite={isFavorite}
        user={user}
      />
    );
  }

  const itemsToShow = showAll ? displayProducts : displayProducts.slice(0, 6);

  // ✅ Grouper les produits par paires pour la grille 2 colonnes
  const productRows = Array.from(
    { length: Math.ceil(itemsToShow.length / 2) },
    (_, i) => itemsToShow.slice(i * 2, i * 2 + 2)
  );

  return (
    <ScrollView 
      style={styles.container} 
      keyboardShouldPersistTaps="handled" 
      contentContainerStyle={{
    paddingBottom: 80, // 
  }} >

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerLogo}>BioScan</Text>
        {!user ? (
          <View style={styles.headerBtns}>
            <TouchableOpacity
              style={styles.headerLoginBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.headerLoginText}>Se connecter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerRegisterBtn}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.headerRegisterText}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerBtns}>
            <Text style={styles.headerWelcome}>👋 {user.prenom || user.email}</Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── BARRE DE RECHERCHE ── */}
      <View style={styles.searchSection}>
        {/* Sélecteur de mode */}
        <View style={styles.modeRow}>
          {['produit', 'ingredient'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeBtn, searchMode === mode && styles.modeBtnActive]}
              onPress={() => setSearchMode(mode)}
            >
              <Text style={[styles.modeBtnText, searchMode === mode && styles.modeBtnTextActive]}>
                {mode === 'produit' ? 'Produit' : 'Ingrédient'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Champ de recherche */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={
              searchMode === 'produit'
                ? 'Nom du produit...'
                : "Liste d'ingrédients (ex: Sucre, Sel...)"
            }
            placeholderTextColor="#9ca3af"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <MaterialIcons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Bouton scanner */}
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.scanBtnText}>▌▌▌  Scanner un code-barres</Text>
        </TouchableOpacity>
      </View>

      {/* ── RÉSULTATS ── */}
      {isAnalyzing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Analyse IA en cours...</Text>
        </View>
      ) : (
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? '🔍 Résultats' : 'Nos Produits'}
          </Text>

          {displayProducts.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun produit trouvé</Text>
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>Voir tous les produits</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* ✅ Grille 2 colonnes */}
              {productRows.map((pair, rowIndex) => (
                <View key={rowIndex} style={styles.productRow}>
                  {pair.map((produit) => {
                    const pid = produit._id || produit.id;
                    return (
                      <ProductCard
                        key={pid}
                        produit={produit}
                        user={user}
                        isFavorite={isFavorite(pid)}
                        onFavorite={() => handleFavorite(produit)}
                        onComment={() => handleComment(produit)}
                        onPress={() => handleSelectProduct(produit)}
                        baseUrl={BASE_URL}
                      />
                    );
                  })}
                  {/* Remplissage si nombre impair */}
                  {pair.length === 1 && <View style={{ flex: 1 }} />}
                </View>
              ))}

              {displayProducts.length > 6 && !searchQuery.trim() && (
                <TouchableOpacity
                  style={styles.loadMoreBtn}
                  onPress={() => setShowAll((v) => !v)}
                >
                  <Text style={styles.loadMoreText}>
                    {showAll
                      ? 'Voir moins ↑'
                      : `Voir plus (${displayProducts.length - 6} autres) ↓`}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  // ── Header ──
  header: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLogo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLoginBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerLoginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  headerRegisterBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerRegisterText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  headerWelcome: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },

  // ✅ Bouton déconnexion
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Search section ──
  searchSection: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 12,
  },

  // ── Mode buttons ──
  modeRow: { flexDirection: 'row', gap: 10 },
  modeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'transparent',
  },
  modeBtnActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  modeBtnText: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: '#16a34a',
    fontWeight: '700',
  },

  // ── Search row ──
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 2,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  clearBtn: { padding: 4 },
  searchBtn: {
  backgroundColor: '#16a34a',
  borderRadius: 20,
  paddingHorizontal: 12,  
  height: 34,
  justifyContent: 'center',
  alignItems: 'center',
},
  searchBtnText: { fontSize: 16 },

  // ── Scanner button ──
  scanBtn: {
    backgroundColor: '#15803d',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  scanBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  // ── Contenu ──
  loadingBox: { alignItems: 'center', padding: 40, gap: 12 },
  loadingText: { color: '#64748b', fontSize: 15 },

  productsSection: { 
  padding: 16,
  paddingBottom: 100, 
},
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },

  // ✅ Grille 2 colonnes
  productRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  empty: { alignItems: 'center', padding: 40, gap: 12 },
  emptyText: { fontSize: 16, color: '#64748b' },
  resetBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resetBtnText: { color: '#fff', fontWeight: '700' },

  loadMoreBtn: {
    margin: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  loadMoreText: { color: '#475569', fontWeight: '600' },
});
