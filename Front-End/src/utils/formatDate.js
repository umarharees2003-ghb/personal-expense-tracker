export function formatDate(date) {
  if (!date) return '';
  const [year, month, day] = date.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('en-LK', { day: 'numeric', month: 'short' })
    .format(new Date(year, month - 1, day));
}

export function isCurrentMonth(date, now = new Date()) {
  if (!date) return false;
  const [year, month] = date.slice(0, 10).split('-').map(Number);
  return year === now.getFullYear() && month === now.getMonth() + 1;
}

export function currentMonthParams(now = new Date()) {
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function toDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
