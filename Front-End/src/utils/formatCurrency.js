export function getCurrencySymbol(currency = (typeof window === 'undefined' ? 'LKR' : window.localStorage.getItem('finora.currency') || 'LKR')) {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'LKR':
    default:
      return 'Rs.';
  }
}

export function formatCurrency(amount, currency = (typeof window === 'undefined' ? 'LKR' : window.localStorage.getItem('finora.currency') || 'LKR')) {
  const value = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 2 }).format(Number(amount) || 0);
  return currency === 'LKR' ? `Rs. ${value}` : new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}
