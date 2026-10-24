import React, { useState } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Ellipsis, MoreHorizontal, Plus, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import { IconBox, money } from './common.jsx';
import { SummaryCard } from './SummaryCard.jsx';
import { TransactionTable } from './TransactionTable.jsx';
import { RequestStatus } from './RequestStatus.jsx';

export function Dashboard({ profile, income, expense, balance, monthlyIncome, monthlyExpense, monthlyBalance, categories, transactions, onAdd, onEdit, onDelete, onNavigate, loading, error, onRetry, actionsDisabled }) {
  const [chartMode, setChartMode] = useState('Overview');
  const categoryColors = { orange: '#d99059', purple: '#9a87b7', blue: '#7798bd', pink: '#d7899c', red: '#ce776d', green: '#72a985', teal: '#66a8a1', yellow: '#d1aa60' };
  const breakdown = categories.filter((item) => item.spent > 0).sort((a, b) => b.spent - a.spent);
  const categoryTotal = breakdown.reduce((total, item) => total + Number(item.spent), 0);
  let angle = 0;
  const donutBackground = `conic-gradient(${breakdown.map((item) => {
    const start = angle;
    angle += categoryTotal ? item.spent / categoryTotal * 100 : 0;
    return `${categoryColors[item.color] ?? categoryColors.teal} ${start}% ${angle}%`;
  }).join(', ') || '#e8ece6 0% 100%'})`;
  const chartMax = Math.max(monthlyIncome, monthlyExpense, 1);
  const barHeight = (value) => `${value ? Math.max(value / chartMax * 88, 2) : 0}%`;
  const savingsRate = monthlyIncome ? monthlyBalance / monthlyIncome * 100 : 0;
  const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date());
  return <>
    <div className="welcome-row">
      <div><div className="eyebrow"><span className="live-dot" /> {new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()}</div><h1>Welcome, {profile.name.split(' ')[0]} <span className="wave">✳</span></h1><p>Here’s what’s happening with your money today.</p></div>
      <button className="button-primary" onClick={onAdd}><Plus size={17} /> Add transaction</button>
    </div>
    <RequestStatus loading={loading} error={error} onRetry={onRetry} />
    {!loading && !error && <>
    <section className="summary-grid">
      <SummaryCard title="Total balance" amount={balance} icon={Wallet} color="teal" detail="Income less expenses" />
      <SummaryCard title="Total income" amount={income} icon={ArrowDownLeft} color="green" detail="All recorded income" />
      <SummaryCard title="Total expenses" amount={expense} icon={ArrowUpRight} color="orange" detail="All recorded expenses" />
      <div className="savings-card"><div className="savings-top"><span>MONTHLY SAVINGS RATE</span><MoreHorizontal size={18} /></div><div className="savings-number">{Math.round(savingsRate)}<small>%</small></div><div className="savings-progress"><span style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }} /></div><p>Calculated from this month’s actual income and expenses.</p><div className="savings-sparkle"><Sparkles size={21} /></div></div>
    </section>
    <section className="dashboard-grid">
      <div className="panel spending-panel">
        <div className="panel-heading"><div><h2>Monthly cash flow</h2><p>Income and expenses for {monthLabel}</p></div><div className="segmented-control" aria-label="Emphasize cash flow series">{['Overview', 'Income', 'Expenses'].map((mode) => <button key={mode} type="button" className={chartMode === mode ? 'selected' : ''} aria-pressed={chartMode === mode} onClick={() => setChartMode(mode)}>{mode}</button>)}</div></div>
        <div className="chart-summary"><strong>{money(monthlyIncome)}</strong><span>Income <i>·</i> Expenses {money(monthlyExpense)}</span></div>
        <div className="bar-chart" role="img" aria-label={`Cash flow for ${monthLabel}: income ${money(monthlyIncome)}, expenses ${money(monthlyExpense)}`}>
          <div className="chart-y-labels"><span>{money(chartMax)}</span><span>{money(chartMax / 2)}</span><span>0</span></div>
          <div className="chart-plot"><div className="chart-gridlines"><i /><i /><i /></div><div className="bar-groups"><div className="bar-group"><div className="bars"><span aria-hidden="true" className={`bar income-bar${chartMode === 'Expenses' ? ' muted-bar' : ''}`} style={{ height: barHeight(monthlyIncome) }} /><span aria-hidden="true" className={`bar expense-bar${chartMode === 'Income' ? ' muted-bar' : ''}`} style={{ height: barHeight(monthlyExpense) }} /></div><small>{new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date())}</small></div></div></div>
        </div>
        <div className="chart-legend"><span><i className="legend-income" /> Income</span><span><i className="legend-expense" /> Expenses</span></div>
      </div>
      <div className="panel breakdown-panel">
        <div className="panel-heading"><div><h2>Spending breakdown</h2><p>Where your money goes</p></div><button className="icon-button subtle-button" onClick={() => onNavigate('Categories')} aria-label="View categories"><Ellipsis size={19} /></button></div>
        <div className="donut-wrap"><div className="donut-chart" role="img" aria-label={`Monthly spending by category totals ${money(categoryTotal)}`} style={{ background: donutBackground }}><div className="donut-center"><strong>{money(categoryTotal)}</strong><span>by category</span></div></div></div>
        <div className="category-legend">
          {breakdown.slice(0, 4).map((item) => <div className="category-legend-row" key={item.name}><span><i className={`legend-dot ${item.color}`} />{item.name}</span><strong>{money(item.spent)}</strong><small>{categoryTotal ? `${Math.round(item.spent / categoryTotal * 100)}%` : '0%'}</small></div>)}
          {!breakdown.length && <p className="empty-state">No spending by category this month.</p>}
        </div>
        <button className="text-action full-action" onClick={() => onNavigate('Reports')}>View detailed report <ArrowRight size={15} /></button>
      </div>
    </section>
    <section className="panel transactions-panel">
      <div className="panel-heading transactions-heading"><div><h2>Recent transactions</h2><p>A little snapshot of your latest activity</p></div><div className="transaction-heading-actions"><button className="button-quiet" onClick={onAdd}><Plus size={15} /> Add new</button><button className="text-action" onClick={() => onNavigate('Transactions')}>View all <ArrowRight size={15} /></button></div></div>
      <TransactionTable transactions={transactions.slice(0, 5)} onEdit={onEdit} onDelete={onDelete} compact actionsDisabled={actionsDisabled} />
    </section>
    <div className="bottom-insight"><div className="insight-icon"><Sparkles size={18} /></div><div><strong>{monthlyBalance >= 0 ? 'Monthly balance' : 'Monthly deficit'}</strong><span>This month: {money(monthlyBalance)} net.</span></div><button onClick={() => onNavigate('Reports')}>See your insights <ArrowRight size={14} /></button></div>
    </>}
  </>;
}
