import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/colours';
import { formatDate } from '../utils/formatters';
import { getCurrentUser } from '../services/mockData';
import { getDemoNudge, getNudgeHistory } from '../services/nudgeEngine';
import NudgeCard from '../components/NudgeCard';
import { useLang } from '../context/LangContext';

const TRANSLATIONS = {
  bm: {
    back: '← Kembali',
    headerTitle: 'Notis Pintar',
    sectionToday: '🔔 Notis Hari Ini',
    allDone: 'Semua notis hari ini sudah diselesaikan!',
    limitText: 'GX Rise hantar maksimum 2 notis sehari supaya kamu tidak terganggu.',
    sectionHistory: '📋 Notis 7 Hari Lepas',
    dismissedBadge: '✕ Ditutup',
    actionLabels: {
      view_bnpl: 'Dilihat BNPL',
      review_subs: 'Semak Langganan',
      allocate_now: 'Agihkan Sekarang',
      dismiss: 'Ditutup',
      set_budget: 'Tetapkan Had',
      save_now: 'Simpan Terus',
      plan_budget: 'Rancang Bajet',
      keep: 'Simpan Dulu',
    },
  },
  en: {
    back: '← Back',
    headerTitle: 'Smart Nudges',
    sectionToday: '🔔 Today\'s Nudges',
    allDone: 'All nudges for today are done!',
    limitText: 'GX Rise sends max 2 nudges a day so you stay focused.',
    sectionHistory: '📋 Last 7 Days',
    dismissedBadge: '✕ Dismissed',
    actionLabels: {
      view_bnpl: 'View BNPL',
      review_subs: 'Check Subscriptions',
      allocate_now: 'Allocate Now',
      dismiss: 'Dismissed',
      set_budget: 'Set Limit',
      save_now: 'Save Now',
      plan_budget: 'Plan Budget',
      keep: 'Save First',
    },
  },
};

export default function NudgeScreen({ navigation }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const user = getCurrentUser();
  const activeNudge = getDemoNudge(lang);
  const history = getNudgeHistory(lang);
  const [dismissed, setDismissed] = useState(false);

  const handleAction = (actionId, nudge) => {
    setDismissed(true);
    if (actionId === 'view_bnpl') navigation.navigate('BNPL');
    else if (actionId === 'review_subs') navigation.navigate('Subscriptions');
    else if (actionId === 'allocate_now') navigation.navigate('Pocket');
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Active nudge ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.sectionToday}</Text>
        </View>

        {!dismissed ? (
          <NudgeCard
            nudge={activeNudge}
            onAction={handleAction}
            onDismiss={() => setDismissed(true)}
          />
        ) : (
          <View style={styles.noNudgeCard}>
            <Text style={styles.noNudgeIcon}>✅</Text>
            <Text style={styles.noNudgeText}>{t.allDone}</Text>
          </View>
        )}

        {/* ── Limit info ── */}
        <View style={styles.limitInfo}>
          <Text style={styles.limitText}>
            {t.limitText}
          </Text>
        </View>

        {/* ── History ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.sectionHistory}</Text>
        </View>

        {history.map((item, idx) => (
          <View key={idx} style={styles.historyCard}>
            {/* Header */}
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <Text style={styles.historyDate}>{formatDate(item.date, lang)}</Text>
            </View>

            {/* Body (truncated) */}
            <Text style={styles.historyBody} numberOfLines={2}>
              {item.body}
            </Text>

            {/* Action taken badge */}
            <View style={styles.actionBadgeRow}>
              <View
                style={[
                  styles.actionBadge,
                  { backgroundColor: item.actionTaken === 'dismiss' ? COLORS.surface : COLORS.accent + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.actionBadgeText,
                    { color: item.actionTaken === 'dismiss' ? COLORS.textLight : COLORS.accent },
                  ]}
                >
                  {item.actionTaken === 'dismiss' ? t.dismissedBadge : `✓ ${t.actionLabels[item.actionTaken] || item.actionTaken}`}
                </Text>
              </View>
            </View>
          </View>
        ))}

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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  noNudgeCard: {
    backgroundColor: COLORS.background,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noNudgeIcon: { fontSize: 36, marginBottom: 10 },
  noNudgeText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  limitInfo: {
    backgroundColor: COLORS.accent + '15',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    padding: 12,
  },
  limitText: { fontSize: 12, color: COLORS.accent, lineHeight: 18 },
  historyCard: {
    backgroundColor: COLORS.background,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  historyDate: { fontSize: 11, color: COLORS.textLight, whiteSpace: 'nowrap' },
  historyBody: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 10 },
  actionBadgeRow: { alignItems: 'flex-start' },
  actionBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actionBadgeText: { fontSize: 11, fontWeight: '700' },
  bottomPad: { height: 100 },
});
