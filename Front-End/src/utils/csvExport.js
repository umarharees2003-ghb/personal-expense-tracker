export function exportTransactionsToCsv(transactions, filename = 'finora-transactions.csv') {
  if (!transactions || !transactions.length) {
    alert('No transactions to export.');
    return;
  }

  const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount'];
  const rows = transactions.map((t) => [
    t.id ?? '',
    t.date ?? '',
    (t.type ?? '').toUpperCase(),
    `"${(t.category ?? 'Uncategorized').replace(/"/g, '""')}"`,
    `"${(t.description ?? t.name ?? '').replace(/"/g, '""')}"`,
    Number(t.amount || 0).toFixed(2),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReportToCsv(report, periodLabel = 'report', filename = 'finora-financial-report.csv') {
  if (!report || !report.summary) {
    alert('No report data to export.');
    return;
  }

  const lines = [
    `Finora Financial Report - ${periodLabel}`,
    `Generated on: ${new Date().toISOString().slice(0, 10)}`,
    '',
    'Summary Metric,Amount',
    `Total Income,${Number(report.summary.income || 0).toFixed(2)}`,
    `Total Expenses,${Number(report.summary.expenses || 0).toFixed(2)}`,
    `Net Savings (Balance),${Number(report.summary.balance || 0).toFixed(2)}`,
    '',
    'Category Expenses',
    'Category,Amount',
  ];

  if (report.categories && report.categories.length) {
    report.categories.forEach((cat) => {
      lines.push(`"${(cat.category ?? '').replace(/"/g, '""')}",${Number(cat.amount || 0).toFixed(2)}`);
    });
  } else {
    lines.push('No category breakdown available,0.00');
  }

  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

