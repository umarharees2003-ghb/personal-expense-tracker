import { useCallback, useState } from 'react';
import { listCategories } from '../services/categoryService.js';
import { getCategoryExpenses, getDashboardSummary, getMonthlySummary, getRecentTransactions } from '../services/dashboardService.js';
import { getCategoryReport, getDateRangeReport, getMonthlyReport } from '../services/reportService.js';
import { listTransactions } from '../services/transactionService.js';
import { getApiError } from '../services/api.js';
import { currentMonthParams } from '../utils/formatDate.js';
import { categoryAppearance, mapTransaction } from '../utils/mappers.js';

export function useFinanceData() {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState({ transactions: false, allTransactions: false, categories: false, dashboard: false, reports: false });
  const [errors, setErrors] = useState({});

  const clearData = useCallback(() => {
    setTransactions([]);
    setAllTransactions([]);
    setCategories([]);
    setDashboard(null);
    setReport(null);
    setErrors({});
  }, []);

  const loadTransactions = useCallback(async (filters, options = {}) => {
    setLoading((current) => ({ ...current, transactions: true }));
    setErrors((current) => ({ ...current, transactions: '' }));
    try {
      const result = await listTransactions(filters, options);
      setTransactions(result.map(mapTransaction));
      return result;
    } catch (error) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') return [];
      setErrors((current) => ({ ...current, transactions: getApiError(error, 'Unable to load transactions.') }));
      throw error;
    } finally {
      setLoading((current) => ({ ...current, transactions: false }));
    }
  }, []);

  const loadAllTransactions = useCallback(async () => {
    setLoading((current) => ({ ...current, allTransactions: true }));
    setErrors((current) => ({ ...current, allTransactions: '' }));
    try {
      const result = await listTransactions();
      setAllTransactions(result.map(mapTransaction));
    } catch (error) {
      setErrors((current) => ({ ...current, allTransactions: getApiError(error, 'Unable to load transaction data.') }));
      throw error;
    } finally {
      setLoading((current) => ({ ...current, allTransactions: false }));
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setLoading((current) => ({ ...current, categories: true }));
    setErrors((current) => ({ ...current, categories: '' }));
    try {
      const result = await listCategories();
      setCategories(result);
      return result;
    } catch (error) {
      setErrors((current) => ({ ...current, categories: getApiError(error, 'Unable to load categories.') }));
      throw error;
    } finally {
      setLoading((current) => ({ ...current, categories: false }));
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading((current) => ({ ...current, dashboard: true }));
    setErrors((current) => ({ ...current, dashboard: '' }));
    try {
      const { month, year } = currentMonthParams();
      const [summary, recent, categoryExpenses, monthlySummary] = await Promise.all([
        getDashboardSummary(),
        getRecentTransactions(),
        getCategoryExpenses(),
        getMonthlySummary(month, year),
      ]);
      setDashboard({
        summary,
        recent: recent.map(mapTransaction),
        categoryExpenses,
        monthlySummary,
      });
    } catch (error) {
      setErrors((current) => ({ ...current, dashboard: getApiError(error, 'Unable to load dashboard data.') }));
      throw error;
    } finally {
      setLoading((current) => ({ ...current, dashboard: false }));
    }
  }, []);

  const loadReport = useCallback(async ({ mode, startDate, endDate }) => {
    setLoading((current) => ({ ...current, reports: true }));
    setErrors((current) => ({ ...current, reports: '' }));
    try {
      const [summary, categoryRows] = mode === 'month'
        ? await Promise.all([
          getMonthlyReport(...Object.values(currentMonthParams())),
          getCategoryReport(startDate, endDate),
        ])
        : await Promise.all([
          getDateRangeReport(startDate, endDate),
          getCategoryReport(startDate, endDate),
        ]);
      setReport({
        summary,
        categories: categoryRows.map((item) => ({ ...item, ...categoryAppearance(item.category) })),
      });
    } catch (error) {
      setErrors((current) => ({ ...current, reports: getApiError(error, 'Unable to load report data.') }));
      throw error;
    } finally {
      setLoading((current) => ({ ...current, reports: false }));
    }
  }, []);

  return {
    transactions, allTransactions, categories, dashboard, report, loading, errors, clearData,
    loadTransactions, loadAllTransactions, loadCategories, loadDashboard, loadReport,
  };
}
