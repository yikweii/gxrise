// Notification Parser — Parses bank SMS/push notifications into structured data

const NOTIFICATION_PATTERNS = [
  // GXBank debit
  {
    source: 'gxbank',
    pattern: /debit\s+rm\s*([\d,]+\.?\d*)\s+(?:at|@)?\s*([^.]+?)(?:\.|$)/i,
    type: 'debit',
    extract: (match) => ({
      amount: parseFloat(match[1].replace(',', '')),
      merchant: match[2].trim(),
    }),
  },
  // GXBank credit
  {
    source: 'gxbank',
    pattern: /credit\s+rm\s*([\d,]+\.?\d*)\s+(?:from)?\s*([^.]+?)(?:\.|$)/i,
    type: 'credit',
    extract: (match) => ({
      amount: parseFloat(match[1].replace(',', '')),
      merchant: match[2].trim(),
    }),
  },
  // Maybank2U debit
  {
    source: 'maybank',
    pattern: /rm([\d,]+\.?\d*)\s+(?:didebit|deducted)\s+(?:dari|from)\s+([^.]+?)(?:\.|$)/i,
    type: 'debit',
    extract: (match) => ({
      amount: parseFloat(match[1].replace(',', '')),
      merchant: match[2].trim(),
    }),
  },
  // Maybank credit
  {
    source: 'maybank',
    pattern: /rm([\d,]+\.?\d*)\s+(?:diterima|received)\s+(?:dari|from)\s+([^.]+?)(?:\.|$)/i,
    type: 'credit',
    extract: (match) => ({
      amount: parseFloat(match[1].replace(',', '')),
      merchant: match[2].trim(),
    }),
  },
  // Atome instalment reminder
  {
    source: 'atome',
    pattern: /payment\s+of\s+rm\s*([\d,]+\.?\d*)\s+(?:is\s+)?due/i,
    type: 'bnpl_reminder',
    extract: (match) => ({
      amount: parseFloat(match[1].replace(',', '')),
      merchant: 'Atome',
    }),
  },
  // Shopee PayLater
  {
    source: 'shopee',
    pattern: /paylater.*?rm\s*([\d,]+\.?\d*)/i,
    type: 'bnpl_reminder',
    extract: (match) => ({
      amount: parseFloat(match[1].replace(',', '')),
      merchant: 'Shopee PayLater',
    }),
  },
  // Touch n Go
  {
    source: 'tng',
    pattern: /rm\s*([\d,]+\.?\d*)\s+(?:tolled|deducted)\s+(?:at|at toll)?\s*([^.]+?)(?:\.|$)/i,
    type: 'debit',
    extract: (match) => ({
      amount: parseFloat(match[1].replace(',', '')),
      merchant: match[2] ? match[2].trim() : 'Touch n Go Toll',
    }),
  },
];

/**
 * Parses a notification text into a structured transaction object.
 * @param {string} text - notification body text
 * @param {string} source - notification source ('gxbank', 'maybank', 'atome', 'shopee', 'tng')
 * @returns {Object|null} parsed transaction or null if unparseable
 */
export function parseNotification(text, source) {
  if (!text || !source) return null;

  const lowerSource = source.toLowerCase();

  const relevantPatterns = NOTIFICATION_PATTERNS.filter(
    (p) => p.source === lowerSource || lowerSource.includes(p.source)
  );

  for (const patternDef of relevantPatterns) {
    const match = text.match(patternDef.pattern);
    if (match) {
      try {
        const extracted = patternDef.extract(match);
        return {
          merchant: extracted.merchant || source,
          amount: extracted.amount || 0,
          type: patternDef.type,
          category: getCategoryFromSource(source, patternDef.type),
          rawText: text,
          source,
          parsedAt: new Date().toISOString(),
        };
      } catch (e) {
        continue;
      }
    }
  }

  return null;
}

/**
 * Returns a category string based on notification source.
 * @param {string} source
 * @param {string} type
 * @returns {string}
 */
function getCategoryFromSource(source, type) {
  if (type === 'bnpl_reminder') return 'BNPL';
  if (type === 'credit') return 'Income';
  const lowerSource = source.toLowerCase();
  if (lowerSource.includes('tng') || lowerSource.includes('touch')) return 'Transport';
  if (lowerSource.includes('atome') || lowerSource.includes('shopee')) return 'BNPL';
  return 'Other';
}

/**
 * Returns a mock list of connected accounts with their sync status.
 * @returns {Array}
 */
export function getConnectedAccounts() {
  return [
    {
      id: 'acc_001',
      name: 'GXBank',
      type: 'bank',
      status: 'active',
      statusEmoji: '✅',
      statusLabel: 'Aktif',
      transactionCount: 23,
      lastSync: '2026-05-08T08:00:00Z',
      colour: '#002B5C',
    },
    {
      id: 'acc_002',
      name: 'Atome',
      type: 'bnpl',
      status: 'active',
      statusEmoji: '✅',
      statusLabel: 'Aktif',
      transactionCount: 3,
      lastSync: '2026-05-07T14:30:00Z',
      colour: '#FF3366',
    },
    {
      id: 'acc_003',
      name: 'Shopee PayLater',
      type: 'bnpl',
      status: 'active',
      statusEmoji: '✅',
      statusLabel: 'Aktif',
      transactionCount: 1,
      lastSync: '2026-05-06T10:15:00Z',
      colour: '#EE4D2D',
    },
    {
      id: 'acc_004',
      name: 'Maybank',
      type: 'bank',
      status: 'detected',
      statusEmoji: '🔗',
      statusLabel: 'Dikesan',
      transactionCount: 0,
      lastSync: null,
      colour: '#FFCC00',
    },
    {
      id: 'acc_005',
      name: "Touch 'n Go",
      type: 'ewallet',
      status: 'not_connected',
      statusEmoji: '⬜',
      statusLabel: 'Belum disambung',
      transactionCount: 0,
      lastSync: null,
      colour: '#00A0E9',
    },
  ];
}

/**
 * Returns sample notification texts for demo purposes.
 * @returns {Array}
 */
export function getSampleNotifications() {
  return [
    {
      source: 'gxbank',
      text: 'Debit RM 18.50 at GrabFood. Baki: RM 446.70',
    },
    {
      source: 'atome',
      text: 'Payment of RM 89.00 is due on 15 May 2026. Please ensure sufficient balance.',
    },
    {
      source: 'gxbank',
      text: 'Credit RM 650.00 from PTPTN SSPN. Baki: RM 465.20',
    },
    {
      source: 'shopee',
      text: 'PayLater reminder: RM 120.00 due 28 May 2026.',
    },
  ];
}
