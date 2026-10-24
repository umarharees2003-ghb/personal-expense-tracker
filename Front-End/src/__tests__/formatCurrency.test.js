import { describe, it, expect } from 'vitest';
import { formatCurrency, getCurrencySymbol } from '../utils/formatCurrency.js';

describe('formatCurrency Utility', () => {
  it('formats LKR correctly with Rs. prefix', () => {
    const formatted = formatCurrency(1250.50, 'LKR');
    expect(formatted).toContain('Rs.');
    expect(formatted).toContain('1,250.5');
  });

  it('formats USD correctly with $ sign', () => {
    const formatted = formatCurrency(45.99, 'USD');
    expect(formatted).toContain('$');
    expect(formatted).toContain('45.99');
  });

  it('formats EUR correctly with € sign', () => {
    const formatted = formatCurrency(100.00, 'EUR');
    expect(formatted).toContain('€');
  });

  it('handles 0 and null amounts gracefully', () => {
    expect(formatCurrency(0, 'LKR')).toContain('Rs.');
    expect(formatCurrency(null, 'LKR')).toContain('Rs. 0');
  });

  it('returns correct currency symbol for each currency code', () => {
    expect(getCurrencySymbol('USD')).toBe('$');
    expect(getCurrencySymbol('EUR')).toBe('€');
    expect(getCurrencySymbol('GBP')).toBe('£');
    expect(getCurrencySymbol('LKR')).toBe('Rs.');
    expect(getCurrencySymbol('OTHER')).toBe('Rs.');
  });
});
