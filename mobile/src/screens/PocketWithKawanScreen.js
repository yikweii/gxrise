import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { COLORS } from '../constants/colours';
import { formatCurrency, formatPercent, formatDaysRemaining, formatRelativeDate } from '../utils/formatters';
import { getAllPockets, deductFromPocket, depositToPocket, createPocket, getCurrentUser } from '../services/mockData';
import { useLang } from '../context/LangContext';

const MILESTONES = [25, 50, 75, 100];

const TRANSLATIONS = {
  bm: {
    back: '←',
    headerTitle: 'Pocket Kawan',
    subtitle: 'Simpan bersama kawan untuk matlamat bersama',
    members: (n) => `${n} ahli`,
    billSplitTitle: 'Bahagi Bil Bersama',
    billSplitDesc: 'Imbas resit & split secara adil antara kawan',
    complete: 'lengkap',
    milestoneNudge: (amt, pct) => `${amt} lagi untuk capai ${pct}% milestone!`,
    deposit: 'Deposit',
    withdraw: 'Tarik Diri',
    deductFromPocket: '💸 Potongan dari Poket',
    splitBill: 'Bahagi Bil',
    membersTitle: (n) => `Ahli Pocket (${n})`,
    recentActivity: 'Aktiviti Terkini',
    depositAction: 'deposit',
    depositModalTitle: 'Deposit ke Pocket',
    depositModalDesc: (name) => `Deposit kamu akan ditambah ke pocket kumpulan ${name}.`,
    amountPlaceholder: 'Jumlah (RM)',
    cancel: 'Batal',
    depositNow: 'Deposit Sekarang',
    withdrawModalTitle: 'Permintaan Pengeluaran',
    withdrawModalDesc: 'Pengeluaran memerlukan kelulusan daripada semua ahli pocket.',
    withdrawPlaceholder: 'Sebab pengeluaran...',
    approvalNote: (n) => `ℹ️ Semua ${n} ahli perlu luluskan dalam 48 jam`,
    sendRequest: 'Hantar Permintaan',
    deductModalTitle: 'Potongan dari Poket',
    deductModalDesc: (name) => `Jumlah akan dipotong serta-merta dari pocket ${name}.`,
    deductNow: 'Potong Sekarang',
    unpaidLabel: 'Belum Bayar',
    unpaidSince: 'Sejak',
    unpaidAmount: (amt) => `${amt} belum diselesaikan`,
    billCompleteTitle: '🎉 Bil Selesai!',
    billCompleteDesc: 'Semua ahli telah membayar.',
    backToPocket: '← Kembali ke Pocket',
    createNewPocket: '+ Cipta Pocket Baru',
    // Create modal
    newPocketTitle: 'Pocket Baru',
    pocketNamePlaceholder: 'Nama pocket (contoh: Trip Langkawi)',
    pocketGoalPlaceholder: 'Sasaran (RM) — pilihan',
    inviteTitle: 'Jemput Peserta',
    invitePlaceholder: 'No. telefon (+601x-xxxxxxxx)',
    addPhone: '+ Tambah',
    phoneError: 'Format nombor telefon tidak sah.',
    invited: (n) => `${n} dijemput`,
    create: 'Cipta Pocket',
  },
  en: {
    back: '←',
    headerTitle: 'Pocket with Friends',
    subtitle: 'Save together with friends for shared goals',
    members: (n) => `${n} members`,
    billSplitTitle: 'Split Bill Together',
    billSplitDesc: 'Scan receipt & split fairly among friends',
    complete: 'complete',
    milestoneNudge: (amt, pct) => `${amt} more to reach ${pct}% milestone!`,
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    deductFromPocket: '💸 Deduct from Pocket',
    splitBill: 'Split Bill',
    membersTitle: (n) => `Pocket Members (${n})`,
    recentActivity: 'Recent Activity',
    depositAction: 'deposited',
    depositModalTitle: 'Deposit to Pocket',
    depositModalDesc: (name) => `Your deposit will be added to the ${name} group pocket.`,
    amountPlaceholder: 'Amount (RM)',
    cancel: 'Cancel',
    depositNow: 'Deposit Now',
    withdrawModalTitle: 'Withdrawal Request',
    withdrawModalDesc: 'Withdrawal requires approval from all pocket members.',
    withdrawPlaceholder: 'Reason for withdrawal...',
    approvalNote: (n) => `ℹ️ All ${n} members must approve within 48 hours`,
    sendRequest: 'Send Request',
    deductModalTitle: 'Deduct from Pocket',
    deductModalDesc: (name) => `The amount will be deducted immediately from the ${name} pocket.`,
    deductNow: 'Deduct Now',
    unpaidLabel: 'Unpaid',
    unpaidSince: 'Since',
    unpaidAmount: (amt) => `${amt} outstanding`,
    billCompleteTitle: '🎉 Bill Complete!',
    billCompleteDesc: 'All members have paid.',
    backToPocket: '← Back to Pocket',
    createNewPocket: '+ Create New Pocket',
    newPocketTitle: 'New Pocket',
    pocketNamePlaceholder: 'Pocket name (e.g. Langkawi Trip)',
    pocketGoalPlaceholder: 'Goal amount (RM) — optional',
    inviteTitle: 'Invite Participants',
    invitePlaceholder: 'Phone number (+601x-xxxxxxxx)',
    addPhone: '+ Add',
    phoneError: 'Invalid phone number format.',
    invited: (n) => `${n} invited`,
    create: 'Create Pocket',
  },
};

