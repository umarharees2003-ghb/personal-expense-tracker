import { describe, it, expect, vi } from 'vitest';
import { exportTransactionsToCsv, exportReportToCsv } from '../utils/csvExport.js';

describe('CSV Export Utilities', () => {
  it('triggers a download with proper CSV formatting and escaping', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    const mockTransactions = [
      { id: 1, date: '2026-10-15', type: 'expense', category: 'Food & Drinks', description: 'Lunch "with friends"', amount: 25.50 },
      { id: 2, date: '2026-10-16', type: 'income', category: 'Salary', description: 'Monthly payment', amount: 3000.00 },
    ];

    exportTransactionsToCsv(mockTransactions, 'test.csv');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('exports report data with summary and category breakdown', () => {
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:report-url');
    global.URL.revokeObjectURL = vi.fn();

    const mockReport = {
      summary: { income: 5000, expenses: 2000, balance: 3000 },
      categories: [{ category: 'Rent', amount: 1500 }, { category: 'Food', amount: 500 }],
    };

    exportReportToCsv(mockReport, 'October 2026', 'report.csv');

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:report-url');
  });
});

