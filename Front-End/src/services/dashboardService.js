import api from './api.js';

export async function getDashboardSummary() {
  return (await api.get('/dashboard/summary')).data;
}

export async function getRecentTransactions() {
  return (await api.get('/dashboard/recent-transactions')).data;
}

export async function getCategoryExpenses() {
  return (await api.get('/dashboard/category-expenses')).data;
}

export async function getMonthlySummary(month, year) {
  return (await api.get('/dashboard/monthly-summary', { params: { month, year } })).data;
}
