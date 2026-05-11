import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colours';
import { formatCurrency } from '../utils/formatters';
import { getCurrentUser, getRecentTransactions, getBNPL, getSubscriptions, creditBalance, addTransaction } from '../services/mockData';
import { getDemoNudge } from '../services/nudgeEngine';
import NudgeCard from '../components/NudgeCard';
import TransactionItem from '../components/TransactionItem';
import { useLang } from '../context/LangContext';

const TRANSLATIONS = {
  bm: {
    greeting: (name) => `Selamat datang, ${name} 👋`,
    balanceLabel: 'Baki GXBank',
    balanceInfo: 'Info baki ›',
    topUp: 'Tambah',
    scanQR: 'Imbas QR',
    send: 'Poket',
    yourAccount: 'Akaun kamu',
    mainAccount: 'Akaun Utama',
    viewTxn: 'Lihat transaksi',
    financialScore: 'Skor Kewangan',
    viewScore: 'Lihat Skor',
    bnplActive: 'BNPL Aktif',
    subscriptions: 'Langganan',
    perMonth: '/bln',
    forYouToday: 'Untuk kamu hari ini',
    ptptnTitle: 'Penjejak PTPTN',
    ptptnDesc: 'Semak baki & jadual bayaran balik PTPTN kamu.',
    check: 'Semak',
    recentTxn: 'Transaksi Terkini',
    seeAll: 'Lihat semua',
    topUpModal: 'Tambah Baki Dompet',
    currentBalance: (bal) => `Baki semasa: ${bal}`,
    amountPlaceholder: 'Jumlah (RM)',
    topUpNow: 'Tambah Sekarang',
    balanceInfoModal: 'Info Baki',
    availableBalance: 'Baki Tersedia',
    incomeSection: 'Pendapatan Bulan Ini',
    commitmentsSection: 'Komitmen Aktif',
    bnplOutstanding: '💳 BNPL Tertunggak',
    subPerMonth: '📱 Langganan/bln',
    savings: '💰 Simpanan',
    close: 'Tutup',
  },
  en: {
    greeting: (name) => `Welcome, ${name} 👋`,
    balanceLabel: 'GXBank Balance',
    balanceInfo: 'Balance info ›',
    topUp: 'Top Up',
    scanQR: 'Scan QR',
    send: 'Pocket',
    yourAccount: 'Your Account',
    mainAccount: 'Main Account',
    viewTxn: 'View transactions',
    financialScore: 'Financial Score',
    viewScore: 'View Score',
    bnplActive: 'Active BNPL',
    subscriptions: 'Subscriptions',
    perMonth: '/mo',
    forYouToday: 'For you today',
    ptptnTitle: 'PTPTN Tracker',
    ptptnDesc: 'Check your PTPTN balance & repayment schedule.',
    check: 'Check',
    recentTxn: 'Recent Transactions',
    seeAll: 'See all',
    topUpModal: 'Top Up Wallet',
    currentBalance: (bal) => `Current balance: ${bal}`,
    amountPlaceholder: 'Amount (RM)',
    topUpNow: 'Top Up Now',
    balanceInfoModal: 'Balance Info',
    availableBalance: 'Available Balance',
    incomeSection: "This Month's Income",
    commitmentsSection: 'Active Commitments',
    bnplOutstanding: '💳 Outstanding BNPL',
    subPerMonth: '📱 Subscriptions/mo',
    savings: '💰 Savings',
    close: 'Close',
  },
};

