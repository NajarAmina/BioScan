// src/hooks/useHistory.js
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';
const MAX_HISTORY = 10;

const useHistory = (userId) => {
  const [searchHistory, setSearchHistory] = useState([]);

  const loadHistory = async () => {
    // ✅ Vérifie que userId est valide
    if (!userId || userId === 'undefined' || userId === 'null') {
      setSearchHistory([]);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/historique/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      setSearchHistory(Array.isArray(data) ? data.filter(h => h.query) : []);
    } catch (e) {
      console.error('❌ loadHistory error:', e);
      setSearchHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  // ✅ Ajoute une recherche textuelle (web)
  const addToHistory = async (query) => {
    if (!query?.trim() || !userId || userId === 'undefined') return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/historique/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, query: query.trim() }),
      });
      if (res.ok) {
        await loadHistory();
      } else {
        const entry = { id: Date.now(), query: query.trim(), date: new Date().toISOString() };
        setSearchHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY));
      }
    } catch {
      const entry = { id: Date.now(), query: query.trim(), date: new Date().toISOString() };
      setSearchHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY));
    }
  };

  const removeFromHistory = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/historique/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setSearchHistory(prev => prev.filter(h => String(h.id) !== String(id)));
  };

  const clearHistory = async () => {
    if (!window.confirm('Supprimer tout votre historique ?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/historique/user/${userId}/all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchHistory([]);
    } catch {}
  };

  return { searchHistory, addToHistory, removeFromHistory, clearHistory };
};

export default useHistory;
