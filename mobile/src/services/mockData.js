// GX Rise Mock Data — Full personas for Azri (Student) and Siti (Fresh Grad)

// Helper to create a date string relative to today
function daysAgo(n) {
  const d = new Date('2026-05-08');
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function daysFromNow(n) {
  const d = new Date('2026-05-08');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ─── AZRI TRANSACTIONS (90 days) ────────────────────────────────────────────
const azriTransactions = [
  // INCOME
  { id: 'txn_001', date: daysAgo(0), merchant: 'Duit Poket dari Ibu & Ayah', amount: 500, type: 'credit', category: 'Income' },
  { id: 'txn_002', date: daysAgo(0), merchant: 'Part-time Income - Kedai Buku Fajar', amount: 400, type: 'credit', category: 'Income' },
  { id: 'txn_003', date: daysAgo(30), merchant: 'Duit Poket dari Ibu & Ayah', amount: 500, type: 'credit', category: 'Income' },
  { id: 'txn_004', date: daysAgo(30), merchant: 'Part-time Income - Kedai Buku Fajar', amount: 400, type: 'credit', category: 'Income' },
  { id: 'txn_005', date: daysAgo(60), merchant: 'Duit Poket dari Ibu & Ayah', amount: 500, type: 'credit', category: 'Income' },
  { id: 'txn_006', date: daysAgo(60), merchant: 'Part-time Income - Kedai Buku Fajar', amount: 400, type: 'credit', category: 'Income' },

  // FOOD — Month 1 (recent 30 days)
  { id: 'txn_010', date: daysAgo(1), merchant: 'GrabFood', amount: 18.50, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_011', date: daysAgo(2), merchant: 'Tealive SS15', amount: 9.90, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_012', date: daysAgo(3), merchant: 'Mamak Corner SS2', amount: 12.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_013', date: daysAgo(4), merchant: 'McDonald\'s Nilai', amount: 15.80, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_014', date: daysAgo(5), merchant: 'ZUS Coffee PJ', amount: 13.50, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_015', date: daysAgo(6), merchant: 'foodpanda', amount: 22.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_016', date: daysAgo(7), merchant: 'KFC IOI City', amount: 19.50, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_017', date: daysAgo(8), merchant: 'GrabFood', amount: 16.90, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_018', date: daysAgo(9), merchant: 'Tealive SS15', amount: 8.90, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_019', date: daysAgo(10), merchant: 'Mamak Corner SS2', amount: 11.50, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_020', date: daysAgo(11), merchant: 'foodpanda', amount: 24.50, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_021', date: daysAgo(12), merchant: 'ZUS Coffee PJ', amount: 14.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_022', date: daysAgo(13), merchant: 'McDonald\'s Nilai', amount: 17.20, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_023', date: daysAgo(14), merchant: 'GrabFood', amount: 21.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_024', date: daysAgo(15), merchant: 'Mamak Corner SS2', amount: 10.50, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_025', date: daysAgo(16), merchant: 'KFC IOI City', amount: 18.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_026', date: daysAgo(17), merchant: 'foodpanda', amount: 25.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_027', date: daysAgo(18), merchant: 'Tealive SS15', amount: 9.50, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_028', date: daysAgo(19), merchant: 'GrabFood', amount: 19.80, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_029', date: daysAgo(20), merchant: 'ZUS Coffee PJ', amount: 12.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_030', date: daysAgo(21), merchant: 'Mamak Corner SS2', amount: 13.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_031', date: daysAgo(22), merchant: 'McDonald\'s Nilai', amount: 16.50, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_032', date: daysAgo(23), merchant: 'foodpanda', amount: 20.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_033', date: daysAgo(24), merchant: 'KFC IOI City', amount: 22.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_034', date: daysAgo(25), merchant: 'GrabFood', amount: 17.50, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_035', date: daysAgo(26), merchant: 'Tealive SS15', amount: 11.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_036', date: daysAgo(27), merchant: 'Mamak Corner SS2', amount: 9.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_037', date: daysAgo(28), merchant: 'foodpanda', amount: 23.50, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_038', date: daysAgo(29), merchant: 'ZUS Coffee PJ', amount: 13.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_039', date: daysAgo(30), merchant: 'McDonald\'s Nilai', amount: 14.50, type: 'debit', category: 'Food & Drink' },

  // FOOD — Month 2 (31-60 days ago)
  { id: 'txn_040', date: daysAgo(32), merchant: 'GrabFood', amount: 20.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_041', date: daysAgo(35), merchant: 'foodpanda', amount: 26.50, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_042', date: daysAgo(38), merchant: 'KFC IOI City', amount: 21.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_043', date: daysAgo(41), merchant: 'Mamak Corner SS2', amount: 14.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_044', date: daysAgo(44), merchant: 'GrabFood', amount: 19.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_045', date: daysAgo(47), merchant: 'Tealive SS15', amount: 10.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_046', date: daysAgo(50), merchant: 'McDonald\'s Nilai', amount: 18.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_047', date: daysAgo(53), merchant: 'ZUS Coffee PJ', amount: 15.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_048', date: daysAgo(56), merchant: 'foodpanda', amount: 28.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_049', date: daysAgo(59), merchant: 'Mamak Corner SS2', amount: 11.00, type: 'debit', category: 'Food & Drink' },

  // FOOD — Month 3 (61-90 days ago)
  { id: 'txn_050', date: daysAgo(62), merchant: 'GrabFood', amount: 22.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_051', date: daysAgo(65), merchant: 'KFC IOI City', amount: 20.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_052', date: daysAgo(68), merchant: 'foodpanda', amount: 30.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_053', date: daysAgo(71), merchant: 'McDonald\'s Nilai', amount: 19.50, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_054', date: daysAgo(74), merchant: 'Tealive SS15', amount: 12.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_055', date: daysAgo(77), merchant: 'GrabFood', amount: 24.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_056', date: daysAgo(80), merchant: 'ZUS Coffee PJ', amount: 16.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_057', date: daysAgo(83), merchant: 'Mamak Corner SS2', amount: 15.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_058', date: daysAgo(86), merchant: 'foodpanda', amount: 29.00, type: 'debit', category: 'Food & Drink' },
  { id: 'txn_059', date: daysAgo(89), merchant: 'KFC IOI City', amount: 23.00, type: 'debit', category: 'Food & Drink' },

  // TRANSPORT
  { id: 'txn_060', date: daysAgo(1), merchant: 'Grab', amount: 8.50, type: 'debit', category: 'Transport' },
  { id: 'txn_061', date: daysAgo(3), merchant: 'RapidKL', amount: 3.20, type: 'debit', category: 'Transport' },
  { id: 'txn_062', date: daysAgo(5), merchant: 'Touch n Go Toll', amount: 12.40, type: 'debit', category: 'Transport' },
  { id: 'txn_063', date: daysAgo(7), merchant: 'MRT Rapid KL', amount: 2.80, type: 'debit', category: 'Transport' },
  { id: 'txn_064', date: daysAgo(9), merchant: 'Grab', amount: 11.00, type: 'debit', category: 'Transport' },
  { id: 'txn_065', date: daysAgo(12), merchant: 'RapidKL', amount: 3.20, type: 'debit', category: 'Transport' },
  { id: 'txn_066', date: daysAgo(15), merchant: 'Touch n Go Toll', amount: 6.20, type: 'debit', category: 'Transport' },
  { id: 'txn_067', date: daysAgo(18), merchant: 'Grab', amount: 9.50, type: 'debit', category: 'Transport' },
  { id: 'txn_068', date: daysAgo(21), merchant: 'MRT Rapid KL', amount: 2.80, type: 'debit', category: 'Transport' },
  { id: 'txn_069', date: daysAgo(25), merchant: 'Touch n Go Toll', amount: 12.40, type: 'debit', category: 'Transport' },
  { id: 'txn_070', date: daysAgo(40), merchant: 'Grab', amount: 13.00, type: 'debit', category: 'Transport' },
  { id: 'txn_071', date: daysAgo(55), merchant: 'Touch n Go Toll', amount: 18.60, type: 'debit', category: 'Transport' },
  { id: 'txn_072', date: daysAgo(70), merchant: 'Grab', amount: 10.00, type: 'debit', category: 'Transport' },
  { id: 'txn_073', date: daysAgo(85), merchant: 'RapidKL', amount: 6.40, type: 'debit', category: 'Transport' },

  // SHOPPING
  { id: 'txn_080', date: daysAgo(5), merchant: 'Shopee', amount: 45.00, type: 'debit', category: 'Shopping' },
  { id: 'txn_081', date: daysAgo(14), merchant: 'Lazada', amount: 89.00, type: 'debit', category: 'Shopping' },
  { id: 'txn_082', date: daysAgo(28), merchant: 'Zalora', amount: 135.00, type: 'debit', category: 'Shopping' },
  { id: 'txn_083', date: daysAgo(45), merchant: 'Shopee', amount: 32.50, type: 'debit', category: 'Shopping' },
  { id: 'txn_084', date: daysAgo(62), merchant: 'Lazada', amount: 67.00, type: 'debit', category: 'Shopping' },
  { id: 'txn_085', date: daysAgo(75), merchant: 'Shopee', amount: 55.00, type: 'debit', category: 'Shopping' },

  // BNPL
  { id: 'txn_090', date: daysAgo(15), merchant: 'Atome instalment 1/3', amount: 89.00, type: 'debit', category: 'BNPL' },
  { id: 'txn_091', date: daysAgo(10), merchant: 'Split payment Zalora', amount: 45.00, type: 'debit', category: 'BNPL' },
  { id: 'txn_092', date: daysAgo(5), merchant: 'Shopee PayLater', amount: 120.00, type: 'debit', category: 'BNPL' },
  { id: 'txn_093', date: daysAgo(45), merchant: 'Atome instalment 2/3', amount: 89.00, type: 'debit', category: 'BNPL' },
  { id: 'txn_094', date: daysAgo(75), merchant: 'Atome instalment 3/3', amount: 89.00, type: 'debit', category: 'BNPL' },

  // SUBSCRIPTIONS
  { id: 'txn_100', date: daysAgo(8), merchant: 'Netflix', amount: 17.00, type: 'debit', category: 'Subscription' },
  { id: 'txn_101', date: daysAgo(8), merchant: 'Spotify Malaysia', amount: 15.90, type: 'debit', category: 'Subscription' },
  { id: 'txn_102', date: daysAgo(8), merchant: 'YouTube Premium', amount: 16.90, type: 'debit', category: 'Subscription' },
  { id: 'txn_103', date: daysAgo(8), merchant: 'Apple Music', amount: 17.00, type: 'debit', category: 'Subscription' },
  { id: 'txn_104', date: daysAgo(8), merchant: 'Disney+ Hotstar', amount: 22.90, type: 'debit', category: 'Subscription' },
  { id: 'txn_105', date: daysAgo(38), merchant: 'Netflix', amount: 17.00, type: 'debit', category: 'Subscription' },
  { id: 'txn_106', date: daysAgo(38), merchant: 'Spotify Malaysia', amount: 15.90, type: 'debit', category: 'Subscription' },
  { id: 'txn_107', date: daysAgo(38), merchant: 'YouTube Premium', amount: 16.90, type: 'debit', category: 'Subscription' },
  { id: 'txn_108', date: daysAgo(38), merchant: 'Apple Music', amount: 17.00, type: 'debit', category: 'Subscription' },
  { id: 'txn_109', date: daysAgo(38), merchant: 'Disney+ Hotstar', amount: 22.90, type: 'debit', category: 'Subscription' },
  { id: 'txn_110', date: daysAgo(68), merchant: 'Netflix', amount: 17.00, type: 'debit', category: 'Subscription' },
  { id: 'txn_111', date: daysAgo(68), merchant: 'Spotify Malaysia', amount: 15.90, type: 'debit', category: 'Subscription' },
  { id: 'txn_112', date: daysAgo(68), merchant: 'YouTube Premium', amount: 16.90, type: 'debit', category: 'Subscription' },
  { id: 'txn_113', date: daysAgo(68), merchant: 'Apple Music', amount: 17.00, type: 'debit', category: 'Subscription' },
  { id: 'txn_114', date: daysAgo(68), merchant: 'Disney+ Hotstar', amount: 22.90, type: 'debit', category: 'Subscription' },

  // UTILITIES
  { id: 'txn_120', date: daysAgo(10), merchant: 'Celcom Postpaid', amount: 68.00, type: 'debit', category: 'Utilities' },
  { id: 'txn_121', date: daysAgo(10), merchant: 'Unifi Monthly', amount: 99.00, type: 'debit', category: 'Utilities' },
  { id: 'txn_122', date: daysAgo(40), merchant: 'Celcom Postpaid', amount: 68.00, type: 'debit', category: 'Utilities' },
  { id: 'txn_123', date: daysAgo(40), merchant: 'Unifi Monthly', amount: 99.00, type: 'debit', category: 'Utilities' },
  { id: 'txn_124', date: daysAgo(70), merchant: 'Celcom Postpaid', amount: 68.00, type: 'debit', category: 'Utilities' },
  { id: 'txn_125', date: daysAgo(70), merchant: 'Unifi Monthly', amount: 99.00, type: 'debit', category: 'Utilities' },
];

// ─── SITI TRANSACTIONS (subset) ─────────────────────────────────────────────
const sitiTransactions = [
  { id: 'siti_001', date: daysAgo(1), merchant: 'Gaji - Syarikat XYZ Sdn Bhd', amount: 2800, type: 'credit', category: 'Income' },
  { id: 'siti_002', date: daysAgo(31), merchant: 'Gaji - Syarikat XYZ Sdn Bhd', amount: 2800, type: 'credit', category: 'Income' },
  { id: 'siti_003', date: daysAgo(1), merchant: 'GrabFood', amount: 25.50, type: 'debit', category: 'Food & Drink' },
  { id: 'siti_004', date: daysAgo(2), merchant: 'McDonald\'s Nilai', amount: 19.80, type: 'debit', category: 'Food & Drink' },
  { id: 'siti_005', date: daysAgo(3), merchant: 'Tealive SS15', amount: 12.00, type: 'debit', category: 'Food & Drink' },
  { id: 'siti_006', date: daysAgo(4), merchant: 'foodpanda', amount: 32.00, type: 'debit', category: 'Food & Drink' },
  { id: 'siti_007', date: daysAgo(5), merchant: 'ZUS Coffee PJ', amount: 15.00, type: 'debit', category: 'Food & Drink' },
  { id: 'siti_008', date: daysAgo(6), merchant: 'KFC IOI City', amount: 22.50, type: 'debit', category: 'Food & Drink' },
  { id: 'siti_009', date: daysAgo(7), merchant: 'Mamak Corner SS2', amount: 14.00, type: 'debit', category: 'Food & Drink' },
  { id: 'siti_010', date: daysAgo(8), merchant: 'GrabFood', amount: 28.00, type: 'debit', category: 'Food & Drink' },
  { id: 'siti_011', date: daysAgo(3), merchant: 'Grab', amount: 12.00, type: 'debit', category: 'Transport' },
  { id: 'siti_012', date: daysAgo(7), merchant: 'Touch n Go Toll', amount: 15.80, type: 'debit', category: 'Transport' },
  { id: 'siti_013', date: daysAgo(10), merchant: 'Grab', amount: 14.50, type: 'debit', category: 'Transport' },
  { id: 'siti_014', date: daysAgo(5), merchant: 'Shopee', amount: 78.00, type: 'debit', category: 'Shopping' },
  { id: 'siti_015', date: daysAgo(18), merchant: 'Zalora', amount: 156.00, type: 'debit', category: 'Shopping' },
  { id: 'siti_016', date: daysAgo(7), merchant: 'Atome instalment 1/3', amount: 120.00, type: 'debit', category: 'BNPL' },
  { id: 'siti_017', date: daysAgo(8), merchant: 'Netflix', amount: 17.00, type: 'debit', category: 'Subscription' },
  { id: 'siti_018', date: daysAgo(8), merchant: 'Spotify Malaysia', amount: 15.90, type: 'debit', category: 'Subscription' },
  { id: 'siti_019', date: daysAgo(8), merchant: 'Apple Music', amount: 17.00, type: 'debit', category: 'Subscription' },
  { id: 'siti_020', date: daysAgo(10), merchant: 'Celcom Postpaid', amount: 88.00, type: 'debit', category: 'Utilities' },
  { id: 'siti_021', date: daysAgo(10), merchant: 'Unifi Monthly', amount: 99.00, type: 'debit', category: 'Utilities' },
  { id: 'siti_022', date: daysAgo(15), merchant: 'GrabFood', amount: 22.00, type: 'debit', category: 'Food & Drink' },
  { id: 'siti_023', date: daysAgo(16), merchant: 'foodpanda', amount: 35.00, type: 'debit', category: 'Food & Drink' },
  { id: 'siti_024', date: daysAgo(20), merchant: 'Lazada', amount: 245.00, type: 'debit', category: 'Shopping' },
  { id: 'siti_025', date: daysAgo(25), merchant: 'McDonald\'s Nilai', amount: 18.50, type: 'debit', category: 'Food & Drink' },
];

// ─── AZRI BNPL ───────────────────────────────────────────────────────────────
const azriBNPL = [
  {
    id: 'bnpl_001',
    provider: 'Atome',
    merchant: 'Lazada - Headphones',
    total: 267.00,
    outstanding: 89.00,
    instalments: 3,
    paid: 2,
    nextPayment: daysFromNow(7),
    dueDate: '15 Mei 2026',
    status: 'active',
    overdue: false,
  },
  {
    id: 'bnpl_002',
    provider: 'Split',
    merchant: 'Zalora - Kasut Sukan',
    total: 135.00,
    outstanding: 45.00,
    instalments: 3,
    paid: 2,
    nextPayment: daysFromNow(12),
    dueDate: '20 Mei 2026',
    status: 'active',
    overdue: false,
  },
  {
    id: 'bnpl_003',
    provider: 'Shopee PayLater',
    merchant: 'Shopee - Barang Dapur',
    total: 120.00,
    outstanding: 120.00,
    instalments: 1,
    paid: 0,
    nextPayment: daysFromNow(20),
    dueDate: '28 Mei 2026',
    status: 'active',
    overdue: false,
  },
];

const sitiBNPL = [
  {
    id: 'siti_bnpl_001',
    provider: 'Atome',
    merchant: 'Zalora - Baju Kerja',
    total: 360.00,
    outstanding: 120.00,
    instalments: 3,
    paid: 2,
    nextPayment: daysFromNow(17),
    dueDate: '25 Mei 2026',
    status: 'active',
    overdue: false,
  },
];

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────
const azriSubscriptions = [
  {
    id: 'sub_001',
    service: 'Netflix',
    amount: 17.00,
    billingCycle: 'monthly',
    daysIdle: 47,
    lastUsed: daysAgo(47),
    riskScore: 88,
    riskLevel: 'HIGH',
    annual_cost: 204.00,
    category: 'Entertainment',
    cancelUrl: 'https://netflix.com/cancelplan',
  },
  {
    id: 'sub_002',
    service: 'Apple Music',
    amount: 17.00,
    billingCycle: 'monthly',
    daysIdle: 23,
    lastUsed: daysAgo(23),
    riskScore: 72,
    riskLevel: 'HIGH',
    annual_cost: 204.00,
    category: 'Music',
    cancelUrl: 'https://appleid.apple.com/account/manage',
  },
  {
    id: 'sub_003',
    service: 'YouTube Premium',
    amount: 16.90,
    billingCycle: 'monthly',
    daysIdle: 8,
    lastUsed: daysAgo(8),
    riskScore: 45,
    riskLevel: 'MEDIUM',
    annual_cost: 202.80,
    category: 'Entertainment',
    cancelUrl: 'https://youtube.com/paid_memberships',
  },
  {
    id: 'sub_004',
    service: 'Spotify Malaysia',
    amount: 15.90,
    billingCycle: 'monthly',
    daysIdle: 0,
    lastUsed: daysAgo(0),
    riskScore: 10,
    riskLevel: 'LOW',
    annual_cost: 190.80,
    category: 'Music',
    cancelUrl: 'https://spotify.com/account/subscription',
  },
  {
    id: 'sub_005',
    service: 'Disney+ Hotstar',
    amount: 22.90,
    billingCycle: 'monthly',
    daysIdle: 3,
    lastUsed: daysAgo(3),
    riskScore: 18,
    riskLevel: 'LOW',
    annual_cost: 274.80,
    category: 'Entertainment',
    cancelUrl: 'https://hotstar.com/my/account',
  },
];

const sitiSubscriptions = [
  {
    id: 'siti_sub_001',
    service: 'Apple Music',
    amount: 17.00,
    billingCycle: 'monthly',
    daysIdle: 31,
    lastUsed: daysAgo(31),
    riskScore: 80,
    riskLevel: 'HIGH',
    annual_cost: 204.00,
    category: 'Music',
    cancelUrl: 'https://appleid.apple.com/account/manage',
  },
  {
    id: 'siti_sub_002',
    service: 'Netflix',
    amount: 17.00,
    billingCycle: 'monthly',
    daysIdle: 2,
    lastUsed: daysAgo(2),
    riskScore: 15,
    riskLevel: 'LOW',
    annual_cost: 204.00,
    category: 'Entertainment',
    cancelUrl: 'https://netflix.com/cancelplan',
  },
  {
    id: 'siti_sub_003',
    service: 'Spotify Malaysia',
    amount: 15.90,
    billingCycle: 'monthly',
    daysIdle: 1,
    lastUsed: daysAgo(1),
    riskScore: 8,
    riskLevel: 'LOW',
    annual_cost: 190.80,
    category: 'Music',
    cancelUrl: 'https://spotify.com/account/subscription',
  },
];

// ─── POCKET WITH KAWAN ───────────────────────────────────────────────────────

const pocketWithKawan = {
  id: 'pocket_001',
  name: 'Trip Langkawi 2026',
  emoji: '🌴',
  goal: 2000,
  current: 1240,
  deadline: '2026-08-30',
  members: [
    { id: 'm1', name: 'Azri', initials: 'AZ', contribution: 360, colour: '#002B5C' },
    { id: 'm2', name: 'Siti', initials: 'ST', contribution: 320, colour: '#00B4D8' },
    { id: 'm3', name: 'Hafiz', initials: 'HF', contribution: 310, colour: '#FFB703' },
    { id: 'm4', name: 'Nur', initials: 'NR', contribution: 250, colour: '#2DC653' },
  ],
  recentActivity: [
    { id: 'act_001', member: 'Azri', action: 'Deposit', amount: 50, date: daysAgo(1) },
    { id: 'act_002', member: 'Siti', action: 'Deposit', amount: 100, date: daysAgo(3) },
    { id: 'act_003', member: 'Hafiz', action: 'Deposit', amount: 80, date: daysAgo(5) },
    { id: 'act_004', member: 'Nur', action: 'Deposit', amount: 50, date: daysAgo(7) },
    { id: 'act_005', member: 'Azri', action: 'Deposit', amount: 100, date: daysAgo(14) },
  ],
  milestones: [
    { percent: 25, reached: true, reachedDate: daysAgo(45) },
    { percent: 50, reached: true, reachedDate: daysAgo(20) },
    { percent: 62, reached: true, reachedDate: daysAgo(1) },
    { percent: 75, reached: false },
    { percent: 100, reached: false },
  ],
};

// ─── MAIN DATA OBJECTS ───────────────────────────────────────────────────────
export const azri = {
  id: 'user_azri',
  name: 'Azri',
  fullName: 'Muhammad Azri bin Rosli',
  avatar: 'AZ',
  avatarColour: '#002B5C',
  university: 'Universiti Malaya',
  income: 900,
  incomeBreakdown: [
    { source: 'Duit Poket (Ibu & Ayah)', amount: 500 },
    { source: 'Kerja Separuh Masa', amount: 400 },
  ],
  balance: 465.20,
  savings_balance: 234.00,
  monthly_savings: 45.00,
  non_essential: 420.00,
  bnpl_total: 254.00,
  available_cash: 465.20,
  weekly_spend: 262.00,
  healthScore: {
    current: 68,
    previous: 64,
    history: [45, 48, 44, 51, 55, 59, 63, 68],
    weekLabels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'],
  },
  ptptn: {
    originalLoan: 28660,
    outstandingBalance: 21400,
    monthlyPayment: 356.67,
    repaidAmount: 7260,
    repaidPercent: 34,
    yearsRemaining: 6,
    nextPaymentDate: '15 Jun 2026',
    daysUntilPayment: 38,
    status: 'on_track',
    autoPayEnabled: true,
    sspnBalance: 234.00,
    governmentMatchPercent: 10,
  },
  savings: {
    goals: [
      {
        id: 'goal_001',
        name: 'Dana Kecemasan',
        emoji: '🛡️',
        target: 1000,
        current: 500,
        type: 'flexible',
        interestRate: 2.00,
        autoSave: true,
        autoSaveAmount: 50,
        roundUp: true,
        deadline: null,
        colour: '#4B91E0',
      },
      {
        id: 'goal_002',
        name: 'Laptop Baru',
        emoji: '💻',
        target: 3000,
        current: 234,
        type: 'flexible',
        interestRate: 2.00,
        autoSave: false,
        autoSaveAmount: 0,
        roundUp: false,
        deadline: '2026-12-31',
        colour: '#00B4D8',
      },
      {
        id: 'goal_003',
        name: 'Simpanan Bonus 3 Bulan',
        emoji: '💎',
        target: 500,
        current: 500,
        type: 'bonus',
        interestRate: 3.55,
        tenure: 3,
        depositDate: daysAgo(20),
        lockedUntil: daysFromNow(70),
        autoSave: false,
        autoSaveAmount: 0,
        roundUp: false,
        deadline: null,
        colour: '#9C6FFF',
      },
    ],
  },
  transactions: azriTransactions,
  bnpl: azriBNPL,
  subscriptions: azriSubscriptions,
  pocket: pocketWithKawan,
  streak: 6,
  weeklyDigest: {
    week: 'Minggu 18, 2026',
    scoreDelta: 4,
    topCategory: 'Makanan & Minuman',
    topCategoryAmount: 67.00,
    savedThisWeek: 45.00,
    streakDays: 5,
    text: 'Minggu ini, skor kamu naik 4 mata — bagus! Makanan penghantaran ambil RM67, sedikit tinggi. Kamu berjaya simpan RM45 dan streak dah 5 hari. Tips minggu depan: cuba masak sekali dan simpan RM20 terus ke PTPTN Pocket. Kamu dah RM200 dari target!',
  },
};

export const siti = {
  id: 'user_siti',
  name: 'Siti',
  fullName: 'Siti Nabilah binti Ahmad',
  avatar: 'SN',
  avatarColour: '#00B4D8',
  employer: 'Syarikat XYZ Sdn Bhd',
  income: 2800,
  incomeBreakdown: [
    { source: 'Gaji Bulanan', amount: 2800 },
  ],
  balance: 1120.50,
  savings_balance: 680.00,
  monthly_savings: 280.00,
  non_essential: 840.00,
  bnpl_total: 120.00,
  available_cash: 1120.50,
  weekly_spend: 380.00,
  healthScore: {
    current: 74,
    previous: 52,
    history: [52, 55, 58, 61, 65, 68, 71, 74],
    weekLabels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'],
  },
  ptptn: null,
  savings: {
    goals: [
      {
        id: 'siti_goal_001',
        name: 'Dana Kecemasan',
        emoji: '🛡️',
        target: 5000,
        current: 680,
        type: 'flexible',
        interestRate: 2.00,
        autoSave: true,
        autoSaveAmount: 200,
        roundUp: true,
        deadline: null,
        colour: '#4B91E0',
      },
    ],
  },
  transactions: sitiTransactions,
  bnpl: sitiBNPL,
  subscriptions: sitiSubscriptions,
  pocket: pocketWithKawan,
  streak: 12,
  weeklyDigest: {
    week: 'Minggu 18, 2026',
    scoreDelta: 3,
    topCategory: 'Makanan & Minuman',
    topCategoryAmount: 155.00,
    savedThisWeek: 280.00,
    streakDays: 12,
    text: 'Hebat Siti! Skor kamu naik 3 mata minggu ini. Makanan ambil RM155, boleh kurangkan sikit. Simpanan minggu ini RM280 — teruskan! Streak 12 hari adalah rekod peribadi kamu. Bayaran Atome RM120 pada 25 Mei — pastikan ada baki cukup.',
  },
};

// ─── EXPORTED HELPER FUNCTIONS ───────────────────────────────────────────────

let _currentUser = azri;
let _azriGoals = azri.savings.goals.map((g) => ({ ...g }));
let _sitiGoals = siti.savings.goals.map((g) => ({ ...g }));
let _pockets = [{ ...pocketWithKawan }];

export function getCurrentUser() {
  return _currentUser;
}

export function setCurrentUser(userId) {
  _currentUser = userId === 'user_siti' ? siti : azri;
}

export function getRecentTransactions(days = 30) {
  // Use fixed base date matching daysAgo() so all months are always available
  const cutoff = new Date('2026-05-08');
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return _currentUser.transactions
    .filter((t) => t.date >= cutoffStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getSubscriptions() {
  return _currentUser.subscriptions.sort((a, b) => b.riskScore - a.riskScore);
}

export function getBNPL() {
  return _currentUser.bnpl;
}

export function getPocketWithKawan() {
  return pocketWithKawan;
}

export function getAllPockets() {
  return _pockets;
}

export function creditBalance(amount) {
  _currentUser = { ..._currentUser, balance: _currentUser.balance + amount };
}

export function debitBalance(amount) {
  _currentUser = { ..._currentUser, balance: Math.max(0, _currentUser.balance - amount) };
}

export function getGoals() {
  return _currentUser.id === 'user_azri' ? _azriGoals : _sitiGoals;
}

export function depositToGoal(goalId, amount) {
  const goals = _currentUser.id === 'user_azri' ? _azriGoals : _sitiGoals;
  const idx = goals.findIndex((g) => g.id === goalId);
  if (idx === -1) return;
  goals[idx] = { ...goals[idx], current: Math.min(goals[idx].target, goals[idx].current + amount) };
  debitBalance(amount);
}

export function getPockets() {
  return _pockets;
}

export function depositToPocket(pocketId, amount) {
  const idx = _pockets.findIndex((p) => p.id === pocketId);
  if (idx === -1) return;
  _pockets[idx] = { ..._pockets[idx], current: Math.min(_pockets[idx].goal, _pockets[idx].current + amount) };
  debitBalance(amount);
}

export function createGoal(name, target, emoji) {
  const newGoal = {
    id: `goal_${Date.now()}`,
    name,
    emoji: emoji || '🎯',
    target,
    current: 0,
    autoSave: false,
    autoSaveAmount: 0,
    roundUp: false,
    deadline: null,
    colour: '#7C5CF5',
  };
  if (_currentUser.id === 'user_azri') _azriGoals = [..._azriGoals, newGoal];
  else _sitiGoals = [..._sitiGoals, newGoal];
}

export function getSavingsGoals() {
  return getGoals();
}

export function getHealthScoreHistory() {
  return _currentUser.healthScore.history;
}

export function withdrawFromGoal(goalId, amount) {
  const goals = _currentUser.id === 'user_azri' ? _azriGoals : _sitiGoals;
  const idx = goals.findIndex((g) => g.id === goalId);
  if (idx === -1) return;
  goals[idx] = { ...goals[idx], current: Math.max(0, goals[idx].current - amount) };
  creditBalance(amount);
}

export function addTransaction(txn) {
  _currentUser = { ..._currentUser, transactions: [txn, ..._currentUser.transactions] };
}

export function deductFromPocket(pocketId, amount) {
  const idx = _pockets.findIndex((p) => p.id === pocketId);
  if (idx === -1) return;
  _pockets[idx] = { ..._pockets[idx], current: Math.max(0, _pockets[idx].current - amount) };
  creditBalance(amount);
}

export function createPocket(name, goal, invitedPhones) {
  const pocket = {
    id: `pocket_${Date.now()}`,
    name,
    emoji: '🎯',
    goal: parseFloat(goal) || 0,
    current: 0,
    deadline: null,
    members: (invitedPhones || []).map((phone, i) => ({
      id: `invited_${i}`,
      name: phone,
      initials: phone.slice(-3, -1),
      colour: ['#7C5CF5', '#00B4D8', '#FFB703', '#2DC653', '#E63946'][i % 5],
      contribution: 0,
    })),
    recentActivity: [],
    milestones: [
      { percent: 25, reached: false }, { percent: 50, reached: false },
      { percent: 75, reached: false }, { percent: 100, reached: false },
    ],
  };
  _pockets = [..._pockets, pocket];
  return pocket;
}
