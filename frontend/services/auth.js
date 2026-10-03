import api from './api';

/**
 * Normalise a raw user object from the backend.
 * The backend returns `full_name`; the rest of the app expects `name`.
 */
function normalizeUser(raw) {
  if (!raw) return null;
  return {
    ...raw,
    name: raw.name || raw.full_name || raw.email?.split('@')[0] || 'User',
    role: (raw.role || 'student').toLowerCase(),
  };
}

export const authService = {
  /**
   * Login with email+password.
   * On success: store token, then fetch /auth/me to persist the real user
   * (including the actual role stored in the database).
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      // Always fetch the canonical user from /auth/me so role is accurate
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data) {
          const user = normalizeUser(meRes.data);
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch {
        // If /auth/me fails, clear any stale user so the app does not show
        // incorrect role information.
        localStorage.removeItem('user');
      }
    }
    return response.data;
  },

  /**
   * Register a new account.
   * Backend /auth/register returns the UserResponse (not a token).
   * Redirect to login after registration.
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Fetch the current user from the backend and update localStorage.
   * Falls back to cached value if the request fails.
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data) {
        const user = normalizeUser(response.data);
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
    } catch {
      // Network error or token expired — return cached value
    }
    return authService.getUser();
  },

  getUser: () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Ensure older cached values are also normalised
      return normalizeUser(parsed);
    } catch {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