const PHONE_RE = /^(\+?60|0)1[0-9]-?[0-9]{7,8}$/;

// ── Pocket list view ─────────────────────────────────────────────────────────
function PocketListScreen({ navigation, onSelectPocket }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const [pockets, setPockets] = useState(() => getAllPockets());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [invitedPhones, setInvitedPhones] = useState([]);

  const addPhone = () => {
    const num = phoneInput.trim().replace(/\s+/g, '');
    if (!PHONE_RE.test(num)) { setPhoneError(t.phoneError); return; }
    if (!invitedPhones.includes(num)) setInvitedPhones((prev) => [...prev, num]);
    setPhoneInput('');
    setPhoneError('');
  };

  const removePhone = (num) => setInvitedPhones((prev) => prev.filter((p) => p !== num));

  const handleCreate = () => {
    if (!newName) return;
    const pocket = createPocket(newName, newGoal, invitedPhones);
    setPockets(getAllPockets());
    setNewName('');
    setNewGoal('');
    setPhoneInput('');
    setInvitedPhones([]);
    setPhoneError('');
    setShowCreateModal(false);
  };

  const resetCreate = () => {
    setShowCreateModal(false);
    setNewName('');
    setNewGoal('');
    setPhoneInput('');
    setInvitedPhones([]);
    setPhoneError('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.listPad}>
          <Text style={styles.listSubtitle}>{t.subtitle}</Text>

          {pockets.map((pocket) => {
            const percent = Math.min(100, (pocket.current / pocket.goal) * 100);
            // Show unpaid badge if pocket has pendingDeduction
            const hasPending = pocket.pendingDeduction && pocket.pendingDeduction.amount > 0;
            return (
              <TouchableOpacity
                key={pocket.id}
                style={styles.pocketListCard}
                onPress={() => onSelectPocket(pocket)}
                activeOpacity={0.85}
              >
                <View style={styles.pocketListHeader}>
                  <View style={[styles.pocketListEmoji, { backgroundColor: COLORS.primary + '25' }]}>
                    <Text style={{ fontSize: 28 }}>{pocket.emoji}</Text>
                  </View>
                  <View style={styles.pocketListInfo}>
                    <Text style={styles.pocketListName}>{pocket.name}</Text>
                    <Text style={styles.pocketListDeadline}>{formatDaysRemaining(pocket.deadline, lang)}</Text>
                  </View>
                  <Text style={styles.pocketListPercent}>{formatPercent(percent)}</Text>
                </View>

                <View style={styles.pocketListTrack}>
                  <View style={[styles.pocketListFill, { width: `${percent}%` }]} />
                </View>

                <View style={styles.pocketListFooter}>
                  <Text style={styles.pocketListAmt}>
                    {formatCurrency(pocket.current)}
                    <Text style={styles.pocketListGoal}> / {formatCurrency(pocket.goal)}</Text>
                  </Text>
                  <View style={styles.pocketListAvatars}>
                    {pocket.members.slice(0, 4).map((m, i) => (
                      <View
                        key={m.id}
                        style={[styles.miniAvatar, { backgroundColor: m.colour, marginLeft: i === 0 ? 0 : -6 }]}
                      >
                        <Text style={styles.miniAvatarText}>{m.initials}</Text>
                      </View>
                    ))}
                    <Text style={styles.pocketMemberCount}>{t.members(pocket.members.length)}</Text>
                  </View>
                </View>

                {hasPending && (
                  <View style={styles.unpaidBanner}>
                    <Text style={styles.unpaidBannerText}>
                      ⚠️ {t.unpaidAmount(formatCurrency(pocket.pendingDeduction.amount))} · {t.unpaidSince} {pocket.pendingDeduction.date}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Bill Split CTA */}
          <TouchableOpacity
            style={styles.billSplitCTA}
            onPress={() => navigation.navigate('BillSplit')}
            activeOpacity={0.85}
          >
            <Text style={styles.billSplitIcon}>🧾</Text>
            <View style={styles.billSplitText}>
              <Text style={styles.billSplitTitle}>{t.billSplitTitle}</Text>
              <Text style={styles.billSplitDesc}>{t.billSplitDesc}</Text>
            </View>
            <Text style={styles.billSplitArrow}>→</Text>
          </TouchableOpacity>

          {/* Create New Pocket card */}
          <TouchableOpacity
            style={styles.createCard}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.createCardPlus}>＋</Text>
            <Text style={styles.createCardText}>{t.createNewPocket}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Create Pocket Modal ── */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.newPocketTitle}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t.pocketNamePlaceholder}
              placeholderTextColor={COLORS.textLight}
              returnKeyType="next"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder={t.pocketGoalPlaceholder}
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              returnKeyType="done"
              value={newGoal}
              onChangeText={setNewGoal}
            />

            <Text style={styles.inviteLabel}>{t.inviteTitle}</Text>
            <View style={styles.phoneRow}>
              <TextInput
                style={[styles.modalInput, styles.phoneInput]}
                placeholder={t.invitePlaceholder}
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
                returnKeyType="done"
                value={phoneInput}
                onChangeText={(v) => { setPhoneInput(v); setPhoneError(''); }}
                onSubmitEditing={addPhone}
              />
              <TouchableOpacity style={styles.addPhoneBtn} onPress={addPhone}>
                <Text style={styles.addPhoneBtnText}>{t.addPhone}</Text>
              </TouchableOpacity>
            </View>
            {phoneError !== '' && <Text style={styles.phoneErrorText}>{phoneError}</Text>}
            {invitedPhones.length > 0 && (
              <View style={styles.invitedList}>
                {invitedPhones.map((num) => (
                  <View key={num} style={styles.invitedChip}>
                    <Text style={styles.invitedNum}>{num}</Text>
                    <TouchableOpacity onPress={() => removePhone(num)} style={styles.removePhoneBtn}>
                      <Text style={styles.removePhoneBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <Text style={styles.invitedCount}>{t.invited(invitedPhones.length)}</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondary} onPress={resetCreate}>
                <Text style={styles.modalSecondaryText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimary} onPress={handleCreate}>
                <Text style={styles.modalPrimaryText}>{t.create}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Pocket detail view ───────────────────────────────────────────────────────
function PocketDetailScreen({ pocket: initialPocket, navigation, onBack }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const [pocket, setPocket] = useState(initialPocket);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [deductAmount, setDeductAmount] = useState('');

  const percent = Math.min(100, (pocket.current / pocket.goal) * 100);
  const daysRemaining = formatDaysRemaining(pocket.deadline, lang);
  const nextMilestone = MILESTONES.find((m) => m > percent);
  const toNextMilestone = nextMilestone
    ? Math.ceil(pocket.goal * (nextMilestone / 100) - pocket.current)
    : 0;

  // Bill is "complete" when all members have each contributed their equal share
  const isBillComplete = pocket.current >= pocket.goal;

  const confirmDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;
    depositToPocket(pocket.id, amt);
    setPocket((p) => ({ ...p, current: Math.min(p.goal, p.current + amt) }));
    setShowDepositModal(false);
    setDepositAmount('');
  };

  const confirmDeduct = () => {
    const amt = parseFloat(deductAmount);
    if (!amt || amt <= 0) return;
    deductFromPocket(pocket.id, amt);
    setPocket((p) => ({
      ...p,
      current: Math.max(0, p.current - amt),
    }));
    setShowDeductModal(false);
    setDeductAmount('');
  };

  const handleBackWithPendingDeduction = () => {
    const amt = parseFloat(deductAmount);
    if (amt && amt > 0) {
      // Record as pending/unpaid on the pocket
      setPocket((p) => ({
        ...p,
        pendingDeduction: { amount: amt, date: new Date().toISOString().split('T')[0] },
      }));
    }
    setShowDeductModal(false);
    setDeductAmount('');
    onBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{pocket.name}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('BillSplit')}>
          <Text style={styles.newText}>{t.splitBill}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero card ── */}
        <View style={styles.pocketHeroCard}>
          <Text style={styles.pocketEmoji}>{pocket.emoji}</Text>
          <Text style={styles.pocketName}>{pocket.name}</Text>
          <Text style={styles.pocketDeadline}>{daysRemaining}</Text>

          <View style={styles.progressSection}>
            <View style={styles.percentRow}>
              <Text style={styles.percentValue}>{formatPercent(percent)}</Text>
              <Text style={styles.percentLabel}>{t.complete}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${percent}%` }]} />
              {MILESTONES.filter((m) => m <= 100).map((m) => (
                <View
                  key={m}
                  style={[
                    styles.milestone,
                    { left: `${m}%`, backgroundColor: m <= percent ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)' },
                  ]}
                />
              ))}
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.currentAmt}>{formatCurrency(pocket.current)}</Text>
              <Text style={styles.goalAmt}>/ {formatCurrency(pocket.goal)}</Text>
            </View>
          </View>
        </View>

        {/* ── Milestone nudge ── */}
        {nextMilestone && !isBillComplete && (
          <View style={styles.milestoneCard}>
            <Text style={styles.milestoneIcon}>🎯</Text>
            <Text style={styles.milestoneText}>
              {t.milestoneNudge(formatCurrency(toNextMilestone), nextMilestone)}
            </Text>
          </View>
        )}

        {/* ── Bill complete banner ── */}
        {isBillComplete && (
          <View style={styles.billCompleteBanner}>
            <Text style={styles.billCompleteTitle}>{t.billCompleteTitle}</Text>
            <Text style={styles.billCompleteDesc}>{t.billCompleteDesc}</Text>
          </View>
        )}

        {/* ── Action buttons — hide all & show single button when bill complete ── */}
        {isBillComplete ? (
          <TouchableOpacity style={styles.backToPocketBtn} onPress={onBack} activeOpacity={0.85}>
            <Text style={styles.backToPocketText}>{t.backToPocket}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.depositBtn} onPress={() => setShowDepositModal(true)} activeOpacity={0.85}>
              <Text style={styles.depositBtnIcon}>💰</Text>
              <Text style={styles.depositBtnText}>{t.deposit}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deductBtn} onPress={() => setShowDeductModal(true)} activeOpacity={0.85}>
              <Text style={styles.deductBtnIcon}>💸</Text>
              <Text style={styles.deductBtnText}>{t.deductFromPocket}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.withdrawBtn} onPress={() => setShowWithdrawModal(true)} activeOpacity={0.85}>
              <Text style={styles.withdrawBtnIcon}>📤</Text>
              <Text style={styles.withdrawBtnText}>{t.withdraw}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Pending deduction alert ── */}
        {pocket.pendingDeduction && (
          <View style={styles.pendingAlert}>
            <Text style={styles.pendingAlertText}>
              ⚠️ {t.unpaidAmount(formatCurrency(pocket.pendingDeduction.amount))} · {t.unpaidSince} {pocket.pendingDeduction.date}
            </Text>
          </View>
        )}

        {/* ── Members ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.membersTitle(pocket.members.length)}</Text>
          {pocket.members.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View style={[styles.memberAvatar, { backgroundColor: member.colour }]}>
                <Text style={styles.memberInitials}>{member.initials}</Text>
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
              <View style={styles.memberContrib}>
                <Text style={styles.memberContribAmount}>{formatCurrency(member.contribution)}</Text>
                <Text style={styles.memberContribLabel}>
                  {pocket.current > 0 ? formatPercent((member.contribution / pocket.current) * 100) : '0%'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Recent activity ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.recentActivity}</Text>
          {pocket.recentActivity.map((act) => (
            <View key={act.id} style={styles.activityRow}>
              <View style={[styles.activityAvatar, { backgroundColor: pocket.members.find((m) => m.name === act.member)?.colour || COLORS.accent }]}>
                <Text style={styles.activityInitials}>
                  {pocket.members.find((m) => m.name === act.member)?.initials || act.member[0]}
                </Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>
                  <Text style={{ fontWeight: '700' }}>{act.member}</Text>{' '}
                  {act.action === 'Deposit' ? t.depositAction : act.action.toLowerCase()}
                </Text>
                <Text style={styles.activityDate}>{formatRelativeDate(act.date, lang)}</Text>
              </View>
              <Text style={[styles.activityAmount, { color: COLORS.success }]}>
                +{formatCurrency(act.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Milestone badges ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Milestone</Text>
          <View style={styles.milestonesGrid}>
            {pocket.milestones.map((ms, idx) => (
              <View key={idx} style={[styles.milestoneBadge, ms.reached && styles.milestoneBadgeReached]}>
                <Text style={[styles.milestonePct, ms.reached && styles.milestonePctReached]}>
                  {ms.percent}%
                </Text>
                {ms.reached && <Text style={styles.milestoneCheck}>✓</Text>}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Deposit Modal ── */}
      <Modal visible={showDepositModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.depositModalTitle}</Text>
            <Text style={styles.modalDesc}>{t.depositModalDesc(pocket.name)}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t.amountPlaceholder}
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={setDepositAmount}
            />
            <View style={styles.quickAmounts}>
              {['20', '50', '100', '200'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickAmt, depositAmount === amt && styles.quickAmtActive]}
                  onPress={() => setDepositAmount(amt)}
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
                onPress={() => { setShowDepositModal(false); setDepositAmount(''); }}
              >
                <Text style={styles.modalSecondaryText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimary} onPress={confirmDeposit}>
                <Text style={styles.modalPrimaryText}>{t.depositNow}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Deduct from Pocket Modal ── */}
      <Modal visible={showDeductModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.deductModalTitle}</Text>
            <Text style={styles.modalDesc}>{t.deductModalDesc(pocket.name)}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t.amountPlaceholder}
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={deductAmount}
              onChangeText={setDeductAmount}
            />
            <View style={styles.quickAmounts}>
              {['10', '20', '50', '100'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickAmt, deductAmount === amt && styles.quickAmtActive]}
                  onPress={() => setDeductAmount(amt)}
                >
                  <Text style={[styles.quickAmtText, deductAmount === amt && styles.quickAmtTextActive]}>
                    RM{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={handleBackWithPendingDeduction}
              >
                <Text style={styles.modalSecondaryText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimary, { backgroundColor: COLORS.warning }]}
                onPress={confirmDeduct}
              >
                <Text style={styles.modalPrimaryText}>{t.deductNow}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Withdraw Modal ── */}
      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.withdrawModalTitle}</Text>
            <Text style={styles.modalDesc}>{t.withdrawModalDesc}</Text>
            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder={t.withdrawPlaceholder}
              placeholderTextColor={COLORS.textLight}
              value={withdrawReason}
              onChangeText={setWithdrawReason}
              multiline
            />
            <View style={styles.approvalInfo}>
              <Text style={styles.approvalText}>
                {t.approvalNote(pocket.members.length)}
              </Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => { setShowWithdrawModal(false); setWithdrawReason(''); }}
              >
                <Text style={styles.modalSecondaryText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimary, { backgroundColor: COLORS.warning }]}
                onPress={() => { setShowWithdrawModal(false); setWithdrawReason(''); }}
              >
                <Text style={styles.modalPrimaryText}>{t.sendRequest}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Root export ──────────────────────────────────────────────────────────────
export default function PocketWithKawanScreen({ navigation }) {
  const [selectedPocket, setSelectedPocket] = useState(null);

  if (selectedPocket) {
    return (
      <PocketDetailScreen
        pocket={selectedPocket}
        navigation={navigation}
        onBack={() => setSelectedPocket(null)}
      />
    );
  }

  return (
    <PocketListScreen
      navigation={navigation}
      onSelectPocket={setSelectedPocket}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  newText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700' },

  // List view
  listPad: { padding: 16 },
  listSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 14, textAlign: 'center' },
  pocketListCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  pocketListHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pocketListEmoji: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  pocketListInfo: { flex: 1 },
  pocketListName: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  pocketListDeadline: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  pocketListPercent: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  pocketListTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4,
    overflow: 'hidden', marginBottom: 10,
  },
  pocketListFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  pocketListFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pocketListAmt: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  pocketListGoal: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '400' },
  pocketListAvatars: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pocketMemberCount: { fontSize: 11, color: COLORS.textSecondary, marginLeft: 4 },

  unpaidBanner: {
    marginTop: 10, backgroundColor: COLORS.danger + '18', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.danger + '40',
  },
  unpaidBannerText: { fontSize: 12, color: COLORS.danger, fontWeight: '600' },

  billSplitCTA: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 12,
  },
  billSplitIcon: { fontSize: 24, marginRight: 12 },
  billSplitText: { flex: 1 },
  billSplitTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  billSplitDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  billSplitArrow: { fontSize: 18, color: COLORS.textSecondary },

  createCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 18,
    borderWidth: 1.5, borderColor: COLORS.primary + '60', borderStyle: 'dashed', gap: 8,
  },
  createCardPlus: { fontSize: 22, color: COLORS.primary, fontWeight: '700' },
  createCardText: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },

  // Detail view
  pocketHeroCard: {
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 28, alignItems: 'center',
  },
  pocketEmoji: { fontSize: 48, marginBottom: 8 },
  pocketName: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  pocketDeadline: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 20 },
  progressSection: { width: '100%' },
  percentRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10, justifyContent: 'center' },
  percentValue: { fontSize: 42, fontWeight: '900', color: '#fff' },
  percentLabel: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginLeft: 6 },
  progressTrack: {
    height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6,
    overflow: 'visible', marginBottom: 10, position: 'relative',
  },
  progressFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 6 },
  milestone: { position: 'absolute', width: 4, height: 20, top: -4, borderRadius: 2, marginLeft: -2 },
  amountRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline' },
  currentAmt: { fontSize: 22, fontWeight: '900', color: '#fff' },
  goalAmt: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginLeft: 4 },

  milestoneCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.warning + '20',
    marginHorizontal: 16, marginTop: 14, borderRadius: 12, padding: 12,
  },
  milestoneIcon: { fontSize: 20, marginRight: 10 },
  milestoneText: { flex: 1, fontSize: 13, color: COLORS.warning, fontWeight: '600' },

  billCompleteBanner: {
    backgroundColor: COLORS.success + '18', marginHorizontal: 16, marginTop: 14,
    borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.success + '40',
  },
  billCompleteTitle: { fontSize: 16, fontWeight: '900', color: COLORS.success, marginBottom: 4 },
  billCompleteDesc: { fontSize: 13, color: COLORS.success },

  backToPocketBtn: {
    backgroundColor: COLORS.primary, marginHorizontal: 16, marginTop: 14,
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  backToPocketText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  actionRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, gap: 8 },
  depositBtn: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  depositBtnIcon: { fontSize: 20, marginBottom: 4 },
  depositBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  deductBtn: { flex: 1, backgroundColor: COLORS.warning + '20', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.warning + '60' },
  deductBtnIcon: { fontSize: 20, marginBottom: 4 },
  deductBtnText: { color: COLORS.warning, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  withdrawBtn: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  withdrawBtnIcon: { fontSize: 20, marginBottom: 4 },
  withdrawBtnText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700' },

  pendingAlert: {
    backgroundColor: COLORS.danger + '18', marginHorizontal: 16, marginTop: 12,
    borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.danger + '40',
  },
  pendingAlertText: { fontSize: 13, color: COLORS.danger, fontWeight: '600' },

  card: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 14,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  memberInitials: { fontSize: 13, fontWeight: '800', color: '#fff' },
  memberName: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  memberContrib: { alignItems: 'flex-end' },
  memberContribAmount: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  memberContribLabel: { fontSize: 11, color: COLORS.textSecondary },
  activityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  activityAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  activityInitials: { fontSize: 11, fontWeight: '800', color: '#fff' },
  activityInfo: { flex: 1 },
  activityText: { fontSize: 13, color: COLORS.textSecondary },
  activityDate: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  activityAmount: { fontSize: 14, fontWeight: '800' },
  milestonesGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  milestoneBadge: {
    backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 8, alignItems: 'center', minWidth: 60, borderWidth: 1, borderColor: COLORS.border,
  },
  milestoneBadgeReached: { backgroundColor: COLORS.success + '20', borderColor: COLORS.success },
  milestonePct: { fontSize: 15, fontWeight: '800', color: COLORS.textLight },
  milestonePctReached: { color: COLORS.success },
  milestoneCheck: { fontSize: 14, color: COLORS.success },

  miniAvatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.background },
  miniAvatarText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  modalDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 20 },
  inviteLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8, marginTop: 4 },
  phoneRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  phoneInput: { flex: 1, marginBottom: 0 },
  addPhoneBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
  },
  addPhoneBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  phoneErrorText: { fontSize: 11, color: COLORS.danger, marginBottom: 8 },
  invitedList: { flexWrap: 'wrap', flexDirection: 'row', gap: 6, marginBottom: 14, alignItems: 'center' },
  invitedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.accent + '18', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.accent + '40',
  },
  invitedNum: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },
  removePhoneBtn: { padding: 2 },
  removePhoneBtnText: { fontSize: 11, color: COLORS.danger, fontWeight: '700' },
  invitedCount: { fontSize: 11, color: COLORS.textLight, fontStyle: 'italic' },
  modalInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary, marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  quickAmounts: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  quickAmt: { flex: 1, backgroundColor: COLORS.background, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  quickAmtActive: { backgroundColor: COLORS.primary + '25', borderColor: COLORS.primary },
  quickAmtText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  quickAmtTextActive: { color: COLORS.primary },
  approvalInfo: { backgroundColor: COLORS.accent + '15', borderRadius: 10, padding: 10, marginBottom: 14 },
  approvalText: { fontSize: 12, color: COLORS.accent },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalSecondary: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.textSecondary,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  modalSecondaryText: { color: COLORS.textPrimary, fontWeight: '700' },
  modalPrimary: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalPrimaryText: { color: '#fff', fontWeight: '800' },
  bottomPad: { height: 100 },
});
