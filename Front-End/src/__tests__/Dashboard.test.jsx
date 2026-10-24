import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dashboard } from '../components/Dashboard.jsx';

describe('Dashboard', () => {
  it('scales cash flow and category breakdown to the current-month API totals', () => {
    const { container } = render(
      <Dashboard
        profile={{ name: 'Alex Rivera' }}
        income={12000}
        expense={8000}
        balance={4000}
        monthlyIncome={1000}
        monthlyExpense={250}
        monthlyBalance={750}
        categories={[{ name: 'Food', color: 'orange', spent: 250 }]}
        transactions={[]}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onNavigate={vi.fn()}
        loading={false}
        error=""
        onRetry={vi.fn()}
        actionsDisabled={false}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Monthly cash flow' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Cash flow for .*income .*expenses/ })).toBeInTheDocument();
    expect(container.querySelector('.income-bar')).toHaveStyle({ height: '88%' });
    expect(container.querySelector('.expense-bar')).toHaveStyle({ height: '22%' });
    expect(container.querySelector('.donut-center strong')).toHaveTextContent('250');
    expect(container.querySelector('.category-legend-row small')).toHaveTextContent('100%');
    expect(screen.queryByText('Compared to previous 6 months')).not.toBeInTheDocument();
  });
});