export default function HomeScreen({ navigation }) {
  // Hooks must come first
  const { lang, toggleLang } = useLang();
  const t = TRANSLATIONS[lang];

  const [refreshing, setRefreshing] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [showBalanceInfo, setShowBalanceInfo] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpError, setTopUpError] = useState('');
  const [topUpProcessing, setTopUpProcessing] = useState(false);
  const [displayBalance, setDisplayBalance] = useState(() => getCurrentUser().balance);
  const [recentTxns, setRecentTxns] = useState(() => getRecentTransactions(30).slice(0, 5));

  const user = getCurrentUser();
  const bnpl = getBNPL();
  const subscriptions = getSubscriptions();
  // lang is now defined before use
  const activeNudge = getDemoNudge(lang);

  const totalBNPL = bnpl.reduce((s, b) => s + b.outstanding, 0);
  const monthlySubscriptions = subscriptions.reduce((s, sub) => s + sub.amount, 0);
  const scoreDelta = user.healthScore.current - user.healthScore.history[user.healthScore.history.length - 2];

  const confirmTopUp = () => {
    if (topUpProcessing) return;
    const amt = parseFloat(topUpAmount);
    if (!amt || amt <= 0 || isNaN(amt)) {
      setTopUpError(lang === 'bm' ? 'Sila masukkan jumlah yang sah.' : 'Please enter a valid amount.');
      return;
    }
    setTopUpProcessing(true);
    creditBalance(amt);
    // Add a transaction entry for the top-up
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
    addTransaction({
      id: `topup_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      merchant: lang === 'bm' ? `Tambah Baki — ${timeStr}` : `Top Up — ${timeStr}`,
      amount: amt,
      type: 'credit',
      category: 'Top Up',
    });
    setDisplayBalance(getCurrentUser().balance);
    setRecentTxns(getRecentTransactions(30).slice(0, 5));
    setShowTopUp(false);
    setTopUpAmount('');
    setTopUpError('');
    setTopUpProcessing(false);
  };

  useFocusEffect(
    useCallback(() => {
      setDisplayBalance(getCurrentUser().balance);
      setRecentTxns(getRecentTransactions(30).slice(0, 5));
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setDisplayBalance(getCurrentUser().balance);
    setRecentTxns(getRecentTransactions(30).slice(0, 5));
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleNudgeAction = (actionId) => {
    // Any action dismisses the nudge
    setNudgeDismissed(true);
    if (actionId === 'view_bnpl') navigation.navigate('BNPL');
    else if (actionId === 'review_subs') navigation.navigate('Subscriptions');
    else if (actionId === 'set_budget') navigation.navigate('Goals');
    else if (actionId === 'allocate_now') navigation.navigate('Goals');
    else if (actionId === 'plan_budget') navigation.navigate('Goals');
    // 'dismiss', 'save_now', 'keep' — just dismiss, no navigation
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        {/* ── Balance section ── */}
        <View style={styles.balanceSection}>
          <View style={styles.topRow}>
            <Text style={styles.greeting}>{t.greeting(user.name)}</Text>
            <View style={styles.topRight}>
              <TouchableOpacity onPress={() => navigation.navigate('Nudge')} style={styles.bellBtn}>
                <Text style={styles.bellIcon}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleLang} style={styles.langToggle}>
                <Text style={styles.langToggleText}>{lang === 'bm' ? 'EN' : 'BM'}</Text>
              </TouchableOpacity>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{user.avatar}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.balanceLabel}>{t.balanceLabel}</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {balanceHidden ? 'RM ••••••' : formatCurrency(displayBalance)}
            </Text>
            <TouchableOpacity onPress={() => setBalanceHidden(!balanceHidden)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{balanceHidden ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setShowBalanceInfo(true)}>
            <Text style={styles.balanceInfoLink}>{t.balanceInfo}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick Action Buttons ── */}
        <View style={styles.actionRow}>
          {/* Tambah — opens wallet top-up modal */}
          <TouchableOpacity style={styles.actionItem} onPress={() => setShowTopUp(true)} activeOpacity={0.7}>
            <View style={styles.actionCircle}>
              <Text style={styles.actionEmoji}>＋</Text>
            </View>
            <Text style={styles.actionLabel}>{t.topUp}</Text>
          </TouchableOpacity>

          {/* Imbas QR — disabled */}
          <View style={[styles.actionItem, { opacity: 0.35 }]}>
            <View style={styles.actionCircle}>
              <Text style={styles.actionEmoji}>⊡</Text>
            </View>
            <Text style={styles.actionLabel}>{t.scanQR}</Text>
          </View>

          {/* Hantar — navigates to Pocket page */}
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Pocket')} activeOpacity={0.7}>
            <View style={styles.actionCircle}>
              <Text style={styles.actionEmoji}>💰</Text>
            </View>
            <Text style={styles.actionLabel}>{t.send}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Everyday Account card ── */}
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabelText}>{t.yourAccount}</Text>
        </View>

        <View style={styles.accountCard}>
          <View style={styles.mainAccountCol}>
            <Text style={styles.accountTypeLabel}>{t.mainAccount}</Text>
            <Text style={styles.accountBalance}>
              {balanceHidden ? 'RM ••••••' : formatCurrency(displayBalance)}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Transactions')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewTxnLink}>{t.viewTxn}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardDivider} />

          <TouchableOpacity
            style={styles.pocketCol}
            onPress={() => navigation.navigate('HealthScore')}
            activeOpacity={0.8}
          >
            <Text style={styles.pocketTypeLabel}>{t.financialScore}</Text>
            <Text style={styles.pocketScore}>{user.healthScore.current}/100</Text>
            <View style={styles.pocketPill}>
              <Text style={styles.pocketPillText}>
                {scoreDelta >= 0 ? '▲' : '▼'} {Math.abs(scoreDelta)} pts
              </Text>
            </View>
            <View style={styles.viewScoreBtn}>
              <Text style={styles.viewScoreBtnText}>{t.viewScore}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Quick Stats ── */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('BNPL')} activeOpacity={0.7}>
            <Text style={styles.statIcon}>💳</Text>
            <Text style={styles.statLabel}>{t.bnplActive}</Text>
            <Text style={[styles.statValue, { color: COLORS.danger }]}>{formatCurrency(totalBNPL)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Subscriptions')} activeOpacity={0.7}>
            <Text style={styles.statIcon}>📱</Text>
            <Text style={styles.statLabel}>{t.subscriptions}</Text>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>{formatCurrency(monthlySubscriptions)}{t.perMonth}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('PTPTN')} activeOpacity={0.7}>
            <Text style={styles.statIcon}>🎓</Text>
            <Text style={styles.statLabel}>PTPTN</Text>
            <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>RM21,400</Text>
          </TouchableOpacity>
        </View>

        {/* ── For you today ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.forYouToday}</Text>
        </View>

        {activeNudge && !nudgeDismissed && (
          <NudgeCard
            nudge={activeNudge}
            onAction={handleNudgeAction}
            onDismiss={() => setNudgeDismissed(true)}
          />
        )}

        {/* FlexiCredit-style promo card */}
        <TouchableOpacity
          style={styles.promoCard}
          onPress={() => navigation.navigate('PTPTN')}
          activeOpacity={0.8}
        >
          <View style={styles.promoIconBox}>
            <Text style={styles.promoIconEmoji}>🎓</Text>
          </View>
          <View style={styles.promoText}>
            <Text style={styles.promoTitle}>{t.ptptnTitle}</Text>
            <Text style={styles.promoDesc}>{t.ptptnDesc}</Text>
          </View>
          <TouchableOpacity
            style={styles.promoBtn}
            onPress={() => navigation.navigate('PTPTN')}
            activeOpacity={0.7}
          >
            <Text style={styles.promoBtnText}>{t.check}</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ── Recent Transactions ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.recentTxn}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAll}>{t.seeAll}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsCard}>
          {recentTxns.map((txn) => (
            <TransactionItem key={txn.id} transaction={txn} lang={lang} />
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Top-Up Wallet Modal ── */}
      <Modal visible={showTopUp} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.topUpModal}</Text>
              <TouchableOpacity onPress={() => { setShowTopUp(false); setTopUpAmount(''); setTopUpError(''); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.bInfoHeroLabel}>{t.currentBalance(formatCurrency(displayBalance))}</Text>

            <TextInput
              style={styles.topUpInput}
              placeholder={t.amountPlaceholder}
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={confirmTopUp}
              value={topUpAmount}
              onChangeText={(v) => { setTopUpAmount(v); setTopUpError(''); }}
            />
            {topUpError !== '' && (
              <Text style={{ fontSize: 12, color: COLORS.danger, marginTop: -10, marginBottom: 8 }}>
                {topUpError}
              </Text>
            )}

            <View style={styles.quickAmounts}>
              {['50', '100', '200', '500'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickAmt, topUpAmount === amt && styles.quickAmtActive]}
                  onPress={() => setTopUpAmount(amt)}
                >
                  <Text style={[styles.quickAmtText, topUpAmount === amt && styles.quickAmtTextActive]}>
                    RM{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.bInfoCloseBtn} onPress={confirmTopUp}>
              <Text style={styles.bInfoCloseBtnText}>{t.topUpNow}</Text>
            </TouchableOpacity>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Balance Info Modal ── */}
      <Modal visible={showBalanceInfo} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.balanceInfoModal}</Text>
              <TouchableOpacity onPress={() => setShowBalanceInfo(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Available balance */}
            <View style={styles.bInfoHero}>
              <Text style={styles.bInfoHeroLabel}>{t.availableBalance}</Text>
              <Text style={styles.bInfoHeroAmt}>{formatCurrency(displayBalance)}</Text>
            </View>

            <View style={styles.bInfoDivider} />

            {/* Income */}
            <Text style={styles.bInfoSectionLabel}>{t.incomeSection}</Text>
            {user.incomeBreakdown.map((inc, i) => (
              <View key={i} style={styles.bInfoRow}>
                <Text style={styles.bInfoRowLabel}>{inc.source}</Text>
                <Text style={[styles.bInfoRowAmt, { color: COLORS.success }]}>+{formatCurrency(inc.amount)}</Text>
              </View>
            ))}

            <View style={styles.bInfoDivider} />

            {/* Commitments */}
            <Text style={styles.bInfoSectionLabel}>{t.commitmentsSection}</Text>
            <View style={styles.bInfoRow}>
              <Text style={styles.bInfoRowLabel}>{t.bnplOutstanding}</Text>
              <Text style={[styles.bInfoRowAmt, { color: COLORS.danger }]}>-{formatCurrency(totalBNPL)}</Text>
            </View>
            <View style={styles.bInfoRow}>
              <Text style={styles.bInfoRowLabel}>{t.subPerMonth}</Text>
              <Text style={[styles.bInfoRowAmt, { color: COLORS.warning }]}>-{formatCurrency(monthlySubscriptions)}</Text>
            </View>
            <View style={styles.bInfoRow}>
              <Text style={styles.bInfoRowLabel}>{t.savings}</Text>
              <Text style={[styles.bInfoRowAmt, { color: COLORS.accent }]}>{formatCurrency(user.savings_balance)}</Text>
            </View>

            <TouchableOpacity
              style={styles.bInfoCloseBtn}
              onPress={() => setShowBalanceInfo(false)}
            >
              <Text style={styles.bInfoCloseBtnText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Balance section
  balanceSection: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellBtn: { padding: 4, marginRight: 6 },
  bellIcon: { fontSize: 20 },
  langToggle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  langToggleText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  balanceLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },
  balanceInfoLink: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },

  // Quick actions
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 8,
  },
  actionItem: {
    alignItems: 'center',
    gap: 6,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionEmoji: {
    fontSize: 22,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  actionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Account card (GXBank-style 2-column)
  sectionLabelRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  sectionLabelText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  accountCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  mainAccountCol: {
    flex: 1,
    paddingRight: 16,
  },
  accountTypeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  accountBalance: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  viewTxnLink: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  cardDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  pocketCol: {
    flex: 1,
    paddingLeft: 0,
  },
  pocketTypeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  pocketScore: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  pocketPill: {
    backgroundColor: COLORS.primary + '25',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  pocketPillText: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '700',
  },
  viewScoreBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  viewScoreBtnText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Quick stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },

  // Promo card (FlexiCredit style)
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  promoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoIconEmoji: {
    fontSize: 24,
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  promoDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  promoBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  promoBtnText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Transactions card
  transactionsCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  bottomPad: {
    height: 100,
  },

  // Top-up input
  topUpInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 16, color: COLORS.textPrimary, marginVertical: 14,
    backgroundColor: COLORS.background,
  },
  quickAmounts: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickAmt: {
    flex: 1, backgroundColor: COLORS.background, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
  },
  quickAmtActive: { backgroundColor: COLORS.primary + '25', borderColor: COLORS.primary },
  quickAmtText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  quickAmtTextActive: { color: COLORS.primary },

  // Balance info modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  modalClose: { fontSize: 18, color: COLORS.textSecondary, padding: 4 },
  bInfoHero: { alignItems: 'center', marginBottom: 16 },
  bInfoHeroLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  bInfoHeroAmt: { fontSize: 34, fontWeight: '900', color: COLORS.textPrimary },
  bInfoDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
  bInfoSectionLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  bInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  bInfoRowLabel: { fontSize: 14, color: COLORS.textPrimary },
  bInfoRowAmt: { fontSize: 14, fontWeight: '700' },
  bInfoCloseBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  bInfoCloseBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
