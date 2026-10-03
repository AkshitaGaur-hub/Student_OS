import api from './api';

export const membersService = {
  getMembers: async (params = {}) => {
    const response = await api.get('/members', { params });
    return response.data;
  },

  getMemberById: async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },

  createMember: async (data) => {
    const response = await api.post('/members', data);
    return response.data;
  },

  updateMember: async (id, data) => {
    const response = await api.put(`/members/${id}`, data);
    return response.data;
  },

  deleteMember: async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  },
};

export default membersService;
