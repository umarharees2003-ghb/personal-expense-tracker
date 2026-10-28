export const EXCHANGE_RATES = {
  LKR: 1,       // Base currency
  USD: 300,     // 1 USD = 300 LKR
  EUR: 325,     // 1 EUR = 325 LKR
  GBP: 380,     // 1 GBP = 380 LKR
};

export function getExchangeRates() {
  return EXCHANGE_RATES;
}

/**
 * Converts an amount from one currency to another using standard exchange rates.
 * Default base currency is LKR.
 *
 * @param {number|string} amount - Monetary amount to convert
 * @param {string} fromCurrency - Source currency code (e.g. 'LKR', 'USD')
 * @param {string} toCurrency - Target currency code (e.g. 'USD', 'EUR')
 * @returns {number} Converted numerical amount
 */
export function convertCurrency(amount, fromCurrency = 'LKR', toCurrency = 'LKR') {
  const num = Number(amount) || 0;
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return num;
  const rateFrom = EXCHANGE_RATES[fromCurrency] || 1;
  const rateTo = EXCHANGE_RATES[toCurrency] || 1;

  // Convert from source currency to base (LKR), then from LKR to target currency
  const inLkr = num * rateFrom;
  return inLkr / rateTo;
}

/**
 * Returns the standard display symbol for a given currency code.
 */
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

/**
 * Formats a monetary amount into the target currency string.
 * Automatically converts the amount from base currency (LKR) to the target currency.
 *
 * @param {number|string} amount - Monetary amount
 * @param {string} [currency] - Target display currency code
 * @param {string} [fromCurrency='LKR'] - Source currency code of the amount
 * @returns {string} Formatted currency string with symbol
 */
export function formatCurrency(
  amount,
  currency = (typeof window === 'undefined' ? 'LKR' : window.localStorage.getItem('finora.currency') || 'LKR'),
  fromCurrency = 'LKR',
) {
  const converted = convertCurrency(amount, fromCurrency, currency);
  const formatted = new Intl.NumberFormat(currency === 'LKR' ? 'en-LK' : 'en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);

  return currency === 'LKR' ? `Rs. ${formatted}` : new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
}
