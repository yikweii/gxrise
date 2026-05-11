// AI Engine — Rule-based transaction classifier and spending insights

const MERCHANT_RULES = [
  // Food & Drink
  {
    category: 'Food & Drink',
    keywords: [
      'grabfood', 'foodpanda', 'mcdonalds', "mcdonald's", 'kfc', 'tealive',
      'zus coffee', 'mamak', 'restaurant', 'warung', 'kedai makan', 'restoran',
      'pizza', 'burger', 'nasi', 'mie', 'subway', 'starbucks', 'oldtown',
      'secret recipe', 'kenny rogers', 'sushi', 'shabu',
    ],
  },
  // Transport
  {
    category: 'Transport',
    keywords: [
      'grab', 'rapidkl', 'mrt', 'lrt', 'monorel', 'komuter', 'touch n go',
      'tng', 'plus highway', 'petronas', 'shell', 'petrol', 'parking',
      'myrapid', 'bas', 'teksi',
    ],
  },
  // Shopping
  {
    category: 'Shopping',
    keywords: [
      'shopee', 'lazada', 'zalora', 'parkson', 'aeon', 'mydin', 'giant',
      'tesco', 'ikea', 'cotton on', 'uniqlo', 'h&m', 'zara', 'padini',
      'brands outlet', 'popular bookstore',
    ],
  },
  // BNPL
  {
    category: 'BNPL',
    keywords: [
      'atome', 'split', 'shopee paylater', 'hoolah', 'grab paylater',
      'instalment', 'bayaran ansuran', 'pay later',
    ],
  },
  // Subscription
  {
    category: 'Subscription',
    keywords: [
      'netflix', 'spotify', 'youtube premium', 'apple music', 'disney+',
      'hotstar', 'viu', 'iflix', 'amazon prime', 'deezer', 'tidal',
    ],
  },
  // Utilities
  {
    category: 'Utilities',
    keywords: [
      'celcom', 'maxis', 'digi', 'unifi', 'time dotcom', 'tnb', 'syabas',
      'indah water', 'astro', 'yes 4g', 'u mobile', 'postpaid', 'prepaid',
    ],
  },
  // Education
  {
    category: 'Education',
    keywords: [
      'ptptn', 'university', 'universiti', 'college', 'kolej', 'tuition',
      'buku', 'bookstore', 'library', 'kursus', 'udemy', 'coursera',
    ],
  },
  // Health
  {
    category: 'Health',
    keywords: [
      'farmasi', 'pharmacy', 'guardian', 'watson', 'klinik', 'clinic',
      'hospital', 'dentist', 'optometrist', 'gym', 'fitness',
    ],
  },
  // Entertainment
  {
    category: 'Entertainment',
    keywords: [
      'tgv', 'gsc', 'mbo', 'cinema', 'wayang', 'bowling', 'karaoke',
      'escape', 'theme park', 'arcade', 'games',
    ],
  },
  // Income
  {
    category: 'Income',
    keywords: [
      'gaji', 'salary', 'ptptn credit', 'sspn credit', 'upah', 'bonus',
      'allowance', 'elaun', 'part-time', 'part time', 'income',
    ],
  },
];

/**
 * Classifies a transaction based on merchant name.
 * @param {string} merchant
 * @param {number} amount
 * @returns {string} category
 */
export function classifyTransaction(merchant, amount) {
  const lowerMerchant = (merchant || '').toLowerCase();

  for (const rule of MERCHANT_RULES) {
    for (const keyword of rule.keywords) {
      if (lowerMerchant.includes(keyword.toLowerCase())) {
        return rule.category;
      }
    }
  }

  // Fallback by amount patterns
  if (amount >= 500) return 'Shopping';
  if (amount <= 5) return 'Transport';

  return 'Other';
}

/**
 * Aggregates spending by category.
 * @param {Array} transactions
 * @returns {Object} category → total amount
 */
export function aggregateByCategory(transactions) {
  const result = {};
  transactions
    .filter((t) => t.type === 'debit')
    .forEach((t) => {
      const cat = t.category || classifyTransaction(t.merchant, t.amount);
      result[cat] = (result[cat] || 0) + t.amount;
    });
  return result;
}

/**
 * Gets spending insights from a transaction list.
 * @param {Array} transactions - last 30 days
 * @returns {Object}
 */
export function getSpendingInsights(transactions) {
  const debits = transactions.filter((t) => t.type === 'debit');
  const credits = transactions.filter((t) => t.type === 'credit');

  const totalDebit = debits.reduce((sum, t) => sum + t.amount, 0);
  const totalCredit = credits.reduce((sum, t) => sum + t.amount, 0);

  const byCategory = aggregateByCategory(transactions);
  const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCategory = categoryEntries[0]?.[0] || 'Other';
  const topAmount = categoryEntries[0]?.[1] || 0;

  // Weekly budget (approximate: monthly income / 4)
  const weeklyBudget = 262.50;
  const recentWeekSpend = debits
    .filter((t) => {
      const txDate = new Date(t.date);
      const weekAgo = new Date('2026-05-08');
      weekAgo.setDate(weekAgo.getDate() - 7);
      return txDate >= weekAgo;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const weeklyBudgetStatus =
    recentWeekSpend > weeklyBudget * 1.2
      ? 'over'
      : recentWeekSpend > weeklyBudget
      ? 'at_limit'
      : 'under';

  return {
    topCategory,
    topAmount: Math.round(topAmount * 100) / 100,
    weeklyBudgetStatus,
    weeklySpend: Math.round(recentWeekSpend * 100) / 100,
    weeklyBudget,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    categoryBreakdown: byCategory,
    categoryRanked: categoryEntries,
  };
}

/**
 * Detects weekend vs weekday spending pattern.
 * @param {Array} transactions
 * @returns {Object}
 */
export function getWeekendPattern(transactions) {
  const debits = transactions.filter((t) => t.type === 'debit');

  let weekendTotal = 0;
  let weekendCount = 0;
  let weekdayTotal = 0;
  let weekdayCount = 0;

  debits.forEach((t) => {
    const dayOfWeek = new Date(t.date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (isWeekend) {
      weekendTotal += t.amount;
      weekendCount++;
    } else {
      weekdayTotal += t.amount;
      weekdayCount++;
    }
  });

  const weekendAvg = weekendCount > 0 ? weekendTotal / weekendCount : 0;
  const weekdayAvg = weekdayCount > 0 ? weekdayTotal / weekdayCount : 0;
  const percent =
    weekdayAvg > 0 ? Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100) : 0;

  return {
    weekendAvg: Math.round(weekendAvg * 100) / 100,
    weekdayAvg: Math.round(weekdayAvg * 100) / 100,
    percentMore: percent,
  };
}
