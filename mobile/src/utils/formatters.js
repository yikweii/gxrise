import { COLORS } from '../constants/colours';

/**
 * Format a number as Malaysian Ringgit currency.
 * @param {number} amount
 * @returns {string} e.g. "RM 1,234.00"
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'RM 0.00';
  const num = parseFloat(amount);
  return 'RM ' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const MONTHS = {
  bm: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/**
 * Format a date string into a long date format.
 * @param {string} dateStr
 * @param {'bm'|'en'} lang
 * @returns {string} e.g. "8 Mei 2026" or "8 May 2026"
 */
export function formatDate(dateStr, lang = 'bm') {
  const months = MONTHS[lang] || MONTHS.bm;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format a date as a relative string.
 * @param {string} dateStr
 * @param {'bm'|'en'} lang
 * @returns {string} e.g. "hari ini" / "today"
 */
export function formatRelativeDate(dateStr, lang = 'bm') {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (lang === 'en') {
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return 'last week';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return 'last month';
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  if (diffDays === 0) return 'hari ini';
  if (diffDays === 1) return 'semalam';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 14) return 'minggu lalu';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays < 60) return 'bulan lalu';
  return `${Math.floor(diffDays / 30)} bulan lalu`;
}

/**
 * Returns an emoji icon for a transaction category.
 * @param {string} category
 * @returns {string}
 */
export function getCategoryIcon(category) {
  const icons = {
    'Food & Drink': '🍔',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'BNPL': '💳',
    'Subscription': '📱',
    'Utilities': '💡',
    'Education': '🎓',
    'Health': '💊',
    'Entertainment': '🎬',
    'Transfer': '💸',
    'Income': '💰',
    'Savings': '🏦',
    'Other': '📦',
  };
  return icons[category] || '📦';
}

/**
 * Returns a colour hex for a transaction category.
 * @param {string} category
 * @returns {string}
 */
export function getCategoryColour(category) {
  const colours = {
    'Food & Drink': '#FF6B6B',
    'Transport': '#4ECDC4',
    'Shopping': '#9B59B6',
    'BNPL': COLORS.danger,
    'Subscription': '#F39C12',
    'Utilities': '#3498DB',
    'Education': COLORS.primary,
    'Health': COLORS.success,
    'Entertainment': '#E91E63',
    'Transfer': COLORS.accent,
    'Income': COLORS.success,
    'Savings': COLORS.primary,
    'Other': COLORS.textSecondary,
  };
  return colours[category] || COLORS.textSecondary;
}

/**
 * Format a date string as a short date (e.g. "30 Mac" or "30 Mar").
 * Parses YYYY-MM-DD directly — no new Date(), no timezone risk.
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {'bm'|'en'} lang
 * @returns {string}
 */
export function formatShortDate(dateStr, lang = 'bm') {
  const months = MONTHS[lang] || MONTHS.bm;
  const parts = (dateStr || '').split('-');
  if (parts.length < 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10) - 1;
  return `${day} ${months[month]}`;
}

/**
 * Abbreviate a number for display (e.g. 1200 → "1.2K").
 * @param {number} num
 * @returns {string}
 */
export function abbreviateNumber(num) {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(num);
}

/**
 * Format a percentage number.
 * @param {number} value - 0 to 100
 * @returns {string} e.g. "68%"
 */
export function formatPercent(value) {
  return `${Math.round(value)}%`;
}

/**
 * Format days remaining until a deadline.
 * @param {string|Date} deadline
 * @param {'bm'|'en'} lang
 * @returns {string}
 */
export function formatDaysRemaining(deadline, lang = 'bm') {
  const end = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (lang === 'en') {
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  }
  if (diffDays < 0) return 'Tamat tempoh';
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Esok';
  return `${diffDays} hari lagi`;
}
