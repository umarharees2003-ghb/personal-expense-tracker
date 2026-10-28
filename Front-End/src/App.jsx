import React, { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Tag } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { thisMonth } from './components/common.jsx';
import { RequestStatus } from './components/RequestStatus.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { TransactionsPage } from './components/TransactionsPage.jsx';
import { CategoriesPage } from './components/CategoriesPage.jsx';
import { ReportsPage } from './components/ReportsPage.jsx';
import { ProfilePage } from './components/ProfilePage.jsx';
import { SettingsPage } from './components/SettingsPage.jsx';
import { AuthScreen } from './components/AuthScreen.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import { TransactionModal } from './components/TransactionModal.jsx';
import { CategoryModal } from './components/CategoryModal.jsx';
import { useFinanceData } from './hooks/useFinanceData.js';
import { getApiError } from './services/api.js';
import { createCategory, deleteCategory, updateCategory } from './services/categoryService.js';
import { createTransaction, deleteTransaction, updateTransaction } from './services/transactionService.js';
import { currentMonthParams, toDateInputValue } from './utils/formatDate.js';
import { convertCurrency } from './utils/formatCurrency.js';
import { mapTransactionRequest, categoryAppearance } from './utils/mappers.js';
import { validateCategoryName, validateProfile, validateTransaction } from './utils/validation.js';

