// mobile/hooks/useHistory.js
import { useState, useEffect } from 'react';
import api from '../services/api';

const MAX_HISTORY = 10;

const useHistory = (userId) => {
  const [searchHistory, setSearchHistory] = useState([]);

  const loadHistory = async () => {
    if (!userId) { setSearchHistory([]); return; }
    try {
      const res = await api.get(`/historique/${userId}`);
      setSearchHistory(Array.isArray(res.data) ? res.data : []);
    } catch { setSearchHistory([]); }
  };

  useEffect(() => {
    loadHistory();
  }, [userId]); // ✅ se re-déclenche quand userId change (login async)

  const addToHistory = async (query) => {
    if (!query?.trim() || !userId) return;
    try {
      await api.post('/historique', { userId, query: query.trim() });
      // ✅ Recharge depuis l'API pour avoir les vrais IDs serveur
      await loadHistory();
    } catch {
      // fallback local seulement si vraiment nécessaire
      const entry = { id: Date.now(), query: query.trim(), date: new Date().toISOString() };
      setSearchHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
    }
  };

  const removeFromHistory = async (id) => {
    try {
      await api.delete(`/historique/${userId}/${id}`);
      // ✅ Filtre sur _id ou id selon ta réponse API
      setSearchHistory((prev) =>
        prev.filter((h) => String(h._id || h.id) !== String(id))
      );
    } catch {}
  };

  const clearHistory = async () => {
    try {
      await api.delete(`/historique/${userId}`);
      setSearchHistory([]);
    } catch {}
  };

  return { searchHistory, addToHistory, removeFromHistory, clearHistory };
};

export default useHistory;
