// mobile/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────
// ⚙️  CONFIGURATION — choisissez UNE seule ligne selon votre cas
// ─────────────────────────────────────────────────────────────

// 1️⃣  Émulateur Android Studio
//     (10.0.2.2 est l'alias vers votre PC depuis l'émulateur)
// export const BASE_URL = 'http://10.0.2.2:5000';

// 2️⃣  Vrai téléphone Android/iOS branché en WiFi
//     → Trouvez votre IP : Windows = ipconfig | Mac/Linux = ifconfig
//     → Remplacez 192.168.X.X par votre vraie IP locale
export const BASE_URL = 'http://192.168.43.105:5000'; // ← CHANGEZ CETTE IP

// 3️⃣  Expo Go sur téléphone (même WiFi que le PC)
//     Même chose que le cas 2 — utilisez votre IP locale

// 4️⃣  Production (déployé sur serveur)
// export const BASE_URL = 'https://votre-domaine.com';

// ─────────────────────────────────────────────────────────────

const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Ajoute le JWT automatiquement sur chaque requête
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// ✅ Gère les erreurs 401 (token expiré → déconnexion automatique)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

export default api;
