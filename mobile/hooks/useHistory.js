// mobile/hooks/useHistory.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_HISTORY = 10;

const useHistory = (userId) => {
  const storageKey = userId ? `history_${userId}` : null;
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!storageKey) { setSearchHistory([]); return; }
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        setSearchHistory(saved ? JSON.parse(saved) : []);
      } catch { setSearchHistory([]); }
    };
    load();
  }, [storageKey]);

  const persist = async (data) => {
    if (!storageKey) return;
    try { await AsyncStorage.setItem(storageKey, JSON.stringify(data)); } catch {}
  };

  const addToHistory = async (query) => {
    if (!query?.trim()) return;
    const entry = { id: Date.now(), query: query.trim(), date: new Date().toISOString() };
    setSearchHistory((prev) => {
      const next = [entry, ...prev].slice(0, MAX_HISTORY);
      persist(next);
      return next;
    });
  };

  const removeFromHistory = (id) => {
    setSearchHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      persist(next);
      return next;
    });
  };

  const clearHistory = async () => {
    setSearchHistory([]);
    if (storageKey) await AsyncStorage.removeItem(storageKey);
  };

  return { searchHistory, addToHistory, removeFromHistory, clearHistory };
};

export default useHistory;
