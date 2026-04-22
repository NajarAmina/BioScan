// mobile/hooks/useFavorites.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const useFavorites = (userId, userRole) => {
  const storageKey = userId ? `favorites_${userId}` : null;
  const isConsommateur = userRole === 'consommateur';
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!storageKey || !isConsommateur) { setFavorites([]); return; }
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        setFavorites(saved ? JSON.parse(saved) : []);
      } catch { setFavorites([]); }
    };
    load();
  }, [storageKey, isConsommateur]);

  const persist = async (data) => {
    if (!storageKey) return;
    try { await AsyncStorage.setItem(storageKey, JSON.stringify(data)); } catch {}
  };

  const getProductId = (p) => p?._id || p?.id_produit || p?.id;

  const isFavorite = (productId) =>
    favorites.some((f) => String(getProductId(f)) === String(productId));

  const addFavorite = (product) => {
    if (!userId) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour ajouter un favori.');
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
    setFavorites((prev) => {
      const next = [...prev, product];
      persist(next);
      return next;
    });
    Alert.alert('Favori ajouté', `${product.nom} ajouté aux favoris !`);
  };

  const removeFavorite = (productId) => {
    if (!isConsommateur) return;
    setFavorites((prev) => {
      const next = prev.filter((f) => String(getProductId(f)) !== String(productId));
      persist(next);
      return next;
    });
  };

  const clearFavorites = () => {
    Alert.alert('Confirmation', 'Supprimer tous vos favoris ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setFavorites([]);
          if (storageKey) await AsyncStorage.removeItem(storageKey);
        },
      },
    ]);
  };

  return { favorites, isFavorite, addFavorite, removeFavorite, clearFavorites };
};

export default useFavorites;
