// src/hooks/useFavorites.js
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

const useFavorites = (userId, userRole) => {
  const isConsommateur = userRole === 'consommateur';
  const [favorites, setFavorites] = useState([]);

  // ✅ Charge les favoris depuis l'API (partagés web + mobile)
  const loadFavorites = async () => {
    if (!userId || !isConsommateur) { setFavorites([]); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/favoris/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch { setFavorites([]); }
  };

  useEffect(() => { loadFavorites(); }, [userId, isConsommateur]);

  const getProductId = (product) =>
    product?._id || product?.id_produit || product?.id;

  const isFavorite = (productId) =>
    favorites.some((f) => String(getProductId(f)) === String(productId));

  const addFavorite = async (product) => {
    if (!userId) { alert('Vous devez être connecté pour ajouter un favori.'); return; }
    if (!isConsommateur) { alert('Seuls les consommateurs peuvent ajouter des favoris.'); return; }
    const productId = getProductId(product);
    if (!productId) return;
    if (isFavorite(productId)) { alert(`${product.nom} est déjà dans vos favoris.`); return; }
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/favoris`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, productId }),
      });
      await loadFavorites(); // ✅ recharge depuis API pour avoir la vraie structure
      alert(`${product.nom} ajouté aux favoris !`);
    } catch { alert('Erreur lors de l\'ajout du favori.'); }
  };

  const removeFavorite = async (productId) => {
    if (!isConsommateur) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/favoris/user/${userId}/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites((prev) =>
        prev.filter((f) => String(getProductId(f)) !== String(productId))
      );
    } catch { alert('Erreur lors de la suppression.'); }
  };

  const clearFavorites = async () => {
    if (!isConsommateur) return;
    if (!window.confirm('Supprimer tous vos favoris ?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/favoris/user/${userId}/all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites([]);
    } catch {}
  };

  return { favorites, isFavorite, addFavorite, removeFavorite, clearFavorites };
};

export default useFavorites;
