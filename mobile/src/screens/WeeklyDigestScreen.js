import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colours';
import { formatCurrency } from '../utils/formatters';
import { getCurrentUser } from '../services/mockData';
import { generateWeeklyDigest, getFallbackDigest } from '../services/claudeService';
import DigestCard from '../components/DigestCard';
import { useLang } from '../context/LangContext';

const TRANSLATIONS = {
  bm: {
    back: '← Kembali',
    title: 'Ringkasan Mingguan',
    weekDay: 'Ahad, 8 Mei 2026',
    generateBtn: '✨ Jana Ringkasan Baru',
    generatedAt: (time) => `Dijana pada ${time}`,
    streakLabel: 'Hari Streak',
    savingsLabel: 'Simpanan Minggu',
    scoreLabel: 'Skor Delta',
    topCategoryTitle: 'Kategori Tertinggi Minggu Ini',
    incomePercent: (pct) => `${pct}% pendapatan`,
    streakTitle: (n) => `Streak ${n} Hari Berturut!`,
    streakDesc: 'Kamu rekod perbelanjaan setiap hari minggu ini. Teruskan untuk dapatkan lencana baru!',
    tipsTitle: '💡 Tips Minggu Depan',
    tips: [
      'Cuba masak sekali seminggu — boleh jimat RM30-50',
      'Simpan RM20 terus ke PTPTN Pocket setiap kali gaji masuk',
      'Semak Netflix dan Apple Music — dah 47 hari tidak digunakan',
    ],
    trendTitle: 'Trend Skor 8 Minggu',
  },
  en: {
    back: '← Back',
    title: 'Weekly Summary',
    weekDay: 'Sunday, 8 May 2026',
    generateBtn: '✨ Generate New Summary',
    generatedAt: (time) => `Generated at ${time}`,
    streakLabel: 'Day Streak',
    savingsLabel: 'Weekly Savings',
    scoreLabel: 'Score Delta',
    topCategoryTitle: 'Top Category This Week',
    incomePercent: (pct) => `${pct}% of income`,
    streakTitle: (n) => `${n} Day Streak!`,
    streakDesc: "You've logged spending every day this week. Keep going to earn a new badge!",
    tipsTitle: '💡 Tips for Next Week',
    tips: [
      'Try cooking at home once a week — save RM30-50',
      'Auto-save RM20 to PTPTN Pocket every payday',
      'Check Netflix and Apple Music — unused for 47 days',
    ],
    trendTitle: '8-Week Score Trend',
  },
};

