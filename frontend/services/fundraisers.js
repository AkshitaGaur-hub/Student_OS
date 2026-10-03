import api from './api';

export const fundraisersService = {
  getFundraisers: async (params = {}) => {
    const response = await api.get('/fundraisers', { params });
    return response.data;
  },

  getFundraiserById: async (id) => {
    const response = await api.get(`/fundraisers/${id}`);
    return response.data;
  },

  createFundraiser: async (data) => {
    const response = await api.post('/fundraisers', data);
    return response.data;
  },

  updateFundraiserTask: async (fundraiserId, taskId, taskData) => {
    const response = await api.patch(`/fundraisers/${fundraiserId}/tasks/${taskId}`, taskData);
    return response.data;
  },
};

export default fundraisersService;
