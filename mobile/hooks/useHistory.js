// mobile/hooks/useHistory.js
import { useState, useEffect } from 'react';
import api from '../services/api';

const MAX_HISTORY = 10;

const useHistory = (userId) => {
  const [searchHistory, setSearchHistory] = useState([]);

  const loadHistory = async () => {
    if (!userId || userId === 'undefined') { setSearchHistory([]); return; }
    try {
      const res = await api.get(`/historique/user/${userId}`);
      setSearchHistory(Array.isArray(res.data) ? res.data.filter(h => h.query) : []);
    } catch { setSearchHistory([]); }
  };

  useEffect(() => { loadHistory(); }, [userId]);

  // ✅ Pour recherche TEXTE — HomeScreen (searchQuery)
  const addToHistory = async (query) => {
    if (!query?.trim() || !userId || userId === 'undefined') return;
    try {
      await api.post('/historique/search', { userId, query: query.trim() });
      await loadHistory();
    } catch {
      const entry = { id: Date.now(), query: query.trim(), date: new Date().toISOString() };
      setSearchHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY));
    }
  };

  // ✅ Pour scan PRODUIT — ScannerScreen (productId MongoDB)
  const addProductToHistory = async (productId) => {
    if (!productId || !userId || userId === 'undefined') return;
    try {
      await api.post('/historique', { userId, productId });
      await loadHistory();
    } catch {}
  };

  const removeFromHistory = async (id) => {
    try {
      await api.delete(`/historique/${id}`);
    } catch {}
    setSearchHistory(prev => prev.filter(h => String(h.id) !== String(id)));
  };

  const clearHistory = async () => {
    try {
      await api.delete(`/historique/user/${userId}/all`);
      setSearchHistory([]);
    } catch {}
  };

  return { searchHistory, addToHistory, addProductToHistory, removeFromHistory, clearHistory };
};

export default useHistory;
