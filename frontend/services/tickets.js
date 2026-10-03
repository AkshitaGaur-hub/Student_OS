import api from './api';

export const ticketsService = {
  getMyTickets: async () => {
    const response = await api.get('/tickets/my');
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

  checkInTicket: async (ticketIdOrCode) => {
    const response = await api.post(`/tickets/${ticketIdOrCode}/check-in`);
    return response.data;
  },

  verifyTicketByCode: async (ticketCode) => {
    const response = await api.post('/tickets/verify', { ticket_code: ticketCode });
    return response.data;
  },
};

export default ticketsService;
