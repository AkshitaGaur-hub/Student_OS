import api from './api';

export const ticketsService = {
  getMyTickets: async () => {
    const response = await api.get('/tickets/my');
    return response.data;
  },

  getAllTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  getTicketById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  purchaseTicket: async (data) => {
    const response = await api.post('/tickets', data);
    return response.data;
  },

  checkInTicket: async (ticketId, data = {}) => {
    const response = await api.post(`/tickets/${ticketId}/check-in`, data);
    return response.data;
  },
};

export default ticketsService;
