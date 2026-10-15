import {
  BriefcaseBusiness, CarFront, Clapperboard, CreditCard, GraduationCap,
  HeartPulse, Home, ShoppingBag, Tag, Utensils,
} from 'lucide-react';

const categoryStyles = [
  { terms: ['food', 'drink', 'restaurant'], icon: Utensils, color: 'orange' },
  { terms: ['transport', 'travel'], icon: CarFront, color: 'blue' },
  { terms: ['housing', 'home', 'rent'], icon: Home, color: 'purple' },
  { terms: ['shopping'], icon: ShoppingBag, color: 'pink' },
  { terms: ['health'], icon: HeartPulse, color: 'red' },
  { terms: ['education'], icon: GraduationCap, color: 'teal' },
  { terms: ['entertainment'], icon: Clapperboard, color: 'yellow' },
  { terms: ['bill', 'utility'], icon: CreditCard, color: 'green' },
  { terms: ['salary', 'income', 'work'], icon: BriefcaseBusiness, color: 'green' },
];

export function categoryAppearance(name = '') {
  const match = categoryStyles.find(({ terms }) => terms.some((term) => name.toLowerCase().includes(term)));
  return match ? { icon: match.icon, color: match.color } : { icon: Tag, color: 'teal' };
}

export function mapTransaction(transaction) {
  const categoryName = transaction.categoryName ?? 'Uncategorized';
  return {
    ...transaction,
    name: transaction.description ?? '',
    category: categoryName,
    date: String(transaction.date).slice(0, 10),
    type: transaction.type.toLowerCase(),
    note: '',
    ...categoryAppearance(categoryName),
  };
}

export function mapTransactionRequest(values) {
  return {
    amount: Number(values.amount),
    description: values.description.trim(),
    date: values.date,
    type: values.type.toUpperCase(),
    categoryId: values.categoryId ? Number(values.categoryId) : null,
  };
}
