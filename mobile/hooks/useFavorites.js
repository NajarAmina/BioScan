// mobile/hooks/useFavorites.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';

const useFavorites = (userId, userRole) => {
  const isConsommateur = userRole === 'consommateur';
  const [favorites, setFavorites] = useState([]);

  const loadFavorites = async () => {
    if (!userId || !isConsommateur) { setFavorites([]); return; }
    try {
      const res = await api.get(`/favoris/${userId}`);
      setFavorites(Array.isArray(res.data) ? res.data : []);
    } catch { setFavorites([]); }
  };

  useEffect(() => {
    loadFavorites();
  }, [userId, isConsommateur]);

  // ✅ Normalise l'ID peu importe la structure de l'objet
  const getProductId = (p) => p?._id || p?.id_produit || p?.id || p?.productId;

  const isFavorite = (productId) =>
    favorites.some((f) => String(getProductId(f)) === String(productId));

  const addFavorite = async (product) => {
    if (!userId) {
      Alert.alert('Connexion requise', 'Vous devez être connecté.');
      return;
    }
    if (!isConsommateur) {
      Alert.alert('Accès refusé', 'Seuls les consommateurs peuvent ajouter des favoris.');
      return;
    }
    const productId = getProductId(product);
    if (!productId) return;
    if (isFavorite(productId)) {
      Alert.alert('Déjà ajouté', `${product.nom} est déjà dans vos favoris.`);
      return;
    }
    try {
      await api.post('/favoris', { userId, productId });
      // ✅ Recharge depuis l'API → structure cohérente garantie
      await loadFavorites();
      Alert.alert('Favori ajouté ✅', `${product.nom} ajouté aux favoris !`);
    } catch {
      Alert.alert('Erreur', "Impossible d'ajouter le favori.");
    }
  };

  const removeFavorite = async (productId) => {
    if (!isConsommateur) return;
    try {
      await api.delete(`/favoris/${userId}/${productId}`);
      setFavorites((prev) =>
        prev.filter((f) => String(getProductId(f)) !== String(productId))
      );
    } catch {
      Alert.alert('Erreur', 'Impossible de supprimer le favori.');
    }
  };

  const clearFavorites = () => {
    Alert.alert('Confirmation', 'Supprimer tous vos favoris ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/favoris/${userId}`);
            setFavorites([]);
          } catch {}
        },
      },
    ]);
  };

  return { favorites, isFavorite, addFavorite, removeFavorite, clearFavorites };
};

export default useFavorites;