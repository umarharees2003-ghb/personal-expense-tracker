import api from './api.js';

export const listTransactions = async (filters = {}) => (await api.get('/transactions', { params: filters })).data;
export const createTransaction = async (transaction) => (await api.post('/transactions', transaction)).data;
export const updateTransaction = async (id, transaction) => (await api.put(`/transactions/${id}`, transaction)).data;
export const deleteTransaction = async (id) => api.delete(`/transactions/${id}`);
