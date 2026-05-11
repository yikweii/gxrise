import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colours';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  getCurrentUser,
  getGoals,
  depositToGoal,
  withdrawFromGoal,
  getPockets,
  depositToPocket,
  createGoal,
  addTransaction,
  createPocket,
} from '../services/mockData';
import { useLang } from '../context/LangContext';

const TRANSLATIONS = {
  bm: {
    headerTitle: '💰 Poket',
    walletBalance: 'Baki Dompet',
    mySavings: 'Simpanan Saya',
    friendPocket: 'Pocket Kawan',
    activePockets: 'Pocket Aktif',
    tabSavings: '🏦 Simpanan Saya',
    tabFriends: '👥 Pocket Kawan',
    target: 'Sasaran:',
    noTarget: 'Tiada sasaran',
    needMore: (amt) => `Perlu ${amt} lagi untuk capai matlamat`,
    goalReached: '🏆 Matlamat Tercapai!',
    newPocket: 'Buat Pocket Simpanan Baru',
    needMorePocket: (amt) => `Perlu ${amt} lagi`,
    members: (n) => `${n} ahli`,
    splitBill: '🧾 Bahagi Bil',
    deposit: '+ Deposit',
    fundIn: '💵 Masuk Dana',
    withdraw: '📤 Keluarkan',
    depositGoalTitle: '+ Masuk Dana',
    depositPocketTitle: '+ Deposit Pocket Kawan',
    withdrawTitle: 'Keluarkan Dana',
    walletHint: (bal) => `${bal} · Baki dompet`,
    amountPlaceholder: 'Jumlah (RM)',
    errorInvalid: 'Sila masukkan jumlah yang sah.',
    errorInsufficient: (bal) => `Baki tidak mencukupi. Baki semasa: ${bal}`,
    errorExceedsBalance: (bal) => `Melebihi baki simpanan: ${bal}`,
    cancel: 'Batal',
    saveNow: 'Simpan Sekarang',
    withdrawNow: 'Keluarkan Sekarang',
    // Type selection modal
    choosePocketType: 'Pilih Jenis Poket',
    choosePocketDesc: 'Pilih antara dua pilihan poket untuk bantu kamu capai matlamat simpanan.',
    savingsPocketTitle: 'Savings Pocket',
    savingsPocketDesc: 'Jana 2.00% p.a. faedah setiap hari',
    savingsPocketLabel: 'Simpanan Fleksibel',
    bonusPocketTitle: 'Bonus Pocket',
    bonusPocketNew: 'BARU',
    bonusPocketDesc: 'Dapat sehingga 3.55% p.a. faedah atas simpanan kamu',
    bonusPocketLabel: 'Simpanan Terkunci + Faedah Bonus',
    // Flexible creation
    flexibleCreateTitle: 'Pocket Simpanan Baru',
    goalNamePlaceholder: 'Nama matlamat (contoh: iPhone 16)',
    goalTargetPlaceholder: 'Jumlah sasaran (RM) — pilihan',
    createPocket: 'Cipta Pocket',
    // Bonus creation
    bonusCreateTitle: 'Pocket Bonus Baru',
    bonusInfo1: 'Jana sehingga 3.55% p.a. faedah',
    bonusInfo2: 'Pilih tempoh simpanan kamu',
    bonusInfo3: 'Pengeluaran awal? Faedah asas tetap dikira',
    bonusGoalPlaceholder: 'Nama poket (contoh: Simpanan Bonus)',
    bonusDepositPlaceholder: 'Deposit awal (RM) — wajib',
    tenure3: '3 Bulan',
    tenure6: '6 Bulan',
    tenureLabel: 'Pilih Tempoh:',
    viewRates: 'Lihat kadar faedah',
    // Labels on card
    flexLabel: 'Simpanan Fleksibel',
    bonusLabel: 'Simpanan Terkunci + Faedah Bonus',
    interestRate: (r) => `${r}% p.a.`,
    tenureMonths: (n) => `${n} bulan`,
    lockedUntil: 'Terkunci hingga',
    earlyWithdrawNote: 'Pengeluaran awal — hanya faedah asas',
    bonusWithdrawWarn: '⚠️ Pengeluaran dari Bonus Pocket akan menghilangkan faedah bonus tambahan.',
    back: '← Kembali',
    newKawanPocket: 'Buat Pocket Kawan Baru',
    createKawanTitle: 'Pocket Kawan Baru',
    kawanNamePlaceholder: 'Nama pocket (cth: Trip Langkawi)',
    kawanGoalPlaceholder: 'Sasaran jumlah (RM)',
    kawanMembersLabel: 'Nama ahli:',
    addMember: '+ Tambah Ahli',
    memberPlaceholder: (n) => `Ahli ${n}`,
    memberContributions: 'Sumbangan Ahli',
    goalLabel: 'Sasaran:',
    yourContrib: 'Sumbangan',
    tapToView: 'Ketuk untuk lihat sumbangan',
  },
  en: {
    headerTitle: '💰 Pocket',
    walletBalance: 'Wallet Balance',
    mySavings: 'My Savings',
    friendPocket: 'Friend Pocket',
    activePockets: 'Active Pockets',
    tabSavings: '🏦 My Savings',
    tabFriends: '👥 Friend Pocket',
    target: 'Target:',
    noTarget: 'No target set',
    needMore: (amt) => `Need ${amt} more to reach goal`,
    goalReached: '🏆 Goal Reached!',
    newPocket: 'Create New Savings Pocket',
    needMorePocket: (amt) => `Need ${amt} more`,
    members: (n) => `${n} members`,
    splitBill: '🧾 Split Bill',
    deposit: '+ Deposit',
    fundIn: '💵 Fund In',
    withdraw: '📤 Withdraw',
    depositGoalTitle: '+ Fund In',
    depositPocketTitle: '+ Deposit Friend Pocket',
    withdrawTitle: 'Withdraw Funds',
    walletHint: (bal) => `${bal} · Wallet balance`,
    amountPlaceholder: 'Amount (RM)',
    errorInvalid: 'Please enter a valid amount.',
    errorInsufficient: (bal) => `Insufficient balance. Current: ${bal}`,
    errorExceedsBalance: (bal) => `Exceeds savings balance: ${bal}`,
    cancel: 'Cancel',
    saveNow: 'Save Now',
    withdrawNow: 'Withdraw Now',
    choosePocketType: 'Choose Pocket Type',
    choosePocketDesc: 'Choose from two pocket options to help you crush your saving goals.',
    savingsPocketTitle: 'Savings Pocket',
    savingsPocketDesc: 'Earn 2.00% p.a. interest every day',
    savingsPocketLabel: 'Flexible savings',
    bonusPocketTitle: 'Bonus Pocket',
    bonusPocketNew: 'NEW',
    bonusPocketDesc: 'Get up to 3.55% p.a. interest on your savings',
    bonusPocketLabel: 'Locked savings with bonus interest',
    flexibleCreateTitle: 'New Savings Pocket',
    goalNamePlaceholder: 'Goal name (e.g. iPhone 16)',
    goalTargetPlaceholder: 'Target amount (RM) — optional',
    createPocket: 'Create Pocket',
    bonusCreateTitle: 'New Bonus Pocket',
    bonusInfo1: 'Earn up to 3.55% p.a. interest',
    bonusInfo2: 'Pick your savings tenure',
    bonusInfo3: 'Withdraw early? You still earn the base interest',
    bonusGoalPlaceholder: 'Pocket name (e.g. Bonus Savings)',
    bonusDepositPlaceholder: 'Initial deposit (RM) — required',
    tenure3: '3 Months',
    tenure6: '6 Months',
    tenureLabel: 'Select Tenure:',
    viewRates: 'View interest rates and tenures',
    flexLabel: 'Flexible savings',
    bonusLabel: 'Locked savings with bonus interest',
    interestRate: (r) => `${r}% p.a.`,
    tenureMonths: (n) => `${n} months`,
    lockedUntil: 'Locked until',
    earlyWithdrawNote: 'Early withdrawal — base interest only',
    bonusWithdrawWarn: '⚠️ Withdrawing from Bonus Pocket will remove the extra bonus interest benefits.',
    back: '← Back',
    newKawanPocket: 'Create New Kawan Pocket',
    createKawanTitle: 'New Kawan Pocket',
    kawanNamePlaceholder: 'Pocket name (e.g. Langkawi Trip)',
    kawanGoalPlaceholder: 'Target amount (RM)',
    kawanMembersLabel: 'Member names:',
    addMember: '+ Add Member',
    memberPlaceholder: (n) => `Member ${n}`,
    memberContributions: 'Member Contributions',
    goalLabel: 'Goal:',
    yourContrib: 'Contributed',
    tapToView: 'Tap to view contributions',
  },
};

