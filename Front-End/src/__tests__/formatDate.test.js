import { describe, it, expect } from 'vitest';
import { formatDate, isCurrentMonth, currentMonthParams, toDateInputValue } from '../utils/formatDate.js';

describe('formatDate Utilities', () => {
  it('formats YYYY-MM-DD date string nicely', () => {
    const formatted = formatDate('2026-10-15');
    expect(formatted).toContain('15');
    expect(formatted).toContain('Oct');
  });

  it('handles empty date string gracefully', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
  });

  it('determines current month correctly', () => {
    const now = new Date(2026, 9, 15); // Month 9 is October (0-indexed)
    expect(isCurrentMonth('2026-10-05', now)).toBe(true);
    expect(isCurrentMonth('2026-09-05', now)).toBe(false);
  });

  it('returns current month parameters', () => {
    const now = new Date(2026, 9, 15);
    const params = currentMonthParams(now);
    expect(params.year).toBe(2026);
    expect(params.month).toBe(10);
  });

  it('formats Date object to YYYY-MM-DD input string', () => {
    const date = new Date(2026, 9, 5);
    expect(toDateInputValue(date)).toBe('2026-10-05');
  });
});

