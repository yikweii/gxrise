import { COLORS } from '../constants/colours';

/**
 * Detects and analyses subscriptions from transaction history.
 * @param {Array} transactions
 * @returns {Array} sorted by risk score descending
 */
export function detectSubscriptions(transactions) {
  const subscriptionKeywords = [
    'netflix', 'spotify', 'youtube premium', 'apple music', 'disney+',
    'hotstar', 'viu', 'iflix', 'amazon prime', 'deezer', 'tidal',
    'adobe', 'microsoft 365', 'google one', 'dropbox', 'canva pro',
  ];

  const subscriptionMap = {};

  transactions.forEach((t) => {
    if (t.type !== 'debit') return;
    const lowerMerchant = t.merchant.toLowerCase();
    const matchedKeyword = subscriptionKeywords.find((kw) => lowerMerchant.includes(kw));
    if (!matchedKeyword) return;

    const key = matchedKeyword;
    if (!subscriptionMap[key]) {
      subscriptionMap[key] = {
        service: t.merchant,
        amount: t.amount,
        transactions: [],
        lastUsedDate: t.date,
      };
    }
    subscriptionMap[key].transactions.push(t);
    if (new Date(t.date) > new Date(subscriptionMap[key].lastUsedDate)) {
      subscriptionMap[key].lastUsedDate = t.date;
    }
  });

  const today = new Date('2026-05-08');

  return Object.values(subscriptionMap)
    .map((sub) => {
      const daysIdle = Math.floor(
        (today - new Date(sub.lastUsedDate)) / (1000 * 60 * 60 * 24)
      );
      const riskScore = calculateRisk(daysIdle, sub.amount);
      const riskInfo = getRiskLevel(riskScore);
      return {
        ...sub,
        daysIdle,
        riskScore,
        ...riskInfo,
        annual_cost: sub.amount * 12,
        billingCycle: 'monthly',
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Calculates a risk score (0-100) for an idle subscription.
 * @param {number} daysIdle
 * @param {number} monthlyCost
 * @returns {number}
 */
export function calculateRisk(daysIdle, monthlyCost) {
  // Base risk from idle days (0-70 points)
  const idleScore = Math.min(70, (daysIdle / 30) * 35);

  // Cost component (0-30 points) — higher cost = higher risk
  const costScore = Math.min(30, (monthlyCost / 25) * 15);

  return Math.round(idleScore + costScore);
}

/**
 * Returns risk level info based on score.
 * @param {number} score - 0 to 100
 * @returns {{ level: string, colour: string, emoji: string }}
 */
export function getRiskLevel(score) {
  if (score >= 70) {
    return { level: 'HIGH', colour: COLORS.danger, emoji: '🔴' };
  }
  if (score >= 40) {
    return { level: 'MEDIUM', colour: COLORS.warning, emoji: '🟡' };
  }
  return { level: 'LOW', colour: COLORS.success, emoji: '🟢' };
}

/**
 * Calculates potential savings from high-risk subscriptions.
 * @param {Array} subscriptions
 * @returns {{ monthly: number, annual: number, highRiskCount: number }}
 */
export function getPotentialSavings(subscriptions) {
  const highRisk = subscriptions.filter((s) => s.riskLevel === 'HIGH' || s.level === 'HIGH');
  const monthly = highRisk.reduce((sum, s) => sum + s.amount, 0);
  const annual = monthly * 12;
  return {
    monthly: Math.round(monthly * 100) / 100,
    annual: Math.round(annual * 100) / 100,
    highRiskCount: highRisk.length,
  };
}

/**
 * Returns cancel instructions for a given service.
 * @param {string} service
 * @returns {Array<string>} steps
 */
export function getCancelInstructions(service) {
  const instructions = {
    Netflix: [
      'Pergi ke netflix.com dan log masuk',
      'Klik Akaun → Batalkan Keahlian',
      'Ikuti arahan untuk mengesahkan pembatalan',
    ],
    'Spotify Malaysia': [
      'Pergi ke spotify.com/account',
      'Klik Tukar atau Batalkan Plan',
      'Pilih Batalkan Premium dan sahkan',
    ],
    'Apple Music': [
      'Buka Tetapan iPhone → [Nama Kamu] → Langganan',
      'Pilih Apple Music',
      'Ketik Batalkan Langganan dan sahkan',
    ],
    'YouTube Premium': [
      'Pergi ke youtube.com/paid_memberships',
      'Klik Urus di sebelah YouTube Premium',
      'Pilih Batalkan Keahlian dan sahkan',
    ],
    'Disney+ Hotstar': [
      'Pergi ke hotstar.com/my/account',
      'Klik Langganan saya',
      'Pilih Batalkan Pelan dan sahkan',
    ],
  };

  return (
    instructions[service] || [
      'Log masuk ke laman web rasmi perkhidmatan',
      'Pergi ke bahagian Akaun atau Tetapan',
      'Cari pilihan Batalkan Langganan dan ikut arahan',
    ]
  );
}
