import api from './api';

export const analyticsService = {
  getDashboardMetrics: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  getEventAnalytics: async (eventId) => {
    const response = await api.get(`/analytics/events/${eventId}`);
    return response.data;
  },

  getRevenueAnalytics: async (period = 'month') => {
    const response = await api.get('/analytics/revenue', { params: { period } });
    return response.data;
  },
};

export default analyticsService;