// ── Modal step constants ─────────────────────────────────────────────────────
const STEP_NONE = 'none';
const STEP_TYPE = 'type';
const STEP_FLEXIBLE = 'flexible';
const STEP_BONUS = 'bonus';

export default function PocketScreen({ navigation }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState('simpanan');
  const [goals, setGoals] = useState(() => getGoals().map((g) => ({ ...g })));
  const [pockets, setPockets] = useState(() => getPockets().map((p) => ({ ...p })));
  const [walletBalance, setWalletBalance] = useState(getCurrentUser().balance);

  // Deposit modal
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositType, setDepositType] = useState(null);
  const [depositItem, setDepositItem] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');

  // Withdraw modal
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawItem, setWithdrawItem] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // Create pocket multi-step modal
  const [createStep, setCreateStep] = useState(STEP_NONE);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newBonusName, setNewBonusName] = useState('');
  const [newBonusDeposit, setNewBonusDeposit] = useState('');
  const [newBonusTenure, setNewBonusTenure] = useState(3);

  // Kawan pocket detail + creation
  const [selectedPocket, setSelectedPocket] = useState(null);
  const [showCreateKawan, setShowCreateKawan] = useState(false);
  const [kawanName, setKawanName] = useState('');
  const [kawanGoal, setKawanGoal] = useState('');
  const [kawanMembers, setKawanMembers] = useState(['']);

  const refreshState = () => {
    setWalletBalance(getCurrentUser().balance);
    setGoals(getGoals().map((g) => ({ ...g })));
    setPockets(getPockets().map((p) => ({ ...p })));
  };

  useFocusEffect(
    useCallback(() => {
      refreshState();
    }, [])
  );

  const openDeposit = (type, item) => {
    setDepositType(type);
    setDepositItem(item);
    setDepositAmount('');
    setDepositError('');
    setShowDeposit(true);
  };

  const openWithdraw = (goal) => {
    setWithdrawItem(goal);
    setWithdrawAmount('');
    setWithdrawError('');
    setShowWithdraw(true);
  };

  const confirmDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) { setDepositError(t.errorInvalid); return; }
    if (amt > walletBalance) { setDepositError(t.errorInsufficient(formatCurrency(walletBalance))); return; }
    if (depositType === 'goal') depositToGoal(depositItem.id, amt);
    else depositToPocket(depositItem.id, amt);
    addTransaction({
      id: `dep_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      merchant: depositItem.name,
      amount: amt,
      type: 'debit',
      category: 'Savings',
    });
    refreshState();
    setShowDeposit(false);
    setDepositAmount('');
    setDepositError('');
  };

  const confirmWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) { setWithdrawError(t.errorInvalid); return; }
    if (amt > withdrawItem.current) { setWithdrawError(t.errorExceedsBalance(formatCurrency(withdrawItem.current))); return; }
    withdrawFromGoal(withdrawItem.id, amt);
    addTransaction({
      id: `wdraw_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      merchant: withdrawItem.name,
      amount: amt,
      type: 'credit',
      category: 'Savings',
    });
    refreshState();
    setShowWithdraw(false);
    setWithdrawAmount('');
    setWithdrawError('');
  };

  const handleAddFlexible = () => {
    if (!newGoalName.trim()) return;
    createGoal(newGoalName.trim(), newGoalTarget ? parseFloat(newGoalTarget) : null, '🎯');
    refreshState();
    setCreateStep(STEP_NONE);
    setNewGoalName('');
    setNewGoalTarget('');
  };

  const handleAddBonus = () => {
    const dep = parseFloat(newBonusDeposit);
    if (!newBonusName.trim() || !dep || dep <= 0) return;
    const daysToAdd = newBonusTenure === 3 ? 90 : 180;
    const lockedUntil = new Date();
    lockedUntil.setDate(lockedUntil.getDate() + daysToAdd);
    const newGoal = {
      id: `goal_${Date.now()}`,
      name: newBonusName.trim(),
      emoji: '💎',
      target: dep,
      current: dep,
      type: 'bonus',
      interestRate: 3.55,
      tenure: newBonusTenure,
      depositDate: new Date().toISOString().split('T')[0],
      lockedUntil: lockedUntil.toISOString().split('T')[0],
      autoSave: false,
      autoSaveAmount: 0,
      roundUp: false,
      deadline: null,
      colour: '#9C6FFF',
    };
    if (walletBalance >= dep) {
      const goals = getGoals();
      goals.push(newGoal);
    }
    refreshState();
    setCreateStep(STEP_NONE);
    setNewBonusName('');
    setNewBonusDeposit('');
    setNewBonusTenure(3);
  };

  const resetCreate = () => {
    setCreateStep(STEP_NONE);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewBonusName('');
    setNewBonusDeposit('');
    setNewBonusTenure(3);
  };

  const totalSavings = goals.reduce((s, g) => s + g.current, 0);
  const totalPocketSavings = pockets.reduce((s, p) => s + p.current, 0);

  const renderGoalCard = (goal) => {
    const hasTarget = goal.target !== null && goal.target !== undefined && goal.target > 0;
    const percent = hasTarget ? Math.min(100, (goal.current / goal.target) * 100) : null;
    const isCompleted = hasTarget && percent >= 100;
    const accent = goal.colour || COLORS.accent;
    const isBonus = goal.type === 'bonus';

    return (
      <View key={goal.id} style={[styles.envelopeCard, { borderColor: accent + '80' }]}>
        <View style={[styles.envelopeHeader, { borderBottomColor: accent + '30' }]}>
          <View style={[styles.envelopeIconBox, { backgroundColor: accent + '20' }]}>
            <Text style={styles.envelopeEmoji}>{goal.emoji}</Text>
          </View>
          <View style={styles.envelopeTitleBlock}>
            <Text style={styles.envelopeName}>{goal.name}</Text>
            <View style={[styles.typeTag, { backgroundColor: isBonus ? '#9C6FFF20' : accent + '18', borderColor: isBonus ? '#9C6FFF60' : accent + '40' }]}>
              <Text style={[styles.typeTagText, { color: isBonus ? '#9C6FFF' : accent }]}>
                {isBonus ? `🔒 ${t.bonusLabel}` : `✦ ${t.flexLabel}`}
              </Text>
            </View>
          </View>
          {hasTarget && percent !== null && (
            <View style={[styles.percentBadge, { backgroundColor: accent + '20' }]}>
              <Text style={[styles.percentText, { color: accent }]}>{formatPercent(percent)}</Text>
            </View>
          )}
        </View>

        {isBonus && (
          <View style={[styles.bonusInfoRow, { borderBottomColor: accent + '20' }]}>
            <View style={styles.bonusInfoItem}>
              <Text style={styles.bonusInfoLabel}>{t.interestRate(goal.interestRate)}</Text>
              <Text style={styles.bonusInfoSub}>p.a. bonus</Text>
            </View>
            <View style={styles.bonusInfoDivider} />
            <View style={styles.bonusInfoItem}>
              <Text style={styles.bonusInfoLabel}>{t.tenureMonths(goal.tenure)}</Text>
              <Text style={styles.bonusInfoSub}>{t.lockedUntil}</Text>
            </View>
            {goal.lockedUntil && (
              <>
                <View style={styles.bonusInfoDivider} />
                <View style={styles.bonusInfoItem}>
                  <Text style={styles.bonusInfoLabel}>{goal.lockedUntil}</Text>
                  <Text style={styles.bonusInfoSub}>{t.lockedUntil}</Text>
                </View>
              </>
            )}
          </View>
        )}

        <View style={styles.envelopeBody}>
          <Text style={[styles.envelopeAmount, { color: accent }]}>
            {formatCurrency(goal.current)}
          </Text>
          {hasTarget && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: accent }]} />
            </View>
          )}
          {hasTarget && !isCompleted && (
            <Text style={styles.remainingText}>
              {t.needMore(formatCurrency(goal.target - goal.current))}
            </Text>
          )}
          {hasTarget && isCompleted && !isBonus && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>{t.goalReached}</Text>
            </View>
          )}
          {isBonus && (
            <Text style={styles.earlyWithdrawNote}>{t.earlyWithdrawNote}</Text>
          )}
        </View>

        <View style={styles.cardBtns}>
          {!isBonus && !isCompleted && (
            <TouchableOpacity
              style={[styles.fundInBtn, { backgroundColor: accent }]}
              onPress={() => openDeposit('goal', goal)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnTextWhite}>{t.fundIn}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.withdrawBtn, { borderColor: accent + '60' }]}
            onPress={() => openWithdraw(goal)}
            activeOpacity={0.8}
          >
            <Text style={[styles.withdrawBtnText, { color: accent }]}>{t.withdraw}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        {navigation.canGoBack() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>
        ) : <View style={styles.headerSpacer} />}
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balancePillLabel}>{t.walletBalance}</Text>
          <Text style={styles.balancePillAmt}>{formatCurrency(walletBalance)}</Text>
        </View>
      </View>

      {/* ── Summary card ── */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t.mySavings}</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalSavings)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t.friendPocket}</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalPocketSavings)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t.activePockets}</Text>
          <Text style={styles.summaryAmount}>{goals.length + pockets.length}</Text>
        </View>
      </View>

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'simpanan' && styles.tabActive]}
          onPress={() => setActiveTab('simpanan')}
        >
          <Text style={[styles.tabText, activeTab === 'simpanan' && styles.tabTextActive]}>
            {t.tabSavings}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'kawan' && styles.tabActive]}
          onPress={() => setActiveTab('kawan')}
        >
          <Text style={[styles.tabText, activeTab === 'kawan' && styles.tabTextActive]}>
            {t.tabFriends}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'simpanan' ? (
          <>
            {goals.map((goal) => renderGoalCard(goal))}

            <TouchableOpacity
              style={styles.addCard}
              onPress={() => setCreateStep(STEP_TYPE)}
              activeOpacity={0.8}
            >
              <Text style={styles.addCardPlus}>＋</Text>
              <Text style={styles.addCardText}>{t.newPocket}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {pockets.map((pocket) => {
              const percent = Math.min(100, (pocket.current / pocket.goal) * 100);
              return (
                <View key={pocket.id} style={[styles.envelopeCard, { borderColor: COLORS.accent + '60' }]}>
                  <TouchableOpacity
                    style={[styles.envelopeHeader, { borderBottomColor: COLORS.accent + '30' }]}
                    onPress={() => setSelectedPocket(pocket)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.envelopeIconBox, { backgroundColor: COLORS.accent + '20' }]}>
                      <Text style={styles.envelopeEmoji}>{pocket.emoji}</Text>
                    </View>
                    <View style={styles.envelopeTitleBlock}>
                      <Text style={styles.envelopeName}>{pocket.name}</Text>
                      <Text style={[styles.envelopeTarget, { color: COLORS.accent }]}>{t.tapToView}</Text>
                    </View>
                    <View style={[styles.percentBadge, { backgroundColor: COLORS.accent + '20' }]}>
                      <Text style={[styles.percentText, { color: COLORS.accent }]}>{formatPercent(percent)}</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.envelopeBody}>
                    <Text style={[styles.envelopeAmount, { color: COLORS.accent }]}>
                      {formatCurrency(pocket.current)}
                    </Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: COLORS.accent }]} />
                    </View>
                    <Text style={styles.remainingText}>
                      {t.needMorePocket(formatCurrency(pocket.goal - pocket.current))}
                    </Text>
                  </View>

                  <View style={styles.membersRow}>
                    {pocket.members.slice(0, 4).map((m) => (
                      <View key={m.id} style={[styles.memberBubble, { backgroundColor: m.colour }]}>
                        <Text style={styles.memberInitials}>{m.initials}</Text>
                      </View>
                    ))}
                    {pocket.members.length > 4 && (
                      <View style={[styles.memberBubble, { backgroundColor: COLORS.surfaceHigh }]}>
                        <Text style={styles.memberInitials}>+{pocket.members.length - 4}</Text>
                      </View>
                    )}
                    <Text style={styles.memberCountText}>{t.members(pocket.members.length)}</Text>
                  </View>

                  <View style={styles.pocketActions}>
                    <TouchableOpacity
                      style={styles.pocketBtnSecondary}
                      onPress={() => navigation.navigate('BillSplit')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.pocketBtnSecondaryText}>{t.splitBill}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.pocketBtnPrimary}
                      onPress={() => openDeposit('pocket', pocket)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.btnTextWhite}>{t.deposit}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.addCard}
              onPress={() => setShowCreateKawan(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.addCardPlus}>＋</Text>
              <Text style={styles.addCardText}>{t.newKawanPocket}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* ── Deposit Modal ── */}
      <Modal visible={showDeposit} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {depositType === 'goal' ? t.depositGoalTitle : t.depositPocketTitle}
              </Text>
              {depositItem && (
                <Text style={styles.modalSubtitle}>
                  {depositItem.name} · {t.walletHint(formatCurrency(walletBalance))}
                </Text>
              )}
              <TextInput
                style={styles.modalInput}
                placeholder={t.amountPlaceholder}
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                returnKeyType="done"
                value={depositAmount}
                onChangeText={(v) => { setDepositAmount(v); setDepositError(''); }}
              />
              {depositError !== '' && <Text style={styles.errorText}>{depositError}</Text>}
              <View style={styles.quickAmounts}>
                {['20', '50', '100', '200'].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.quickAmt, depositAmount === amt && styles.quickAmtActive]}
                    onPress={() => { setDepositAmount(amt); setDepositError(''); }}
                  >
                    <Text style={[styles.quickAmtText, depositAmount === amt && styles.quickAmtTextActive]}>
                      RM{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalSecondary}
                  onPress={() => { setShowDeposit(false); setDepositAmount(''); setDepositError(''); }}
                >
                  <Text style={styles.modalSecondaryText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalPrimary} onPress={confirmDeposit}>
                  <Text style={styles.modalPrimaryText}>{t.saveNow}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Withdraw Modal ── */}
      <Modal visible={showWithdraw} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t.withdrawTitle}</Text>
              {withdrawItem && (
                <Text style={styles.modalSubtitle}>
                  {withdrawItem.name} · {formatCurrency(withdrawItem.current)} {lang === 'bm' ? 'tersedia' : 'available'}
                </Text>
              )}
              {withdrawItem?.type === 'bonus' && (
                <View style={styles.bonusWithdrawWarning}>
                  <Text style={styles.bonusWithdrawWarningText}>{t.bonusWithdrawWarn}</Text>
                </View>
              )}
              <TextInput
                style={styles.modalInput}
                placeholder={t.amountPlaceholder}
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                returnKeyType="done"
                value={withdrawAmount}
                onChangeText={(v) => { setWithdrawAmount(v); setWithdrawError(''); }}
              />
              {withdrawError !== '' && <Text style={styles.errorText}>{withdrawError}</Text>}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalSecondary}
                  onPress={() => { setShowWithdraw(false); setWithdrawAmount(''); setWithdrawError(''); }}
                >
                  <Text style={styles.modalSecondaryText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalPrimary, { backgroundColor: COLORS.warning }]} onPress={confirmWithdraw}>
                  <Text style={styles.modalPrimaryText}>{t.withdrawNow}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Type Selection Modal ── */}
      <Modal visible={createStep === STEP_TYPE} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.choosePocketType}</Text>
            
            <Text style={styles.modalSubtitle}>{t.choosePocketDesc}</Text>

            {/* Savings Pocket (Flexible) */}
            <TouchableOpacity
              style={styles.typeCard}
              onPress={() => setCreateStep(STEP_FLEXIBLE)}
              activeOpacity={0.85}
            >
              <View style={styles.typeCardIcon}>
                <Text style={{ fontSize: 24 }}>🏦</Text>
              </View>
              <View style={styles.typeCardText}>
                <Text style={styles.typeCardTitle}>{t.savingsPocketTitle}</Text>
                <Text style={styles.typeCardDesc}>{t.savingsPocketDesc}</Text>
              </View>
              <Text style={styles.typeCardArrow}>›</Text>
            </TouchableOpacity>

            {/* Bonus Pocket (Locked) */}
            <TouchableOpacity
              style={[styles.typeCard, styles.typeCardBonus]}
              onPress={() => setCreateStep(STEP_BONUS)}
              activeOpacity={0.85}
            >
              <View style={[styles.typeCardIcon, { backgroundColor: '#9C6FFF25' }]}>
                <Text style={{ fontSize: 24 }}>💎</Text>
              </View>
              <View style={styles.typeCardText}>
                <View style={styles.typeCardTitleRow}>
                  <Text style={styles.typeCardTitle}>{t.bonusPocketTitle}</Text>
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>{t.bonusPocketNew}</Text>
                  </View>
                </View>
                <Text style={styles.typeCardDesc}>{t.bonusPocketDesc}</Text>
              </View>
              <Text style={styles.typeCardArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalSecondary, { flex: 0 }]} onPress={resetCreate}>
              <Text style={styles.modalSecondaryText}>{t.back}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Flexible Creation Modal ── */}
      <Modal visible={createStep === STEP_FLEXIBLE} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t.flexibleCreateTitle}</Text>
              <TextInput
                style={styles.modalInput}
                placeholder={t.goalNamePlaceholder}
                placeholderTextColor={COLORS.textLight}
                returnKeyType="next"
                value={newGoalName}
                onChangeText={setNewGoalName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder={t.goalTargetPlaceholder}
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                returnKeyType="done"
                value={newGoalTarget}
                onChangeText={setNewGoalTarget}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalSecondary} onPress={() => setCreateStep(STEP_TYPE)}>
                  <Text style={styles.modalSecondaryText}>{t.back}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalPrimary} onPress={handleAddFlexible}>
                  <Text style={styles.modalPrimaryText}>{t.createPocket}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Bonus Creation Modal ── */}
      <Modal visible={createStep === STEP_BONUS} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t.bonusCreateTitle}</Text>

              {/* Info bullets */}
              <View style={styles.bonusInfoBox}>
                <Text style={styles.bonusInfoBullet}>✦ {t.bonusInfo1}</Text>
                <Text style={styles.bonusInfoBullet}>✦ {t.bonusInfo2}</Text>
                <Text style={styles.bonusInfoBullet}>✦ {t.bonusInfo3}</Text>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder={t.bonusGoalPlaceholder}
                placeholderTextColor={COLORS.textLight}
                returnKeyType="next"
                value={newBonusName}
                onChangeText={setNewBonusName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder={t.bonusDepositPlaceholder}
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                returnKeyType="done"
                value={newBonusDeposit}
                onChangeText={setNewBonusDeposit}
              />

              {/* Tenure selection */}
              <Text style={styles.tenureLabel}>{t.tenureLabel}</Text>
              <View style={styles.tenureRow}>
                <TouchableOpacity
                  style={[styles.tenureBtn, newBonusTenure === 3 && styles.tenureBtnActive]}
                  onPress={() => setNewBonusTenure(3)}
                >
                  <Text style={[styles.tenureBtnText, newBonusTenure === 3 && styles.tenureBtnTextActive]}>
                    {t.tenure3}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tenureBtn, newBonusTenure === 6 && styles.tenureBtnActive]}
                  onPress={() => setNewBonusTenure(6)}
                >
                  <Text style={[styles.tenureBtnText, newBonusTenure === 6 && styles.tenureBtnTextActive]}>
                    {t.tenure6}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalSecondary} onPress={() => setCreateStep(STEP_TYPE)}>
                  <Text style={styles.modalSecondaryText}>{t.back}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalPrimary, { backgroundColor: '#9C6FFF' }]} onPress={handleAddBonus}>
                  <Text style={styles.modalPrimaryText}>{t.createPocket}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Member Contribution Detail Modal ── */}
      <Modal visible={!!selectedPocket} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedPocket && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedPocket.emoji} {selectedPocket.name}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {t.goalLabel} {formatCurrency(selectedPocket.goal)} · {formatCurrency(selectedPocket.current)} {lang === 'bm' ? 'terkumpul' : 'collected'}
                </Text>
                <Text style={[styles.modalSubtitle, { marginBottom: 14, fontWeight: '800', color: COLORS.textPrimary }]}>
                  {t.memberContributions}
                </Text>
                {selectedPocket.members.map((m) => {
                  const memberPercent = selectedPocket.current > 0
                    ? Math.round((m.contribution / selectedPocket.current) * 100)
                    : 0;
                  return (
                    <View key={m.id} style={styles.memberContribRow}>
                      <View style={[styles.memberBubble, { backgroundColor: m.colour, marginRight: 10 }]}>
                        <Text style={styles.memberInitials}>{m.initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={styles.memberContribName}>{m.name}</Text>
                          <Text style={[styles.memberContribName, { color: COLORS.accent }]}>
                            {formatCurrency(m.contribution)} ({memberPercent}%)
                          </Text>
                        </View>
                        <View style={styles.memberContribTrack}>
                          <View style={[styles.memberContribFill, { width: `${memberPercent}%`, backgroundColor: m.colour }]} />
                        </View>
                      </View>
                    </View>
                  );
                })}
                <TouchableOpacity
                  style={[styles.modalPrimary, { marginTop: 16 }]}
                  onPress={() => setSelectedPocket(null)}
                >
                  <Text style={styles.modalPrimaryText}>{lang === 'bm' ? 'Tutup' : 'Close'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Create Kawan Pocket Modal ── */}
      <Modal visible={showCreateKawan} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t.createKawanTitle}</Text>
              <TextInput
                style={styles.modalInput}
                placeholder={t.kawanNamePlaceholder}
                placeholderTextColor={COLORS.textLight}
                returnKeyType="next"
                value={kawanName}
                onChangeText={setKawanName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder={t.kawanGoalPlaceholder}
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
                returnKeyType="next"
                value={kawanGoal}
                onChangeText={setKawanGoal}
              />
              <Text style={[styles.modalSubtitle, { marginBottom: 8, fontWeight: '700' }]}>{t.kawanMembersLabel}</Text>
              {kawanMembers.map((member, idx) => (
                <TextInput
                  key={idx}
                  style={styles.modalInput}
                  placeholder={t.memberPlaceholder(idx + 1)}
                  placeholderTextColor={COLORS.textLight}
                  returnKeyType="next"
                  value={member}
                  onChangeText={(v) => {
                    const updated = [...kawanMembers];
                    updated[idx] = v;
                    setKawanMembers(updated);
                  }}
                />
              ))}
              {kawanMembers.length < 5 && (
                <TouchableOpacity
                  style={[styles.modalSecondary, { flex: 0, marginBottom: 12 }]}
                  onPress={() => setKawanMembers([...kawanMembers, ''])}
                >
                  <Text style={styles.modalSecondaryText}>{t.addMember}</Text>
                </TouchableOpacity>
              )}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalSecondary}
                  onPress={() => { setShowCreateKawan(false); setKawanName(''); setKawanGoal(''); setKawanMembers(['']); }}
                >
                  <Text style={styles.modalSecondaryText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalPrimary}
                  onPress={() => {
                    if (!kawanName.trim() || !kawanGoal) return;
                    const validMembers = kawanMembers.filter((m) => m.trim());
                    createPocket(kawanName.trim(), kawanGoal, validMembers);
                    refreshState();
                    setShowCreateKawan(false);
                    setKawanName('');
                    setKawanGoal('');
                    setKawanMembers(['']);
                  }}
                >
                  <Text style={styles.modalPrimaryText}>{t.createPocket}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 18,
  },
  backBtn: { padding: 4 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerSpacer: { width: 70 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  balancePill: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
  },
  balancePillLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  balancePillAmt: { fontSize: 15, color: '#fff', fontWeight: '800' },

  summaryCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    marginHorizontal: 16, marginTop: 16, borderRadius: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: COLORS.border },
  summaryLabel: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 4, fontWeight: '500' },
  summaryAmount: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary },

  tabBar: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 14,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '800' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 100 },

  envelopeCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1.5,
    marginBottom: 14, overflow: 'hidden',
  },
  envelopeHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1,
  },
  envelopeIconBox: {
    width: 48, height: 48, borderRadius: 14, alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  envelopeEmoji: { fontSize: 24 },
  envelopeTitleBlock: { flex: 1 },
  envelopeName: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  typeTag: {
    alignSelf: 'flex-start', borderRadius: 6, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  typeTagText: { fontSize: 10, fontWeight: '700' },
  envelopeTarget: { fontSize: 11, color: COLORS.textSecondary, marginTop: 3 },
  percentBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  percentText: { fontSize: 14, fontWeight: '900' },

  bonusInfoRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, backgroundColor: '#9C6FFF10',
  },
  bonusInfoItem: { flex: 1, alignItems: 'center' },
  bonusInfoLabel: { fontSize: 13, fontWeight: '800', color: '#9C6FFF' },
  bonusInfoSub: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2 },
  bonusInfoDivider: { width: 1, backgroundColor: COLORS.border },

  envelopeBody: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  envelopeAmount: { fontSize: 28, fontWeight: '900', marginBottom: 12 },
  progressTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  remainingText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8 },
  earlyWithdrawNote: { fontSize: 11, color: COLORS.warning, marginTop: 6, fontStyle: 'italic' },
  completedBadge: {
    marginTop: 8, backgroundColor: COLORS.success + '20', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  completedText: { fontSize: 12, fontWeight: '700', color: COLORS.success },

  cardBtns: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 16 },
  fundInBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  withdrawBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1.5, backgroundColor: 'transparent',
  },
  withdrawBtnText: { fontWeight: '800', fontSize: 14 },
  btnTextWhite: { color: '#fff', fontWeight: '800', fontSize: 14 },

  membersRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 6,
  },
  memberBubble: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  memberInitials: { fontSize: 11, color: '#fff', fontWeight: '800' },
  memberCountText: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 4, fontWeight: '600' },

  pocketActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 16 },
  pocketBtnSecondary: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center',
  },
  pocketBtnSecondaryText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 13 },
  pocketBtnPrimary: {
    flex: 1, backgroundColor: COLORS.accent, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },

  addCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1.5,
    borderColor: COLORS.border, padding: 20, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 14,
  },
  addCardPlus: { fontSize: 22, color: COLORS.accent, fontWeight: '700' },
  addCardText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '700' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 14 },
  modalInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary, marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  errorText: { fontSize: 12, color: COLORS.danger, marginBottom: 8, marginTop: -4 },
  quickAmounts: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickAmt: {
    flex: 1, backgroundColor: COLORS.background, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
  },
  quickAmtActive: { backgroundColor: COLORS.primary + '25', borderColor: COLORS.primary },
  quickAmtText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  quickAmtTextActive: { color: COLORS.primary },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalSecondary: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.textSecondary,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  modalSecondaryText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  modalBack: { color: '#fff', fontWeight: '700', fontSize: 15 },

  modalPrimary: {
    flex: 1, backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  modalPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  bonusWithdrawWarning: {
    backgroundColor: COLORS.warning + '18', borderRadius: 10, padding: 10, marginBottom: 12,
  },
  bonusWithdrawWarningText: { fontSize: 12, color: COLORS.warning, fontWeight: '600' },

  // Type selection cards
  typeCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background,
    borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border,
  },
  typeCardBonus: { borderColor: '#9C6FFF60' },
  typeCardIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.primary + '20',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  typeCardText: { flex: 1 },
  typeCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  typeCardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  typeCardDesc: { fontSize: 12, color: COLORS.textSecondary },
  typeCardArrow: { fontSize: 20, color: COLORS.textSecondary, marginLeft: 8 },
  newBadge: {
    backgroundColor: COLORS.danger, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  newBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  // Bonus creation
  bonusInfoBox: {
    backgroundColor: '#9C6FFF18', borderRadius: 12, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: '#9C6FFF30',
  },
  bonusInfoBullet: { fontSize: 13, color: '#9C6FFF', fontWeight: '600', marginBottom: 4 },
  tenureLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8 },
  tenureRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  tenureBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.background,
  },
  tenureBtnActive: { backgroundColor: '#9C6FFF25', borderColor: '#9C6FFF' },
  tenureBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  tenureBtnTextActive: { color: '#9C6FFF' },

  memberContribRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  memberContribName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  memberContribTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4,
    overflow: 'hidden',
  },
  memberContribFill: { height: '100%', borderRadius: 4 },
});
