import React from 'react';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate, isCurrentMonth } from '../utils/formatDate.js';

export const money = (amount, currency, fromCurrency) => formatCurrency(amount, currency, fromCurrency);
export const prettyDate = formatDate;
export const thisMonth = isCurrentMonth;

export function IconBox({ icon: Icon, color = 'teal', size = 18 }) {
  return <span className={`icon-box ${color}`}><Icon size={size} strokeWidth={1.8} /></span>;
}