export default function WeeklyDigestScreen({ navigation }) {
  const user = getCurrentUser();
  const { weeklyDigest, healthScore, streak } = user;

  const { lang } = useLang();
  const [digestText, setDigestText] = useState(weeklyDigest.text);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [showTips, setShowTips] = useState(true);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    setDigestText(getFallbackDigest(user, lang));
    setLastGenerated(null);
  }, [lang]);

  const handleGenerateDigest = async () => {
    setIsGenerating(true);
    try {
      const newDigest = await generateWeeklyDigest(user, lang);
      setDigestText(newDigest);
      setLastGenerated(new Date().toLocaleTimeString('ms-MY'));
    } catch (e) {
      setDigestText(getFallbackDigest(user, lang));
    } finally {
      setIsGenerating(false);
    }
  };

  const scoreDelta = healthScore.current - healthScore.history[healthScore.history.length - 2];

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Week label ── */}
        <View style={styles.weekRow}>
          <Text style={styles.weekLabel}>{weeklyDigest.week}</Text>
          <Text style={styles.weekDay}>{t.weekDay}</Text>
        </View>

        {/* ── Digest card ── */}
        <DigestCard
          digest={digestText}
          score={healthScore.current}
          week={weeklyDigest.week}
          scoreDelta={scoreDelta}
        />

        {/* ── Generate button ── */}
        <TouchableOpacity
          style={[styles.generateBtn, isGenerating && styles.generateBtnDisabled]}
          onPress={handleGenerateDigest}
          disabled={isGenerating}
          activeOpacity={0.85}
        >
          {isGenerating ? (
            <ActivityIndicator color={COLORS.background} size="small" />
          ) : (
            <Text style={styles.generateBtnText}>{t.generateBtn}</Text>
          )}
        </TouchableOpacity>

        {lastGenerated && (
          <Text style={styles.generatedAt}>{t.generatedAt(lastGenerated)}</Text>
        )}

        {/* ── Quick stats ── */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>{t.streakLabel}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💚</Text>
            <Text style={styles.statValue}>{formatCurrency(weeklyDigest.savedThisWeek)}</Text>
            <Text style={styles.statLabel}>{t.savingsLabel}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={[styles.statValue, { color: scoreDelta >= 0 ? COLORS.success : COLORS.danger }]}>
              {scoreDelta >= 0 ? '+' : ''}{scoreDelta}
            </Text>
            <Text style={styles.statLabel}>{t.scoreLabel}</Text>
          </View>
        </View>

        {/* ── Top category ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.topCategoryTitle}</Text>
          <View style={styles.topCategoryRow}>
            <Text style={styles.topCategoryIcon}>🍔</Text>
            <View style={styles.topCategoryInfo}>
              <Text style={styles.topCategoryName}>{weeklyDigest.topCategory}</Text>
              <Text style={styles.topCategoryAmount}>
                {formatCurrency(weeklyDigest.topCategoryAmount)}
              </Text>
            </View>
            <View style={styles.topCategoryBadge}>
              <Text style={styles.topCategoryBadgeText}>
                {t.incomePercent(Math.round((weeklyDigest.topCategoryAmount / user.income) * 100))}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Streak badge ── */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View style={styles.streakInfo}>
            <Text style={styles.streakTitle}>{t.streakTitle(streak)}</Text>
            <Text style={styles.streakDesc}>{t.streakDesc}</Text>
          </View>
        </View>

        {/* ── Tips for next week ── */}
        {showTips && (
          <View style={styles.tipsCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.tipsTitle}>{t.tipsTitle}</Text>
              <TouchableOpacity onPress={() => setShowTips(false)}>
                <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>
            {t.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Score history mini chart ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.trendTitle}</Text>
          <View style={styles.miniChart}>
            {healthScore.history.map((val, idx) => {
              const maxH = 60;
              const minVal = Math.min(...healthScore.history);
              const maxVal = Math.max(...healthScore.history);
              const h = maxVal === minVal ? maxH / 2 : ((val - minVal) / (maxVal - minVal)) * maxH + 10;
              const isLast = idx === healthScore.history.length - 1;
              return (
                <View key={idx} style={styles.miniBar}>
                  <Text style={[styles.miniBarValue, isLast && { color: COLORS.accent }]}>{val}</Text>
                  <View
                    style={[
                      styles.miniBarFill,
                      { height: h, backgroundColor: isLast ? COLORS.accent : COLORS.border },
                    ]}
                  />
                  <Text style={styles.miniBarLabel}>{healthScore.weekLabels[idx]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: COLORS.background, fontSize: 17, fontWeight: '800' },
  langToggle: {
    backgroundColor: '#FFFFFF', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  langToggleText: { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
  weekRow: { paddingHorizontal: 16, paddingVertical: 14 },
  weekLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  weekDay: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  generateBtn: {
    backgroundColor: COLORS.accent, marginHorizontal: 16, marginTop: 12,
    borderRadius: 14, paddingVertical: 14, alignItems: 'center', elevation: 3,
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { color: COLORS.background, fontSize: 15, fontWeight: '800' },
  generatedAt: { textAlign: 'center', fontSize: 11, color: COLORS.textLight, marginTop: 6 },
  statsGrid: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 14, gap: 10,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.background, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, elevation: 2,
  },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 3 },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '500' },
  card: {
    backgroundColor: COLORS.background, marginHorizontal: 16, marginTop: 14,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  topCategoryRow: { flexDirection: 'row', alignItems: 'center' },
  topCategoryIcon: { fontSize: 32, marginRight: 12 },
  topCategoryInfo: { flex: 1 },
  topCategoryName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  topCategoryAmount: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary, marginTop: 2 },
  topCategoryBadge: { backgroundColor: COLORS.warning + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  topCategoryBadgeText: { fontSize: 11, color: COLORS.warning, fontWeight: '600' },
  streakCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.warning + '15',
    marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 16,
    borderLeftWidth: 4, borderLeftColor: COLORS.warning,
  },
  streakEmoji: { fontSize: 32, marginRight: 12 },
  streakInfo: { flex: 1 },
  streakTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  streakDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  tipsCard: {
    backgroundColor: COLORS.primary, marginHorizontal: 16, marginTop: 14,
    borderRadius: 14, padding: 16, marginBottom: 4,
  },
  tipsTitle: { fontSize: 14, fontWeight: '800', color: COLORS.background, marginBottom: 10 },
  tipRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  tipBullet: { fontSize: 14, color: COLORS.accent, marginRight: 8, fontWeight: '900' },
  tipText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  miniBar: { alignItems: 'center', flex: 1 },
  miniBarValue: { fontSize: 9, color: COLORS.textSecondary, marginBottom: 3 },
  miniBarFill: { width: 20, borderRadius: 4 },
  miniBarLabel: { fontSize: 9, color: COLORS.textLight, marginTop: 4 },
  bottomPad: { height: 100 },
});
