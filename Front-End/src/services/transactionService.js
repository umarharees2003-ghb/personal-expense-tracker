import api from './api.js';

export const listTransactions = async (filters = {}, options = {}) => {
  const params = { ...filters };
  if (options.sortBy) params.sortBy = options.sortBy;
  if (options.sortDirection) params.sortDirection = options.sortDirection;
  return (await api.get('/transactions', { params, signal: options.signal })).data;
};

export const listTransactionsPaged = async (filters = {}, options = {}) => {
  const params = {
    ...filters,
    page: options.page ?? 0,
    size: options.size ?? 10,
    sortBy: options.sortBy ?? 'date',
    sortDirection: options.sortDirection ?? 'desc',
  };
  return (await api.get('/transactions/paged', { params, signal: options.signal })).data;
};

export const createTransaction = async (transaction) => (await api.post('/transactions', transaction)).data;
export const updateTransaction = async (id, transaction) => (await api.put(`/transactions/${id}`, transaction)).data;
export const deleteTransaction = async (id) => api.delete(`/transactions/${id}`);
