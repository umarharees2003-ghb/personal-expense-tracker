import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  getCurrencySymbol,
  convertCurrency,
  getExchangeRates,
  EXCHANGE_RATES,
} from '../utils/formatCurrency.js';

describe('formatCurrency Utility', () => {
  describe('convertCurrency', () => {
    it('converts correctly from base currency (LKR) to foreign currencies', () => {
      expect(convertCurrency(3000, 'LKR', 'USD')).toBe(10);
      expect(convertCurrency(3250, 'LKR', 'EUR')).toBe(10);
      expect(convertCurrency(3800, 'LKR', 'GBP')).toBe(10);
      expect(convertCurrency(500, 'LKR', 'LKR')).toBe(500);
    });

    it('converts correctly from foreign currencies back to base currency (LKR)', () => {
      expect(convertCurrency(10, 'USD', 'LKR')).toBe(3000);
      expect(convertCurrency(10, 'EUR', 'LKR')).toBe(3250);
      expect(convertCurrency(10, 'GBP', 'LKR')).toBe(3800);
    });

    it('converts correctly between two foreign currencies', () => {
      // 325 USD = 325 * 300 LKR = 97500 LKR / 325 EUR = 300 EUR
      expect(convertCurrency(325, 'USD', 'EUR')).toBe(300);
    });

    it('returns same amount if source and target currencies match', () => {
      expect(convertCurrency(120.5, 'USD', 'USD')).toBe(120.5);
      expect(convertCurrency(500, 'EUR', 'EUR')).toBe(500);
    });

    it('handles zero, empty, and invalid values gracefully', () => {
      expect(convertCurrency(0, 'LKR', 'USD')).toBe(0);
      expect(convertCurrency(null, 'LKR', 'USD')).toBe(0);
      expect(convertCurrency('invalid', 'LKR', 'USD')).toBe(0);
    });
  });

  describe('getExchangeRates', () => {
    it('returns standard exchange rates relative to LKR', () => {
      const rates = getExchangeRates();
      expect(rates.LKR).toBe(1);
      expect(rates.USD).toBe(300);
      expect(rates.EUR).toBe(325);
      expect(rates.GBP).toBe(380);
      expect(rates).toEqual(EXCHANGE_RATES);
    });
  });

  describe('getCurrencySymbol', () => {
    it('returns correct currency symbol for each currency code', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencySymbol('EUR')).toBe('€');
      expect(getCurrencySymbol('GBP')).toBe('£');
      expect(getCurrencySymbol('LKR')).toBe('Rs.');
      expect(getCurrencySymbol('UNKNOWN')).toBe('Rs.');
    });
  });

  describe('formatCurrency', () => {
    it('formats LKR correctly with Rs. prefix', () => {
      const formatted = formatCurrency(1250.5, 'LKR', 'LKR');
      expect(formatted).toContain('Rs.');
      expect(formatted).toContain('1,250.50');
    });

    it('converts and formats LKR to USD correctly', () => {
      // 3000 LKR / 300 = 10.00 USD
      const formatted = formatCurrency(3000, 'USD', 'LKR');
      expect(formatted).toContain('$');
      expect(formatted).toContain('10.00');
    });

    it('converts and formats LKR to EUR correctly', () => {
      // 3250 LKR / 325 = 10.00 EUR
      const formatted = formatCurrency(3250, 'EUR', 'LKR');
      expect(formatted).toContain('€');
      expect(formatted).toContain('10.00');
    });

    it('converts and formats LKR to GBP correctly', () => {
      // 3800 LKR / 380 = 10.00 GBP
      const formatted = formatCurrency(3800, 'GBP', 'LKR');
      expect(formatted).toContain('£');
      expect(formatted).toContain('10.00');
    });

    it('formats already-converted foreign amounts without re-converting', () => {
      const formatted = formatCurrency(45.99, 'USD', 'USD');
      expect(formatted).toContain('$');
      expect(formatted).toContain('45.99');
    });

    it('handles 0 and null amounts gracefully', () => {
      expect(formatCurrency(0, 'LKR', 'LKR')).toContain('Rs.');
      expect(formatCurrency(null, 'LKR', 'LKR')).toContain('Rs. 0.00');
      expect(formatCurrency(0, 'USD', 'USD')).toContain('$0.00');
    });
  });
});
