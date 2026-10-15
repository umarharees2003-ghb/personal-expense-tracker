import React from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { money } from './common.jsx';
import { TransactionTable } from './TransactionTable.jsx';
import { RequestStatus } from './RequestStatus.jsx';

export function TransactionsPage({
  transactions, onAdd, onEdit, onDelete, filter, setFilter, categoryFilter,
  setCategoryFilter, categories, period, setPeriod, rangeStart, setRangeStart,
  rangeEnd, setRangeEnd, search, setSearch, loading, error, onRetry, actionsDisabled,
}) {
  const totals = transactions.reduce((acc, item) => {
    acc[item.type] += Number(item.amount);
    return acc;
  }, { income: 0, expense: 0 });

  return <>
    <div className="page-title-row">
      <div><div className="eyebrow"><span className="live-dot" /> YOUR MONEY, IN MOTION</div><h1>Transactions</h1><p>Every little detail, all in one place.</p></div>
      <button className="button-primary" onClick={onAdd}><Plus size={17} /> Add transaction</button>
    </div>
    <div className="transaction-stats">
      <div><span>Showing transactions</span><strong>{loading ? '—' : transactions.length}<small> records</small></strong></div>
      <div><span>Total income</span><strong className="income">{money(totals.income)}</strong></div>
      <div><span>Total expenses</span><strong className="expense">{money(totals.expense)}</strong></div>
    </div>
    <div className="panel transactions-page-panel">
      <div className="table-toolbar">
        <div className="filter-tabs">{['All transactions', 'Income', 'Expenses'].map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <div className="table-filters">
          <label className="table-search"><Search size={15} /><input placeholder="Search descriptions" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search transactions by description" /></label>
          <select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
          </select>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Filter by date">
            <option>This month</option><option>All time</option><option>Custom range</option>
          </select>
          <button className="icon-button filter-button" aria-label="Filter by date range" onClick={() => setPeriod(period === 'Custom range' ? 'All time' : 'Custom range')}><SlidersHorizontal size={16} /></button>
        </div>
      </div>
      {period === 'Custom range' && <div className="date-range-fields"><label>From<input type="date" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} /></label><label>To<input type="date" value={rangeEnd} min={rangeStart} onChange={(event) => setRangeEnd(event.target.value)} /></label></div>}
      <RequestStatus loading={loading} error={error} onRetry={onRetry} />
      {!loading && !error && <TransactionTable transactions={transactions} onEdit={onEdit} onDelete={onDelete} actionsDisabled={actionsDisabled} />}
    </div>
  </>;
}
