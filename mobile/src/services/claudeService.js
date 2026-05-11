// Claude AI Service — Generates weekly financial digest using Anthropic API

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-ant-demo-placeholder-key';
const CLAUDE_MODEL = 'claude-haiku-4-5';
const API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Generates a weekly financial digest using Claude.
 * @param {Object} userData - user financial data object
 * @param {'bm'|'en'} lang - language for the digest
 * @returns {Promise<string>} digest text
 */
export async function generateWeeklyDigest(userData, lang = 'bm') {
  const {
    name = 'Azri',
    income = 1050,
    monthly_savings = 45,
    healthScore = { current: 68, history: [64, 68] },
    transactions = [],
    bnpl = [],
    subscriptions = [],
    streak = 6,
  } = userData;

  const scoreDelta = healthScore.current - (healthScore.history[healthScore.history.length - 2] || healthScore.current);

  const recentTxns = transactions
    .filter((t) => {
      const txDate = new Date(t.date);
      const weekAgo = new Date('2026-05-08');
      weekAgo.setDate(weekAgo.getDate() - 7);
      return txDate >= weekAgo && t.type === 'debit';
    })
    .slice(0, 10);

  const categoryTotals = {};
  recentTxns.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const totalBNPL = bnpl.reduce((s, b) => s + b.outstanding, 0);
  const highRiskSubs = subscriptions.filter((s) => s.riskLevel === 'HIGH' || s.level === 'HIGH');

  const sharedData = `
- Health score: ${healthScore.current}/100 (${scoreDelta >= 0 ? '+' : ''}${scoreDelta} from last week)
- Monthly income: RM ${income}
- Savings this week: RM ${monthly_savings}
- Logging streak: ${streak} days
- Top spending category: ${topCategory ? topCategory[0] + ' (RM ' + topCategory[1].toFixed(2) + ')' : 'no data'}
- Outstanding BNPL: RM ${totalBNPL.toFixed(2)}
- High-risk subscriptions: ${highRiskSubs.length}`;

  const prompt = lang === 'en'
    ? `You are a friendly and knowledgeable GX Rise financial advisor. Write a weekly financial summary for ${name} in casual but professional English. Use "you" when addressing them.

User data this week:${sharedData}

Write the summary in 3-4 short sentences. Include:
1. Score review and trend
2. One positive highlight
3. One specific actionable recommendation
4. A closing motivational sentence

No bullet points. Write like a message from a caring friend. Maximum 80 words.`
    : `Kamu adalah penasihat kewangan GX Rise yang mesra dan berpengetahuan. Tulis ringkasan kewangan mingguan untuk ${name} dalam Bahasa Malaysia yang santai tapi profesional. Gunakan "kamu" bukan "anda".

Data pengguna minggu ini:${sharedData}

Tulis ringkasan dalam 3-4 ayat pendek. Sertakan:
1. Ulasan skor dan trend
2. Satu perkara positif
3. Satu cadangan tindakan spesifik
4. Ayat penutup bermotivasi

Jangan gunakan bullet points. Tulis seperti mesej dari kawan yang prihatin. Maksimum 80 patah perkataan.`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || getFallbackDigest(userData, lang);
  } catch (error) {
    console.warn('Claude API unavailable, using fallback digest:', error.message);
    return getFallbackDigest(userData, lang);
  }
}

/**
 * Returns a hardcoded digest if the API is unavailable.
 * @param {Object} userData
 * @param {'bm'|'en'} lang
 * @returns {string}
 */
export function getFallbackDigest(userData, lang = 'bm') {
  const {
    name = 'Azri',
    healthScore = { current: 68 },
    monthly_savings = 45,
    streak = 6,
  } = userData;

  const scoreDelta = 4;

  if (lang === 'en') {
    return `Your score is up ${scoreDelta} points this week — great work, ${name}! Food delivery took RM67, slightly higher than last week. You saved RM${monthly_savings} and your streak is at ${streak} days — keep that momentum going! Next week's tip: cook at home once and move RM20 straight to your PTPTN Pocket. You're RM200 away from your target — almost there!`;
  }

  return `Minggu ini, skor kamu naik ${scoreDelta} mata — bagus, ${name}! Makanan penghantaran ambil RM67, sedikit tinggi berbanding minggu lepas. Kamu berjaya simpan RM${monthly_savings} dan streak dah ${streak} hari — teruskan momentum tu! Tips minggu depan: cuba masak sekali dan simpan RM20 terus ke PTPTN Pocket. Kamu dah RM200 dari target — hampir sampai!`;
}

/**
 * Generates spending tips based on category.
 * @param {string} topCategory
 * @param {number} amount
 * @param {'bm'|'en'} lang
 * @returns {string}
 */
export function getSpendingTip(topCategory, amount, lang = 'bm') {
  const tips = {
    en: {
      'Food & Drink': `Try cutting back on delivery orders — cooking at home can save up to RM${Math.round(amount * 0.3)} a month!`,
      'Shopping': `Consider waiting for 11.11 or 12.12 sales before buying. You could save 30-50%!`,
      'Transport': `Use your Touch n Go card for discounts and track your taxi/grab spending.`,
      'BNPL': `Avoid new BNPL purchases until you've cleared existing ones. Stacking BNPL debt can be risky!`,
      'Subscription': `Review unused subscriptions — you might save RM30+ a month!`,
      'Entertainment': `Try setting an entertainment budget — e.g. RM50/month — to avoid overspending.`,
    },
    bm: {
      'Food & Drink': `Cuba kurangkan pesanan penghantaran — masak sendiri boleh jimat sehingga RM${Math.round(amount * 0.3)} sebulan!`,
      'Shopping': `Pertimbangkan untuk tunggu jualan 11.11 atau 12.12 sebelum beli. Boleh jimat 30-50%!`,
      'Transport': `Gunakan kad Touch n Go untuk diskaun lebih dan pantau perbelanjaan teksi/grab kamu.`,
      'BNPL': `Elakkan BNPL baru sehingga bayar semua yang ada. Hutang BNPL bertimbun boleh bahaya!`,
      'Subscription': `Semak langganan yang tidak digunakan — mungkin boleh jimat RM30+ sebulan!`,
      'Entertainment': `Cuba tetapkan bajet hiburan — contohnya RM50 sebulan — supaya tidak terlebih belanja.`,
    },
  };

  return tips[lang]?.[topCategory] || (
    lang === 'en'
      ? 'Keep tracking your spending and save consistently every month!'
      : 'Teruskan pantau perbelanjaan kamu dan simpan secara konsisten setiap bulan!'
  );
}
