import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionsPage } from '../components/TransactionsPage.jsx';

describe('TransactionsPage Component', () => {
  const mockTransactions = [
    { id: 1, name: 'Grocery store', description: 'Weekly groceries', amount: 55.00, date: '2026-10-10', type: 'expense', category: 'Food', color: 'orange' },
    { id: 2, name: 'Client payment', description: 'Consulting invoice', amount: 1200.00, date: '2026-10-12', type: 'income', category: 'Salary', color: 'green' },
  ];

  const defaultProps = {
    transactions: mockTransactions,
    onAdd: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    filter: 'All transactions',
    setFilter: vi.fn(),
    categoryFilter: '',
    setCategoryFilter: vi.fn(),
    categories: [{ id: 1, name: 'Food' }, { id: 2, name: 'Salary' }],
    period: 'This month',
    setPeriod: vi.fn(),
    rangeStart: '2026-10-01',
    setRangeStart: vi.fn(),
    rangeEnd: '2026-10-31',
    setRangeEnd: vi.fn(),
    search: '',
    setSearch: vi.fn(),
    sort: 'date_desc',
    setSort: vi.fn(),
    loading: false,
    error: '',
    onRetry: vi.fn(),
    actionsDisabled: false,
  };

  it('renders page title and summary statistics correctly', () => {
    render(<TransactionsPage {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Transactions' })).toBeInTheDocument();
    expect(screen.getByText('Showing transactions')).toBeInTheDocument();
    expect(screen.getByText('Total income')).toBeInTheDocument();
    expect(screen.getByText('Total expenses')).toBeInTheDocument();
  });

  it('renders filter tabs and triggers setFilter on click', () => {
    render(<TransactionsPage {...defaultProps} />);

    const incomeBtn = screen.getByRole('button', { name: 'Income' });
    fireEvent.click(incomeBtn);
    expect(defaultProps.setFilter).toHaveBeenCalledWith('Income');
  });

  it('renders sort selector and handles changes', () => {
    render(<TransactionsPage {...defaultProps} />);

    const sortSelect = screen.getByLabelText('Sort transactions');
    expect(sortSelect).toBeInTheDocument();
    expect(screen.getByText('Newest date')).toBeInTheDocument();
    expect(screen.getByText('Highest amount')).toBeInTheDocument();

    fireEvent.change(sortSelect, { target: { value: 'amount_desc' } });
    expect(defaultProps.setSort).toHaveBeenCalledWith('amount_desc');
  });

  it('renders Export CSV button', () => {
    render(<TransactionsPage {...defaultProps} />);

    const exportBtn = screen.getByRole('button', { name: /Export CSV/i });
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).not.toBeDisabled();
  });

  it('renders pagination controls and info', () => {
    render(<TransactionsPage {...defaultProps} />);

    expect(screen.getByText(/Showing 1 to 2 of 2 records/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });
});

