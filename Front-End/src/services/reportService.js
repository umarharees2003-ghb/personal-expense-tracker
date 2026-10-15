import api from './api.js';

export async function getMonthlyReport(month, year) {
  return (await api.get('/reports/monthly', { params: { month, year } })).data;
}

export async function getCategoryReport(startDate, endDate) {
  return (await api.get('/reports/category', { params: { startDate, endDate } })).data;
}

export async function getDateRangeReport(startDate, endDate) {
  return (await api.get('/reports/date-range', { params: { startDate, endDate } })).data;
}
