import api from './api';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;
    const token = data?.access_token || data?.token;

    if (token) {
      localStorage.setItem('token', token);
    }

    let user = data?.user;
    if (!user && token) {
      const decoded = parseJwt(token);
      if (decoded) {
        user = {
          name: decoded.name || decoded.sub || credentials.email?.split('@')[0] || 'User',
          email: decoded.email || decoded.sub || credentials.email,
          role: decoded.role || 'Member',
        };
      }
    }

    if (!user) {
      user = {
        name: credentials.email?.split('@')[0] || 'User',
        email: credentials.email,
        role: 'Member',
      };
    }

    localStorage.setItem('user', JSON.stringify(user));
    return { ...data, user, token };
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const data = response.data;
    const token = data?.access_token || data?.token;

    if (token) {
      localStorage.setItem('token', token);
    }

    const user = data?.user || {
      name: userData.name || userData.email?.split('@')[0] || 'User',
      email: userData.email,
      role: userData.role || 'Member',
    };

    localStorage.setItem('user', JSON.stringify(user));
    return { ...data, user, token };
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
    } catch {
      // Fall back to stored user if offline or /auth/me not ready
    }
    return authService.getUser();
  },

  getUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) return JSON.parse(userStr);
    } catch {
      // ignore
    }
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        return {
          name: decoded.name || decoded.sub || 'User',
          email: decoded.email || decoded.sub,
          role: decoded.role || 'Member',
        };
      }
    }
    return null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return Boolean(localStorage.getItem('token'));
  },

  hasRole: (allowedRoles = []) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    const user = authService.getUser();
    if (!user || !user.role) return false;
    const roleNormalized = user.role.toLowerCase();
    return allowedRoles.some((r) => {
      const target = r.toLowerCase();
      if (target === 'admin' || target === 'president' || target === 'admin/president') {
        return roleNormalized.includes('admin') || roleNormalized.includes('president');
      }
      return roleNormalized === target;
    });
  },
};

export default authService;
