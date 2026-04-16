export class AuthExpiredError extends Error {
  constructor(message = 'Session expirée, reconnectez-vous') {
    super(message);
    this.name = 'AuthExpiredError';
  }
}

const isAuthExpiredPayload = (payload) => {
  const code = payload?.code;
  const msg = String(payload?.message || '').toLowerCase();
  return code === 'TOKEN_EXPIRED' || msg.includes('token expir');
};

/**
 * Fetch helper:
 * - Adds Bearer token automatically (if present)
 * - Throws AuthExpiredError on 401 token-expired responses
 */
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');

  const mergedHeaders = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers: mergedHeaders });

  if (res.ok) return res;

  // Try to parse JSON error payload (if any)
  const payload = await res.json().catch(() => ({}));

  if (res.status === 401 && isAuthExpiredPayload(payload)) {
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new AuthExpiredError(payload?.message || 'Token expiré, reconnectez-vous');
  }

  const msg = payload?.message || `Erreur ${res.status}`;
  throw new Error(msg);
}

