import { COLORS } from '../constants/colours';

export function calculateHealthScore({
  income = 1050,
  non_essential = 420,
  monthly_savings = 45,
  bnpl_total = 254,
  available_cash = 465,
  savings_balance = 234,
  weekly_spend = 262,
  previous_score = 64,
}) {
  const spending_control = Math.min(100, Math.max(0, (1 - non_essential / income) * 200));
  const savings_rate = Math.min(100, Math.max(0, (monthly_savings / income) * 500));
  const debt_risk = Math.min(100, Math.max(0, (1 - bnpl_total / available_cash) * 150));
  const emergency_buffer = Math.min(100, Math.max(0, (savings_balance / weekly_spend) * 25));

  const overall = Math.round(
    spending_control * 0.30 +
    savings_rate * 0.25 +
    debt_risk * 0.25 +
    emergency_buffer * 0.20
  );

  const delta = overall - previous_score;

  return {
    overall,
    spending_control: Math.round(spending_control),
    savings_rate: Math.round(savings_rate),
    debt_risk: Math.round(debt_risk),
    emergency_buffer: Math.round(emergency_buffer),
    delta,
    label: getScoreLabel(overall),
    colour: getScoreColour(overall),
  };
}

export function getScoreLabel(score, lang = 'bm') {
  if (lang === 'en') {
    if (score >= 80) return 'Healthy';
    if (score >= 60) return 'Moderate';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
  }
  if (score >= 80) return 'Sihat';
  if (score >= 60) return 'Sederhana';
  if (score >= 40) return 'Perlu Perhatian';
  return 'Kritikal';
}

export function getScoreColour(score) {
  if (score >= 80) return COLORS.success;
  if (score >= 60) return COLORS.accent;
  if (score >= 40) return COLORS.warning;
  return COLORS.danger;
}

export function getDimensionLabel(dimension, lang = 'bm') {
  if (lang === 'en') {
    const labels = {
      spending_control: 'Spending Control',
      savings_rate: 'Savings Rate',
      debt_risk: 'Debt Risk',
      emergency_buffer: 'Emergency Buffer',
    };
    return labels[dimension] || dimension;
  }
  const labels = {
    spending_control: 'Kawalan Belanja',
    savings_rate: 'Kadar Simpanan',
    debt_risk: 'Risiko Hutang',
    emergency_buffer: 'Tabungan Kecemasan',
  };
  return labels[dimension] || dimension;
}

export function getDimensionInsight(dimension, score, lang = 'bm') {
  if (lang === 'en') {
    if (dimension === 'spending_control') {
      if (score >= 80) return 'Your spending is well under control.';
      if (score >= 60) return 'Try to cut back on non-essentials a bit more.';
      return 'Non-essential spending is too high relative to income.';
    }
    if (dimension === 'savings_rate') {
      if (score >= 80) return 'Your savings rate is excellent!';
      if (score >= 60) return 'Savings rate could be improved further.';
      return "This month's savings are very low. Try to save at least 10%.";
    }
    if (dimension === 'debt_risk') {
      if (score >= 80) return 'Your BNPL debt level is low and manageable.';
      if (score >= 60) return 'Moderate BNPL debt. Monitor payments to avoid arrears.';
      return 'BNPL debt is high relative to cash. Avoid new BNPL.';
    }
    if (dimension === 'emergency_buffer') {
      if (score >= 80) return 'Your emergency fund is sufficient.';
      if (score >= 60) return 'Emergency fund could be built up to 3 weeks of expenses.';
      return 'Emergency fund is very low. Try to save at least RM500.';
    }
    return '';
  }

  if (dimension === 'spending_control') {
    if (score >= 80) return 'Perbelanjaan kamu terkawal dengan baik.';
    if (score >= 60) return 'Cuba kurangkan perbelanjaan tidak perlu sedikit lagi.';
    return 'Perbelanjaan tidak perlu terlalu tinggi berbanding pendapatan.';
  }
  if (dimension === 'savings_rate') {
    if (score >= 80) return 'Kadar simpanan kamu cemerlang!';
    if (score >= 60) return 'Kadar simpanan boleh ditingkatkan lagi.';
    return 'Simpanan bulan ini sangat rendah. Cuba simpan sekurang-kurangnya 10%.';
  }
  if (dimension === 'debt_risk') {
    if (score >= 80) return 'Tahap hutang BNPL kamu rendah dan terkawal.';
    if (score >= 60) return 'Hutang BNPL sederhana. Pantau bayaran agar tidak tertunggak.';
    return 'Hutang BNPL tinggi berbanding wang tunai. Elakkan BNPL baru.';
  }
  if (dimension === 'emergency_buffer') {
    if (score >= 80) return 'Dana kecemasan kamu mencukupi.';
    if (score >= 60) return 'Dana kecemasan boleh ditingkatkan ke 3 minggu perbelanjaan.';
    return 'Dana kecemasan sangat rendah. Cuba simpan sekurang-kurangnya RM500.';
  }
  return '';
}
