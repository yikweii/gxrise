import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/colours';
import { getCurrentUser, getRecentTransactions } from '../services/mockData';
import { getDimensionLabel, getDimensionInsight, getScoreColour } from '../utils/healthScore';
import { formatCurrency } from '../utils/formatters';
import HealthScoreGauge from '../components/HealthScoreGauge';
import { useLang } from '../context/LangContext';

const TRANSLATIONS = {
  bm: {
    back: '← Kembali',
    headerTitle: 'Skor Kewangan',
    lastWeek: 'Minggu lepas',
    pts: 'mata',
    trendTitle: 'Trend 8 Minggu',
    breakdownTitle: 'Pecahan Dimensi',
    relatedTxns: 'Transaksi berkaitan:',
    draggingTitle: 'Apa yang menurunkan skor kamu?',
    tipsTitle: '💡 Cara naikkan skor kamu',
    tip1: 'Simpan sekurang-kurangnya 10% pendapatan setiap bulan',
    tip2: 'Kurangkan pesanan penghantaran makanan — masak lebih jimat',
    tip3: 'Selesaikan BNPL sebelum beli benda baru dengan BNPL',
    tip4: 'Cancel langganan yang tidak digunakan lebih 30 hari',
  },
  en: {
    back: '← Back',
    headerTitle: 'Financial Score',
    lastWeek: 'Last week',
    pts: 'pts',
    trendTitle: '8-Week Trend',
    breakdownTitle: 'Dimension Breakdown',
    relatedTxns: 'Related transactions:',
    draggingTitle: "What's lowering your score?",
    tipsTitle: '💡 How to improve your score',
    tip1: 'Save at least 10% of your income every month',
    tip2: 'Cut back on food delivery — cooking saves more',
    tip3: 'Clear BNPL before taking on new BNPL',
    tip4: 'Cancel subscriptions unused for 30+ days',
  },
};

const DIMENSIONS = ['spending_control', 'savings_rate', 'debt_risk', 'emergency_buffer'];
const WEIGHTS = { spending_control: 0.30, savings_rate: 0.25, debt_risk: 0.25, emergency_buffer: 0.20 };

const DIMENSION_SCORES = {
  spending_control: 60,
  savings_rate: 21,
  debt_risk: 55,
  emergency_buffer: 56,
};

// Hardcoded category → dimension mapping for insight drilling
const DIMENSION_TRANSACTIONS = {
  spending_control: ['Food & Drink', 'Shopping', 'Entertainment'],
  savings_rate: ['Savings', 'Income'],
  debt_risk: ['BNPL'],
  emergency_buffer: ['Savings'],
};

