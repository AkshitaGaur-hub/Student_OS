import api from './api';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (err) {
      // If backend auth endpoint is mock / demo mode
      if (credentials.email) {
        const dummyUser = {
          name: credentials.email.split('@')[0],
          email: credentials.email,
          role: credentials.email.includes('admin') ? 'ADMIN' : 'MEMBER',
        };
        localStorage.setItem('token', 'mock_jwt_token');
        localStorage.setItem('user', JSON.stringify(dummyUser));
        return { access_token: 'mock_jwt_token', user: dummyUser };
      }
      throw err;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (err) {
      // Fallback for hackathon testing if backend auth endpoint isn't wired
      const demoUser = {
        name: userData.name || userData.email.split('@')[0],
        email: userData.email,
        role: userData.role || 'MEMBER',
      };
      localStorage.setItem('token', 'mock_jwt_token');
      localStorage.setItem('user', JSON.stringify(demoUser));
      return { access_token: 'mock_jwt_token', user: demoUser };
    }
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
      // return local storage user
    }
    return authService.getUser();
  },

  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
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
