import React, { useState } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { getCurrencySymbol } from '../utils/formatCurrency.js';

export function TransactionModal({
  transaction,
  categories,
  currency = 'LKR',
  onCreateCategory,
  onClose,
  onSave,
  loading,
  error,
}) {
  const [type, setType] = useState(transaction?.type ?? 'expense');
  const symbol = getCurrencySymbol(currency);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <div className="modal transaction-modal">
        <div className="modal-heading">
          <div>
            <span className="modal-kicker">
              {transaction ? 'MAKE AN UPDATE' : 'RECORD TRANSACTION'}
            </span>
            <h2>{transaction ? 'Edit transaction' : 'Add a transaction'}</h2>
            <p>Every detail helps you understand your personal cash flow.</p>
          </div>
          <button
            type="button"
            className="icon-button modal-close"
            aria-label="Close"
            onClick={onClose}
            disabled={loading}
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={onSave}>
          <div className="type-selector" role="group" aria-label="Transaction type">
            <button
              type="button"
              className={type === 'expense' ? 'active expense-select' : ''}
              onClick={() => setType('expense')}
              aria-pressed={type === 'expense'}
            >
              <ArrowUpRight size={16} /> Expense
            </button>
            <button
              type="button"
              className={type === 'income' ? 'active income-select' : ''}
              onClick={() => setType('income')}
              aria-pressed={type === 'income'}
            >
              <ArrowDownLeft size={16} /> Income
            </button>
            <input type="hidden" name="type" value={type.toUpperCase()} />
          </div>

          <label className="form-field amount-input-field">
            Amount
            <div className="amount-input-wrap">
              <span>{symbol}</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                name="amount"
                placeholder="0.00"
                defaultValue={transaction?.amount ?? ''}
                required
                autoFocus
                aria-label="Transaction amount"
              />
            </div>
          </label>

          <div className="modal-form-grid">
            <label className="form-field">
              Category {type === 'income' && <span className="optional-label">(Optional)</span>}
              <select
                name="categoryId"
                defaultValue={transaction?.categoryId ?? ''}
                required={type === 'expense'}
                aria-label="Transaction category"
              >
                <option value="">
                  {type === 'expense' ? 'Choose a category' : 'No category'}
                </option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Date
              <input
                type="date"
                name="date"
                defaultValue={transaction?.date ?? new Date().toLocaleDateString('en-CA')}
                required
                aria-label="Transaction date"
              />
            </label>
          </div>

          {!categories.length && type === 'expense' && (
            <div className="category-required" role="status">
              <span>Create a category before adding an expense.</span>
              <button
                type="button"
                className="text-action"
                onClick={onCreateCategory}
              >
                Create category
              </button>
            </div>
          )}

          <label className="form-field">
            Description
            <input
              name="description"
              maxLength="500"
              placeholder="e.g. Grocery shopping, Freelance invoice"
              defaultValue={transaction?.description ?? transaction?.name ?? ''}
              required
              aria-label="Transaction description"
            />
          </label>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="button-quiet"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="button-primary"
              type="submit"
              disabled={loading || (type === 'expense' && categories.length === 0)}
            >
              {loading ? 'Saving…' : transaction ? 'Save changes' : 'Add transaction'}{' '}
              {!loading && <ArrowRight size={15} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
