import api from './api';

export const financeService = {
  getFinanceSummary: async () => {
    const response = await api.get('/finance/summary');
    return response.data;
  },

  getIncome: async (params = {}) => {
    const response = await api.get('/finance/income', { params });
    return response.data;
  },

  createIncome: async (data) => {
    const response = await api.post('/finance/income', data);
    return response.data;
  },

  getExpenses: async (params = {}) => {
    const response = await api.get('/finance/expenses', { params });
    return response.data;
  },

  createExpense: async (data) => {
    const response = await api.post('/finance/expenses', data);
    return response.data;
  },

  getReimbursements: async (params = {}) => {
    const response = await api.get('/finance/reimbursements', { params });
    return response.data;
  },

  createReimbursement: async (data) => {
    const response = await api.post('/finance/reimbursements', data);
    return response.data;
  },

  updateReimbursementStatus: async (id, status) => {
    const response = await api.put(`/finance/reimbursements/${id}`, { status });
    return response.data;
  },
};

export default financeService;
