import { describe, it, expect } from 'vitest';
import { validateTransaction, validateCategoryName, validateProfile } from '../utils/validation.js';

describe('Validation Utilities', () => {
  describe('validateTransaction', () => {
    it('returns error when amount is 0 or negative', () => {
      expect(validateTransaction({ amount: 0, description: 'Test', date: '2026-10-15', type: 'INCOME' }).amount)
        .toBe('Amount must be greater than 0.');
      expect(validateTransaction({ amount: -50, description: 'Test', date: '2026-10-15', type: 'INCOME' }).amount)
        .toBe('Amount must be greater than 0.');
      expect(validateTransaction({ amount: 'abc', description: 'Test', date: '2026-10-15', type: 'INCOME' }).amount)
        .toBe('Amount must be greater than 0.');
    });

    it('returns error when description is empty or exceeds 500 chars', () => {
      expect(validateTransaction({ amount: 10, description: '   ', date: '2026-10-15', type: 'INCOME' }).description)
        .toBe('Description is required.');
      const longDesc = 'a'.repeat(501);
      expect(validateTransaction({ amount: 10, description: longDesc, date: '2026-10-15', type: 'INCOME' }).description)
        .toBe('Description must be 500 characters or fewer.');
    });

    it('returns error when date is missing', () => {
      expect(validateTransaction({ amount: 10, description: 'Lunch', date: '', type: 'INCOME' }).date)
        .toBe('Date is required.');
    });

    it('returns error when type is not INCOME or EXPENSE', () => {
      expect(validateTransaction({ amount: 10, description: 'Lunch', date: '2026-10-15', type: 'INVALID' }).type)
        .toBe('Select income or expense.');
    });

    it('requires categoryId for EXPENSE type', () => {
      const result = validateTransaction({ amount: 10, description: 'Lunch', date: '2026-10-15', type: 'EXPENSE', categoryId: '' });
      expect(result.categoryId).toBe('Choose a category for an expense.');
    });

    it('allows empty categoryId for INCOME type', () => {
      const result = validateTransaction({ amount: 1000, description: 'Salary', date: '2026-10-15', type: 'INCOME', categoryId: '' });
      expect(result.categoryId).toBeUndefined();
      expect(Object.keys(result).length).toBe(0);
    });

    it('passes for valid expense transaction', () => {
      const result = validateTransaction({
        amount: 25.50,
        description: 'Groceries',
        date: '2026-10-15',
        type: 'EXPENSE',
        categoryId: 3,
      });
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('validateCategoryName', () => {
    it('returns error for empty category name', () => {
      expect(validateCategoryName('')).toBe('Category name is required.');
      expect(validateCategoryName('   ')).toBe('Category name is required.');
      expect(validateCategoryName(null)).toBe('Category name is required.');
    });

    it('returns error for category name exceeding 60 characters', () => {
      expect(validateCategoryName('a'.repeat(61))).toBe('Category name must be 60 characters or fewer.');
    });

    it('passes for valid category name', () => {
      expect(validateCategoryName('Food & Dining')).toBe('');
    });
  });

  describe('validateProfile', () => {
    it('returns error for empty name', () => {
      expect(validateProfile({ name: '', email: 'test@example.com' }).name).toBe('Name is required.');
    });

    it('returns error for invalid email', () => {
      expect(validateProfile({ name: 'John Doe', email: 'invalid-email' }).email).toBe('Enter a valid email address.');
      expect(validateProfile({ name: 'John Doe', email: 'user@' }).email).toBe('Enter a valid email address.');
    });

    it('passes for valid profile', () => {
      expect(Object.keys(validateProfile({ name: 'John Doe', email: 'john@example.com' })).length).toBe(0);
    });
  });
});

