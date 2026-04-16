// src/hooks/useHistory.js
import { useState, useEffect } from 'react';

const MAX_HISTORY = 10;

const useHistory = (userId) => {
  const storageKey = userId ? `history_${userId}` : null;

  const [searchHistory, setSearchHistory] = useState(() => {
    if (!storageKey) return [];
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // Recharge si l'utilisateur change
  useEffect(() => {
    if (!storageKey) { setSearchHistory([]); return; }
    const saved = localStorage.getItem(storageKey);
    setSearchHistory(saved ? JSON.parse(saved) : []);
  }, [storageKey]);

  // Persiste automatiquement
  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(searchHistory));
  }, [searchHistory, storageKey]);

  const addToHistory = (query) => {
    if (!query.trim()) return;
    const entry = { id: Date.now(), query: query.trim(), date: new Date().toISOString() };
    setSearchHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
  };

  const removeFromHistory = (id) => {
    setSearchHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const clearHistory = () => {
    if (window.confirm('Supprimer tout votre historique ?')) {
      setSearchHistory([]);
      if (storageKey) localStorage.removeItem(storageKey);
    }
  };

  return { searchHistory, addToHistory, removeFromHistory, clearHistory };
};

export default useHistory;