export default function HealthScoreScreen({ navigation }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const user = getCurrentUser();
  const { healthScore } = user;
  const recentTxns = getRecentTransactions(30);
  const [expandedDim, setExpandedDim] = useState(null);

  const sparklineMax = Math.max(...healthScore.history);
  const sparklineMin = Math.min(...healthScore.history);
  const sparklineRange = sparklineMax - sparklineMin || 1;

  const getDimTransactions = (dim) => {
    const cats = DIMENSION_TRANSACTIONS[dim] || [];
    return recentTxns.filter((t) => cats.includes(t.category)).slice(0, 4);
  };

  const draggingFactors = [];
  DIMENSIONS.forEach((dim) => {
    if (DIMENSION_SCORES[dim] < 60) {
      draggingFactors.push({ dim, score: DIMENSION_SCORES[dim] });
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.headerTitle}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* ── Large Gauge ── */}
        <View style={styles.gaugeSection}>
          <HealthScoreGauge score={healthScore.current} size={200} showLabel />
          <Text style={styles.gaugeSubtitle}>
            {t.lastWeek}: {healthScore.history[healthScore.history.length - 2]}{' '}
            <Text style={{ color: COLORS.success }}>
              (▲ {healthScore.current - healthScore.history[healthScore.history.length - 2]} {t.pts})
            </Text>
          </Text>
        </View>

        {/* ── 8-Week Sparkline ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.trendTitle}</Text>
          <View style={styles.sparklineContainer}>
            <View style={styles.sparkline}>
              {healthScore.history.map((val, idx) => {
                const height = ((val - sparklineMin) / sparklineRange) * 50 + 10;
                const colour = getScoreColour(val);
                return (
                  <View key={idx} style={styles.sparkBar}>
                    <Text style={styles.sparkValue}>{val}</Text>
                    <View
                      style={[
                        styles.sparkFill,
                        { height, backgroundColor: colour },
                      ]}
                    />
                    <Text style={styles.sparkLabel}>{healthScore.weekLabels[idx]}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── 4 Dimension Bars ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.breakdownTitle}</Text>
          {DIMENSIONS.map((dim) => {
            const dimScore = DIMENSION_SCORES[dim];
            const dimColour = getScoreColour(dimScore);
            const weight = WEIGHTS[dim];
            const isExpanded = expandedDim === dim;
            const dimTxns = getDimTransactions(dim);

            return (
              <TouchableOpacity
                key={dim}
                style={styles.dimensionRow}
                onPress={() => setExpandedDim(isExpanded ? null : dim)}
                activeOpacity={0.8}
              >
                <View style={styles.dimHeader}>
                  <View style={styles.dimTitleRow}>
                    <Text style={styles.dimLabel}>{getDimensionLabel(dim, lang)}</Text>
                    <Text style={styles.dimWeight}>({Math.round(weight * 100)}%)</Text>
                  </View>
                  <View style={styles.dimScoreRow}>
                    <Text style={[styles.dimScore, { color: dimColour }]}>{dimScore}</Text>
                    <Text style={styles.dimScoreMax}>/100</Text>
                    <Text style={styles.dimChevron}>{isExpanded ? '▲' : '▼'}</Text>
                  </View>
                </View>

                <View style={styles.dimTrack}>
                  <View style={[styles.dimFill, { width: `${dimScore}%`, backgroundColor: dimColour }]} />
                </View>

                <Text style={styles.dimInsight}>{getDimensionInsight(dim, dimScore, lang)}</Text>

                {/* Expandable transactions */}
                {isExpanded && dimTxns.length > 0 && (
                  <View style={styles.dimTransactions}>
                    <Text style={styles.dimTxnHeader}>{t.relatedTxns}</Text>
                    {dimTxns.map((t) => (
                      <View key={t.id} style={styles.dimTxnRow}>
                        <Text style={styles.dimTxnMerchant}>{t.merchant}</Text>
                        <Text
                          style={[
                            styles.dimTxnAmount,
                            { color: t.type === 'credit' ? COLORS.success : COLORS.danger },
                          ]}
                        >
                          {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── What's dragging the score ── */}
        {draggingFactors.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.draggingTitle}</Text>
            {draggingFactors.map(({ dim, score }) => (
              <View key={dim} style={styles.insightRow}>
                <Text style={styles.insightBullet}>⚠️</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightDim}>{getDimensionLabel(dim, lang)}</Text>
                  <Text style={styles.insightText}>{getDimensionInsight(dim, score, lang)}</Text>
                </View>
                <Text style={[styles.insightScore, { color: getScoreColour(score) }]}>{score}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Tips ── */}
        <View style={[styles.card, styles.tipsCard]}>
          <Text style={styles.tipsTitle}>{t.tipsTitle}</Text>
          <Text style={styles.tipItem}>• {t.tip1}</Text>
          <Text style={styles.tipItem}>• {t.tip2}</Text>
          <Text style={styles.tipItem}>• {t.tip3}</Text>
          <Text style={styles.tipItem}>• {t.tip4}</Text>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: COLORS.background, fontSize: 17, fontWeight: '800' },
  placeholder: { width: 60 },
  gaugeSection: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  gaugeSubtitle: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.background,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  sparklineContainer: { alignItems: 'center' },
  sparkline: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  sparkBar: { alignItems: 'center', minWidth: 30 },
  sparkValue: { fontSize: 9, color: COLORS.textSecondary, marginBottom: 2 },
  sparkFill: { width: 24, borderRadius: 4 },
  sparkLabel: { fontSize: 9, color: COLORS.textLight, marginTop: 4 },
  dimensionRow: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  dimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dimTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dimLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  dimWeight: { fontSize: 11, color: COLORS.textLight },
  dimScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  dimScore: { fontSize: 18, fontWeight: '800' },
  dimScoreMax: { fontSize: 11, color: COLORS.textLight },
  dimChevron: { fontSize: 12, color: COLORS.textLight, marginLeft: 4 },
  dimTrack: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  dimFill: { height: '100%', borderRadius: 4 },
  dimInsight: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  dimTransactions: { marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  dimTxnHeader: { fontSize: 11, color: COLORS.textLight, fontWeight: '600', marginBottom: 6 },
  dimTxnRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  dimTxnMerchant: { fontSize: 12, color: COLORS.textSecondary },
  dimTxnAmount: { fontSize: 12, fontWeight: '700' },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  insightBullet: { fontSize: 16, marginRight: 8 },
  insightContent: { flex: 1 },
  insightDim: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  insightText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  insightScore: { fontSize: 18, fontWeight: '800', marginLeft: 8 },
  tipsCard: { backgroundColor: COLORS.primary },
  tipsTitle: { fontSize: 14, fontWeight: '800', color: COLORS.background, marginBottom: 10 },
  tipItem: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
  bottomPad: { height: 100 },
});
