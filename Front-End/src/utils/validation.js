export function validateTransaction({ amount, description, date, type, categoryId }) {
  const errors = {};
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) errors.amount = 'Amount must be greater than 0.';
  if (!description?.trim()) errors.description = 'Description is required.';
  else if (description.trim().length > 500) errors.description = 'Description must be 500 characters or fewer.';
  if (!date) errors.date = 'Date is required.';
  if (!['INCOME', 'EXPENSE'].includes(type)) errors.type = 'Select income or expense.';
  if (type === 'EXPENSE' && !categoryId) errors.categoryId = 'Choose a category for an expense.';
  return errors;
}

export function validateCategoryName(name) {
  const normalized = name?.trim() ?? '';
  if (!normalized) return 'Category name is required.';
  if (normalized.length > 60) return 'Category name must be 60 characters or fewer.';
  return '';
}

export function validateProfile({ name, email }) {
  const errors = {};
  if (!name?.trim()) errors.name = 'Name is required.';
  else if (name.trim().length > 100) errors.name = 'Name must be 100 characters or fewer.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ?? '')) errors.email = 'Enter a valid email address.';
  return errors;
}
