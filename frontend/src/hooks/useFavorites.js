// src/hooks/useFavorites.js
import { useState, useEffect } from 'react';

const useFavorites = (userId, userRole) => {
  const storageKey = userId ? `favorites_${userId}` : null;
  const isConsommateur = userRole === 'consommateur';

  const [favorites, setFavorites] = useState(() => {
    if (!storageKey || !isConsommateur) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    if (!storageKey || !isConsommateur) { setFavorites([]); return; }
    try {
      const saved = localStorage.getItem(storageKey);
      setFavorites(saved ? JSON.parse(saved) : []);
    } catch { setFavorites([]); }
  }, [storageKey, isConsommateur]);

  useEffect(() => {
    if (!storageKey || !isConsommateur) return;
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, storageKey, isConsommateur]);

  // ✅ Utilise _id (champ réel de MongoDB)
  const getProductId = (product) =>
    product?._id || product?.id_produit || product?.id;

  const isFavorite = (productId) =>
    favorites.some((f) => String(getProductId(f)) === String(productId));

  const addFavorite = (product) => {
    if (!userId) {
      alert('Vous devez être connecté pour ajouter un favori.');
      return;
    }
    if (!isConsommateur) {
      alert('Seuls les consommateurs peuvent ajouter des favoris.');
      return;
    }
    const productId = getProductId(product);
    if (!productId) {
      console.error('Produit sans ID :', product);
      return;
    }
    if (isFavorite(productId)) {
      alert(`${product.nom} est déjà dans vos favoris.`);
      return;
    }
    setFavorites((prev) => [...prev, product]);
    alert(`${product.nom} ajouté aux favoris !`);
  };

  const removeFavorite = (productId) => {
    if (!isConsommateur) return;
    setFavorites((prev) =>
      prev.filter((f) => String(getProductId(f)) !== String(productId))
    );
    alert('Produit retiré des favoris.');
  };

  const clearFavorites = () => {
    if (!isConsommateur) return;
    if (window.confirm('Supprimer tous vos favoris ?')) {
      setFavorites([]);
      if (storageKey) localStorage.removeItem(storageKey);
    }
  };

  return { favorites, isFavorite, addFavorite, removeFavorite, clearFavorites };
};

export default useFavorites;