function AppContent() {
  const {
    user, loading: authLoading, authBusy, authError, login, register, logout,
    updateProfile, clearAuthError,
  } = useAuth();
  const finance = useFinanceData();
  const {
    clearData, loadCategories, loadAllTransactions, loadDashboard,
  } = finance;
  const [page, setPage] = useState('Overview');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [returnToTransaction, setReturnToTransaction] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All transactions');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [currency, setCurrency] = useState(() => window.localStorage.getItem('finora.currency') || 'LKR');
  const [mobileNav, setMobileNav] = useState(false);
  const [period, setPeriod] = useState('This month');
  const [rangeStart, setRangeStart] = useState(toDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [rangeEnd, setRangeEnd] = useState(toDateInputValue());
  const [reportPeriod, setReportPeriod] = useState('This month');
  const [reportStart, setReportStart] = useState(toDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [reportEnd, setReportEnd] = useState(toDateInputValue());
  const [dark, setDark] = useState(() => window.localStorage.getItem('finora.darkMode') === 'true');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    window.localStorage.setItem('finora.darkMode', String(dark));
  }, [dark]);

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  };

  useEffect(() => {
    if (!user) {
      clearData();
      return;
    }
    loadCategories().catch(() => {});
    loadAllTransactions().catch(() => {});
    loadDashboard().catch(() => {});
  }, [user?.id, clearData, loadCategories, loadAllTransactions, loadDashboard]);

  const transactionFilters = useMemo(() => {
    const params = {};
    if (period === 'This month') Object.assign(params, currentMonthParams());
    if (period === 'Custom range' && rangeStart && rangeEnd) {
      params.startDate = rangeStart;
      params.endDate = rangeEnd;
    }
    if (filter !== 'All transactions') params.type = filter === 'Income' ? 'INCOME' : 'EXPENSE';
    if (categoryFilter) params.categoryId = categoryFilter;
    if (search.trim()) params.search = search.trim();
    if (sort) {
      const [field, direction] = sort.split('_');
      params.sortBy = field;
      params.sortDirection = direction;
    }
    return params;
  }, [period, rangeStart, rangeEnd, filter, categoryFilter, search, sort]);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const timer = window.setTimeout(() => {
      finance.loadTransactions(transactionFilters).then(() => {
        if (!active) return;
      }).catch(() => {});
    }, search ? 250 : 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [user?.id, transactionFilters]);

  useEffect(() => {
    if (!user || page !== 'Reports') return;
    const mode = reportPeriod === 'This month' ? 'month' : 'range';
    finance.loadReport({ mode, startDate: reportStart, endDate: reportEnd }).catch(() => {});
  }, [user?.id, page, reportPeriod, reportStart, reportEnd]);

  const categoryStats = finance.categories.map((category) => {
    const appearance = categoryAppearance(category.name);
    const linked = finance.allTransactions.filter((item) => item.categoryId === category.id);
    const spent = linked
      .filter((item) => item.type === 'expense' && thisMonth(item.date))
      .reduce((total, item) => total + Number(item.amount), 0);
    return { ...category, ...appearance, count: linked.length, spent, budget: null };
  });

  const dashboardCategories = (finance.dashboard?.categoryExpenses ?? []).map((expense) => {
    return {
      ...categoryAppearance(expense.category),
      name: expense.category,
      spent: Number(expense.amount),
      budget: null,
      count: 0,
    };
  });

  async function refreshDashboard() {
    await finance.loadDashboard().catch(() => {});
  }

  async function refreshTransactions() {
    await Promise.all([
      finance.loadTransactions(transactionFilters).catch(() => {}),
      finance.loadAllTransactions().catch(() => {}),
      refreshDashboard(),
    ]);
  }

  async function saveTransaction(event) {
    event.preventDefault();
    setActionError('');
    const form = new FormData(event.currentTarget);
    const enteredAmount = form.get('amount');
    const values = {
      amount: enteredAmount,
      description: form.get('description'),
      date: form.get('date'),
      type: form.get('type'),
      categoryId: form.get('categoryId'),
    };
    const errors = validateTransaction(values);
    if (Object.keys(errors).length) {
      setActionError(Object.values(errors)[0]);
      return;
    }
    setActionLoading(true);
    try {
      const amountInBase = convertCurrency(enteredAmount, currency, 'LKR');
      const payload = mapTransactionRequest({
        ...values,
        amount: Number(amountInBase.toFixed(2)),
      });
      if (editing) await updateTransaction(editing.id, payload);
      else await createTransaction(payload);
      setModal(null);
      setEditing(null);
      await refreshTransactions();
      flash(editing ? 'Transaction updated successfully' : 'Transaction added successfully');
    } catch (error) {
      setActionError(getApiError(error, 'Unable to save this transaction.'));
    } finally {
      setActionLoading(false);
    }
  }

  async function removeTransaction(id) {
    if (!window.confirm('Delete this transaction? This action cannot be undone.')) return;
    setActionError('');
    setActionLoading(true);
    try {
      await deleteTransaction(id);
      await refreshTransactions();
      flash('Transaction deleted');
    } catch (error) {
      setActionError(getApiError(error, 'Unable to delete this transaction.'));
    } finally {
      setActionLoading(false);
    }
  }

  async function saveCategory(event) {
    event.preventDefault();
    setActionError('');
    const name = new FormData(event.currentTarget).get('name').trim();
    const validationError = validateCategoryName(name);
    if (validationError) {
      setActionError(validationError);
      return;
    }
    if (finance.categories.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== editingCategory?.id)) {
      setActionError('A category with this name already exists.');
      return;
    }
    setActionLoading(true);
    try {
      if (editingCategory) await updateCategory(editingCategory.id, { name });
      else await createCategory({ name });
      setModal(returnToTransaction ? 'transaction' : null);
      setEditingCategory(null);
      setReturnToTransaction(false);
      await finance.loadCategories();
      await finance.loadAllTransactions().catch(() => {});
      await finance.loadTransactions(transactionFilters).catch(() => {});
      flash(editingCategory ? 'Category updated' : 'Category created');
    } catch (error) {
      setActionError(getApiError(error, 'Unable to save this category.'));
    } finally {
      setActionLoading(false);
    }
  }

  async function removeCategory(category) {
    if (!window.confirm(`Delete the “${category.name}” category?`)) return;
    setActionError('');
    setActionLoading(true);
    try {
      await deleteCategory(category.id);
      await finance.loadCategories();
      await finance.loadAllTransactions().catch(() => {});
      await finance.loadTransactions(transactionFilters).catch(() => {});
      flash('Category deleted');
    } catch (error) {
      const message = getApiError(error, 'Unable to delete this category.');
      setActionError(message);
      flash(message);
    } finally {
      setActionLoading(false);
    }
  }

  async function saveProfile(event, values) {
    event.preventDefault();
    const errors = validateProfile(values);
    if (Object.keys(errors).length) {
      setActionError(Object.values(errors)[0]);
      return;
    }
    setActionError('');
    setActionLoading(true);
    try {
      await updateProfile({ name: values.name.trim(), email: values.email.trim() });
      flash('Your profile has been updated');
    } catch (error) {
      setActionError(getApiError(error, 'Unable to update your profile.'));
    } finally {
      setActionLoading(false);
    }
  }

  if (authLoading) return <div className="auth-loading"><RequestStatus loading /></div>;
  if (!user) return <AuthScreen onLogin={login} onRegister={register} loading={authBusy} error={authError} onClearError={clearAuthError} dark={dark} setDark={setDark} />;

  const transactionProps = {
    transactions: finance.transactions,
    onAdd: () => { setEditing(null); setActionError(''); setModal('transaction'); },
    onEdit: (item) => { setEditing(item); setActionError(''); setModal('transaction'); },
    onDelete: removeTransaction,
    loading: finance.loading.transactions,
    error: finance.errors.transactions,
    actionsDisabled: actionLoading,
    onRetry: () => finance.loadTransactions(transactionFilters).catch(() => {}),
  };

  return <div className={`app-shell${dark ? ' dark-mode' : ''}`}>
    <Sidebar {...{ page, setPage, mobileNav, setMobileNav, transactions: finance.allTransactions, profile: user, setLoggedIn: logout }} />
    {mobileNav && <button className="nav-backdrop" aria-label="Close menu" onClick={() => setMobileNav(false)} />}
    <main className="main-panel">
      <Topbar {...{ page, setPage, search, setSearch, setMobileNav, profile: user }} />
      <div className="page-content" key={currency}>
        {page === 'Overview' && <Dashboard
          profile={user}
          income={Number(finance.dashboard?.summary.totalIncome ?? 0)}
          expense={Number(finance.dashboard?.summary.totalExpense ?? 0)}
          balance={Number(finance.dashboard?.summary.balance ?? 0)}
          monthlyIncome={Number(finance.dashboard?.monthlySummary.income ?? 0)}
          monthlyExpense={Number(finance.dashboard?.monthlySummary.expenses ?? 0)}
          monthlyBalance={Number(finance.dashboard?.monthlySummary.balance ?? 0)}
          categories={dashboardCategories}
          {...transactionProps}
          transactions={finance.dashboard?.recent ?? []}
          onNavigate={setPage}
          loading={finance.loading.dashboard}
          error={finance.errors.dashboard}
          onRetry={refreshDashboard}
        />}
        {page === 'Transactions' && <TransactionsPage
          {...transactionProps}
          filter={filter}
          setFilter={setFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={finance.categories}
          period={period}
          setPeriod={setPeriod}
          rangeStart={rangeStart}
          setRangeStart={setRangeStart}
          rangeEnd={rangeEnd}
          setRangeEnd={setRangeEnd}
          search={search}
          setSearch={setSearch}
          sort={sort}
          setSort={setSort}
        />}
        {page === 'Categories' && <CategoriesPage
          categories={categoryStats}
          onAdd={() => { setEditingCategory(null); setActionError(''); setModal('category'); }}
          onEdit={(category) => { setEditingCategory(category); setActionError(''); setModal('category'); }}
          onDelete={removeCategory}
          loading={finance.loading.categories}
          error={finance.errors.categories || finance.errors.allTransactions}
          onRetry={() => Promise.all([
            finance.loadCategories().catch(() => {}),
            finance.loadAllTransactions().catch(() => {}),
          ])}
          actionsDisabled={actionLoading}
        />}
        {page === 'Reports' && <ReportsPage
          report={finance.report}
          period={reportPeriod}
          setPeriod={setReportPeriod}
          startDate={reportStart}
          setStartDate={setReportStart}
          endDate={reportEnd}
          setEndDate={setReportEnd}
          loading={finance.loading.reports}
          error={finance.errors.reports}
          onRetry={() => finance.loadReport({ mode: reportPeriod === 'This month' ? 'month' : 'range', startDate: reportStart, endDate: reportEnd }).catch(() => {})}
        />}
        {page === 'Profile' && <ProfilePage profile={user} onSave={saveProfile} onLogout={logout} loading={actionLoading} error={actionError} />}
        {page === 'Settings' && <SettingsPage dark={dark} setDark={setDark} flash={flash} currency={currency} setCurrency={setCurrency} />}
        {actionError && page !== 'Profile' && <div className="action-error" role="alert">{actionError}</div>}
      </div>
      <footer className="page-footer"><span>Made for a healthier relationship with money <span className="footer-heart">♥</span></span><span>© {new Date().getFullYear()} Finora</span></footer>
    </main>
    {modal === 'transaction' && <TransactionModal
      transaction={editing}
      categories={finance.categories}
      currency={currency}
      onCreateCategory={() => {
        setReturnToTransaction(true);
        setEditingCategory(null);
        setActionError('');
        setModal('category');
      }}
      onClose={() => { setModal(null); setEditing(null); setActionError(''); }}
      onSave={saveTransaction}
      loading={actionLoading}
      error={actionError}
    />}
    {modal === 'category' && <CategoryModal
      category={editingCategory}
      onClose={() => {
        setModal(returnToTransaction ? 'transaction' : null);
        setReturnToTransaction(false);
        setEditingCategory(null);
        setActionError('');
      }}
      onSave={saveCategory}
      loading={actionLoading}
      error={actionError}
    />}
    {notice && <div className="toast"><span><Check size={15} /></span>{notice}</div>}
    {page === 'Transactions' && <button className="mobile-fab" aria-label="Add transaction" onClick={() => { setEditing(null); setActionError(''); setModal('transaction'); }}><Plus size={21} /></button>}
  </div>;
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}
