import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Download, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { money } from './common.jsx';
import { TransactionTable } from './TransactionTable.jsx';
import { RequestStatus } from './RequestStatus.jsx';
import { exportTransactionsToCsv } from '../utils/csvExport.js';

export function TransactionsPage({
  transactions, onAdd, onEdit, onDelete, filter, setFilter, categoryFilter,
  setCategoryFilter, categories, period, setPeriod, rangeStart, setRangeStart,
  rangeEnd, setRangeEnd, search, setSearch, sort = 'date_desc', setSort,
  loading, error, onRetry, actionsDisabled,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totals = transactions.reduce((acc, item) => {
    acc[item.type] += Number(item.amount);
    return acc;
  }, { income: 0, expense: 0 });

  // Reset page when filter/search/sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, categoryFilter, period, search, sort, rangeStart, rangeEnd]);

  const totalPages = pageSize === 'all'
    ? 1
    : Math.max(1, Math.ceil(transactions.length / Number(pageSize)));

  const pagedTransactions = useMemo(() => {
    if (pageSize === 'all') return transactions;
    const size = Number(pageSize);
    const start = (currentPage - 1) * size;
    return transactions.slice(start, start + size);
  }, [transactions, currentPage, pageSize]);

  const handleExport = () => {
    exportTransactionsToCsv(transactions, `finora-transactions-${period.toLowerCase().replace(/\s+/g, '-')}.csv`);
  };

  return <>
    <div className="page-title-row">
      <div>
        <div className="eyebrow"><span className="live-dot" /> YOUR MONEY, IN MOTION</div>
        <h1>Transactions</h1>
        <p>Every little detail, all in one place.</p>
      </div>
      <div className="page-actions-group">
        <button className="button-quiet" onClick={handleExport} title="Export current filtered transactions to CSV" disabled={!transactions.length}>
          <Download size={16} /> Export CSV
        </button>
        <button className="button-primary" onClick={onAdd} disabled={actionsDisabled}>
          <Plus size={17} /> Add transaction
        </button>
      </div>
    </div>
    <div className="transaction-stats">
      <div><span>Showing transactions</span><strong>{loading ? '—' : transactions.length}<small> records</small></strong></div>
      <div><span>Total income</span><strong className="income">{money(totals.income)}</strong></div>
      <div><span>Total expenses</span><strong className="expense">{money(totals.expense)}</strong></div>
    </div>
    <div className="panel transactions-page-panel">
      <div className="table-toolbar">
        <div className="filter-tabs">
          {['All transactions', 'Income', 'Expenses'].map((item) => (
            <button
              key={item}
              className={filter === item ? 'selected' : ''}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="table-filters">
          <label className="table-search">
            <Search size={15} />
            <input
              placeholder="Search descriptions"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search transactions by description"
            />
          </label>
          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>{category.name}</option>
            ))}
          </select>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label="Filter by date"
          >
            <option>This month</option>
            <option>All time</option>
            <option>Custom range</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort transactions"
            className="table-sort-select"
          >
            <option value="date_desc">Newest date</option>
            <option value="date_asc">Oldest date</option>
            <option value="amount_desc">Highest amount</option>
            <option value="amount_asc">Lowest amount</option>
          </select>
          <button
            className="icon-button filter-button"
            aria-label="Filter by date range"
            onClick={() => setPeriod(period === 'Custom range' ? 'All time' : 'Custom range')}
            title="Toggle custom date range"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>
      {period === 'Custom range' && (
        <div className="date-range-fields">
          <label>From<input type="date" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} /></label>
          <label>To<input type="date" value={rangeEnd} min={rangeStart} onChange={(event) => setRangeEnd(event.target.value)} /></label>
        </div>
      )}
      <RequestStatus loading={loading} error={error} onRetry={onRetry} />
      {!loading && !error && (
        <>
          <TransactionTable
            transactions={pagedTransactions}
            onEdit={onEdit}
            onDelete={onDelete}
            actionsDisabled={actionsDisabled}
          />
          {transactions.length > 0 && (
            <div className="table-pagination">
              <div className="pagination-info">
                Showing {pageSize === 'all' ? 1 : Math.min((currentPage - 1) * Number(pageSize) + 1, transactions.length)} to{' '}
                {pageSize === 'all' ? transactions.length : Math.min(currentPage * Number(pageSize), transactions.length)} of {transactions.length} records
              </div>
              <div className="pagination-controls">
                <label className="pagination-size">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(e.target.value); setCurrentPage(1); }}
                    aria-label="Records per page"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="all">All</option>
                  </select>
                </label>
                <button
                  className="button-quiet pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || pageSize === 'all'}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span className="pagination-current">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="button-quiet pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || pageSize === 'all'}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </>;
}
