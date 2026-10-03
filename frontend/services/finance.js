import api from './api';

export const financeService = {
  getFinanceSummary: async () => {
    const response = await api.get('/finance/summary');
    return response.data;
  },

  getTransactions: async (params = {}) => {
    const response = await api.get('/finance/transactions', { params });
    return response.data;
  },

  createExpense: async (data) => {
    const response = await api.post('/finance/expenses', data);
    return response.data;
  },

  getReimbursements: async () => {
    const response = await api.get('/finance/reimbursements');
    return response.data;
  },

  createReimbursement: async (data) => {
    const response = await api.post('/finance/reimbursements', data);
    return response.data;
  },

  updateReimbursementStatus: async (id, status) => {
    const response = await api.patch(`/finance/reimbursements/${id}/status`, { status });
    return response.data;
  },
};

export default financeService;
