import React from 'react';
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Download, Sparkles, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { IconBox, money } from './common.jsx';
import { RequestStatus } from './RequestStatus.jsx';

export function ReportsPage({
  report, period, setPeriod, startDate, setStartDate, endDate, setEndDate,
  loading, error, onRetry,
}) {
  const income = Number(report?.summary.income ?? 0);
  const expense = Number(report?.summary.expenses ?? 0);
  const balance = Number(report?.summary.balance ?? income - expense);
  const maxValue = Math.max(income, expense, 1);
  const categories = report?.categories ?? [];
  const chartLabel = period === 'This month'
    ? new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date())
    : `${startDate} – ${endDate}`;
  const chartHeight = (value) => `${Math.max(value ? value / maxValue * 88 : 0, value ? 2 : 0)}%`;

  return <>
    <div className="page-title-row"><div><div className="eyebrow"><span className="live-dot" /> YOUR FINANCIAL RECAP</div><h1>Reports & insights</h1><p>A clearer picture of how your money moves.</p></div><button className="button-quiet report-download" onClick={() => window.print()}><Download size={16} /> Download report</button></div>
    <div className="report-period"><CalendarDays size={17} /><span>Showing report for</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>This month</option><option>Custom range</option></select></div>
    {period === 'Custom range' && <div className="date-range-fields"><label>From<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>To<input type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div>}
    <RequestStatus loading={loading} error={error} onRetry={onRetry} />
    {!loading && !error && report && <>
      <div className="report-kpis">
        <div className="panel report-kpi"><span><IconBox icon={ArrowDownLeft} color="green" /> Total income</span><strong>{money(income)}</strong><small><TrendingUp size={13} /> For selected period</small></div>
        <div className="panel report-kpi"><span><IconBox icon={ArrowUpRight} color="orange" /> Total expenses</span><strong>{money(expense)}</strong><small><TrendingDown size={13} /> For selected period</small></div>
        <div className="panel report-kpi"><span><IconBox icon={Wallet} color="teal" /> Net savings</span><strong>{money(balance)}</strong><small><Sparkles size={13} /> {income ? Math.round(balance / income * 100) : 0}% of income saved</small></div>
      </div>
      <div className="reports-grid">
        <div className="panel report-chart-panel">
          <div className="panel-heading"><div><h2>Income vs. expenses</h2><p>Actual totals for the selected period.</p></div></div>
          <div className="report-bars">
            <div className="report-y-labels"><span>{money(maxValue)}</span><span>{money(maxValue / 2)}</span><span>0</span></div>
            <div className="report-plot"><div className="chart-gridlines"><i /><i /><i /></div><div className="report-bar-group"><div className="bars"><span className="bar income-bar" style={{ height: chartHeight(income) }} /><span className="bar expense-bar" style={{ height: chartHeight(expense) }} /></div><small>{chartLabel}</small></div></div>
          </div>
          <div className="chart-legend"><span><i className="legend-income" /> Income</span><span><i className="legend-expense" /> Expenses</span></div>
        </div>
        <div className="panel report-category-panel">
          <div className="panel-heading"><div><h2>Spending by category</h2><p>Expenses for the selected period.</p></div></div>
          {categories.map((item) => <div className="report-category-row" key={item.category}>
            <IconBox icon={item.icon} color={item.color} size={16} /><span>{item.category}</span><strong>{money(item.amount)}</strong>
            <div className="report-category-track"><i style={{ width: `${Number(item.amount) / Math.max(...categories.map((entry) => Number(entry.amount)), 1) * 100}%` }} /></div>
          </div>)}
          {!categories.length && <p className="empty-state">No category expenses for this period.</p>}
        </div>
      </div>
      <div className="report-insight"><span><Sparkles size={19} /></span><div><strong>{balance >= 0 ? 'You saved money during this period.' : 'Expenses were higher than income.'}</strong><p>Income {money(income)} · Expenses {money(expense)} · Balance {money(balance)}.</p></div></div>
    </>}
  </>;
}
