import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Modal,
} from 'react-native';
import { COLORS } from '../constants/colours';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { getCurrentUser } from '../services/mockData';
import { useLang } from '../context/LangContext';

const TRANSLATIONS = {
  bm: {
    back: '← Kembali',
    headerTitle: 'Penjejak PTPTN',
    statusText: '✅ Bayaran Lancar',
    balanceLabel: 'Baki Tertunggak',
    originalLoan: 'Pinjaman asal:',
    paidOff: 'dah dibayar',
    yearsLeft: 'tahun lagi',
    paymentInfo: 'Maklumat Bayaran',
    monthlyPayment: 'Bayaran Bulanan',
    nextPayment: 'Bayaran Seterusnya',
    daysLeft: 'Hari Lagi',
    days: 'hari',
    repaymentPeriod: 'Tempoh Bayar Balik',
    autoPay: 'Bayar Auto',
    autoPaySub: 'Potong terus setiap bulan',
    boostTitle: '💡 Tambah Bayaran Bulanan',
    boostDesc: 'Laras jumlah tambahan setiap bulan untuk selesaikan PTPTN lebih awal dan jimat faedah.',
    now: 'Sekarang',
    perMonth: '/bln',
    withBoost: (amt) => `Ditambah +RM${amt}`,
    save: 'Jimat ~',
    months: 'bulan',
    boostBtn: (amt) => `Tambah RM${amt}/Bulan`,
    adjustLabel: 'Laras Jumlah Tambahan:',
    saveBtn: '💾 Simpan',
    savedMsg: '✓ Disimpan',
    modalTitle: 'Sahkan Penambahan Bayaran',
    modalBody1: (amt) => `Kamu akan menambah RM${amt} kepada bayaran bulanan PTPTN bermula Jun 2026.`,
    newPayment: 'Bayaran baru:',
    perMonthFull: '/bulan',
    estSavings: 'Anggaran penjimatan:',
    cancel: 'Batal',
    confirm: 'Sahkan',
  },
  en: {
    back: '← Back',
    headerTitle: 'PTPTN Tracker',
    statusText: '✅ On Track',
    balanceLabel: 'Outstanding Balance',
    originalLoan: 'Original loan:',
    paidOff: 'paid off',
    yearsLeft: 'years left',
    paymentInfo: 'Payment Info',
    monthlyPayment: 'Monthly Payment',
    nextPayment: 'Next Payment',
    daysLeft: 'Days Left',
    days: 'days',
    repaymentPeriod: 'Repayment Period',
    autoPay: 'Auto Pay',
    autoPaySub: 'Auto-deducted monthly',
    boostTitle: '💡 Boost Monthly Payment',
    boostDesc: 'Adjust the extra amount each month to pay off your PTPTN earlier and save on interest.',
    now: 'Now',
    perMonth: '/mo',
    withBoost: (amt) => `With +RM${amt}`,
    save: 'Save ~',
    months: 'months',
    boostBtn: (amt) => `Add RM${amt}/Month`,
    adjustLabel: 'Adjust Boost Amount:',
    saveBtn: '💾 Save',
    savedMsg: '✓ Saved',
    modalTitle: 'Confirm Payment Increase',
    modalBody1: (amt) => `You will add RM${amt} to your monthly PTPTN payment starting June 2026.`,
    newPayment: 'New payment:',
    perMonthFull: '/month',
    estSavings: 'Estimated savings:',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
};

export default function PTTPNTrackerScreen({ navigation }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const user = getCurrentUser();
  const ptptn = user.ptptn;

  const [autoPayEnabled, setAutoPayEnabled] = useState(ptptn.autoPayEnabled);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostAmount, setBoostAmount] = useState(50);
  const [boostSaved, setBoostSaved] = useState(false);
  const [savedBoostAmount, setSavedBoostAmount] = useState(0);

  const adjustBoost = (delta) => {
    setBoostAmount(prev => Math.max(25, Math.min(500, prev + delta)));
    setBoostSaved(false);
  };

  const calcDaysUntilPayment = () => {
    const MONTHS = { Jan: 0, Feb: 1, Mac: 2, Apr: 3, Mei: 4, Jun: 5, Jul: 6, Ogos: 7, Sep: 8, Okt: 9, Nov: 10, Dis: 11 };
    const parts = ptptn.nextPaymentDate.split(' ');
    const due = new Date(parseInt(parts[2]), MONTHS[parts[1]] ?? 5, parseInt(parts[0]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((due - today) / 86400000));
  };
  const daysUntilPayment = calcDaysUntilPayment();

  const currentMonthly = ptptn.monthlyPayment;
  const boostedMonthly = currentMonthly + boostAmount;
  const currentMonths = ptptn.yearsRemaining * 12;
  const boostedMonths = Math.round(currentMonths * (currentMonthly / boostedMonthly));
  const monthsSaved = currentMonths - boostedMonths;
  const interestSaved = monthsSaved * boostAmount;

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
        {/* ── Status badge ── */}
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{t.statusText}</Text>
          </View>
        </View>

        {/* ── Main balance card ── */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t.balanceLabel}</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(ptptn.outstandingBalance)}</Text>
          <Text style={styles.balanceSub}>
            {t.originalLoan} {formatCurrency(ptptn.originalLoan)}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${ptptn.repaidPercent}%`, backgroundColor: COLORS.success },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLeft}>
              {formatCurrency(ptptn.repaidAmount)} {t.paidOff} ({formatPercent(ptptn.repaidPercent)})
            </Text>
            <Text style={styles.progressRight}>
              {ptptn.yearsRemaining} {t.yearsLeft}
            </Text>
          </View>
        </View>

        {/* ── Payment details ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.paymentInfo}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.monthlyPayment}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.detailValue}>
                {formatCurrency(ptptn.monthlyPayment + savedBoostAmount)}
              </Text>
              {savedBoostAmount > 0 && (
                <Text style={{ fontSize: 11, color: COLORS.success, fontWeight: '700' }}>
                  +RM{savedBoostAmount} {lang === 'bm' ? 'tambahan' : 'boosted'}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.nextPayment}</Text>
            <Text style={styles.detailValue}>{ptptn.nextPaymentDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.daysLeft}</Text>
            <Text style={[styles.detailValue, { color: COLORS.warning }]}>
              {daysUntilPayment} {t.days}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t.repaymentPeriod}</Text>
            <Text style={styles.detailValue}>{ptptn.yearsRemaining} tahun</Text>
          </View>

          {/* Auto-pay toggle */}
          <View style={[styles.detailRow, styles.switchRow]}>
            <View>
              <Text style={styles.detailLabel}>{t.autoPay}</Text>
              <Text style={styles.switchSub}>{t.autoPaySub}</Text>
            </View>
            <Switch
              value={autoPayEnabled}
              onValueChange={setAutoPayEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor={autoPayEnabled ? COLORS.background : COLORS.textLight}
            />
          </View>
        </View>

        {/* ── Boost repayment ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.boostTitle}</Text>
          <Text style={styles.boostDesc}>{t.boostDesc}</Text>

          <View style={styles.boostComparison}>
            <View style={styles.boostItem}>
              <Text style={styles.boostItemLabel}>{t.now}</Text>
              <Text style={styles.boostItemValue}>{formatCurrency(currentMonthly)}{t.perMonth}</Text>
              <Text style={styles.boostItemSub}>{ptptn.yearsRemaining} {t.yearsLeft}</Text>
            </View>
            <Text style={styles.boostArrow}>→</Text>
            <View style={[styles.boostItem, styles.boostItemHighlight]}>
              <Text style={[styles.boostItemLabel, { color: COLORS.success }]}>{t.withBoost(boostAmount)}</Text>
              <Text style={[styles.boostItemValue, { color: COLORS.success }]}>
                {formatCurrency(boostedMonthly)}{t.perMonth}
              </Text>
              <Text style={styles.boostItemSub}>
                {t.save}{monthsSaved} {t.months}
              </Text>
            </View>
          </View>

          {/* Boost amount adjuster */}
          <Text style={styles.adjustLabel}>{t.adjustLabel}</Text>
          <View style={styles.adjustRow}>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustBoost(-50)}>
              <Text style={styles.adjustBtnText}>−50</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustBoost(-25)}>
              <Text style={styles.adjustBtnText}>−25</Text>
            </TouchableOpacity>
            <View style={styles.adjustDisplay}>
              <Text style={styles.adjustDisplayText}>RM{boostAmount}</Text>
            </View>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustBoost(25)}>
              <Text style={styles.adjustBtnText}>+25</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustBoost(50)}>
              <Text style={styles.adjustBtnText}>+50</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.boostActions}>
            <TouchableOpacity
              style={styles.saveBoostBtn}
              onPress={() => { setBoostSaved(true); setSavedBoostAmount(boostAmount); }}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBoostBtnText}>{boostSaved ? t.savedMsg : t.saveBtn}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.boostBtn}
              onPress={() => setShowBoostModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.boostBtnText}>{t.boostBtn(boostAmount)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Boost Modal ── */}
      <Modal visible={showBoostModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.modalTitle}</Text>
            <Text style={styles.modalBody}>
              {t.modalBody1(boostAmount)}{'\n\n'}
              {t.newPayment} {formatCurrency(boostedMonthly)}{t.perMonthFull}{'\n'}
              {t.estSavings} {monthsSaved} {t.months} ({formatCurrency(interestSaved)})
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => setShowBoostModal(false)}
              >
                <Text style={styles.modalSecondaryText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimary}
                onPress={() => setShowBoostModal(false)}
              >
                <Text style={styles.modalPrimaryText}>{t.confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statusRow: { alignItems: 'center', paddingVertical: 14 },
  statusBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { color: COLORS.success, fontSize: 13, fontWeight: '700' },
  balanceCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  balanceAmount: { fontSize: 34, fontWeight: '900', color: COLORS.background, marginBottom: 4 },
  balanceSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16 },
  progressTrack: { height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 5 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLeft: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  progressRight: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  card: {
    backgroundColor: COLORS.background,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
  detailLabel: { fontSize: 13, color: COLORS.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  switchRow: { borderBottomWidth: 0 },
  switchSub: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  boostDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 14 },
  boostComparison: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  boostItem: { flex: 1, padding: 12, backgroundColor: COLORS.surface, borderRadius: 12 },
  boostItemHighlight: { backgroundColor: COLORS.success + '15', borderWidth: 1, borderColor: COLORS.success },
  boostArrow: { fontSize: 20, color: COLORS.textLight, marginHorizontal: 8 },
  boostItemLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4, fontWeight: '600' },
  boostItemValue: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  boostItemSub: { fontSize: 11, color: COLORS.textLight },
  adjustLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 },
  adjustRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  adjustBtn: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  adjustBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  adjustDisplay: { flex: 1.4, backgroundColor: COLORS.primary + '15', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary + '40' },
  adjustDisplayText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  boostActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  saveBoostBtn: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.success },
  saveBoostBtnText: { color: COLORS.success, fontSize: 13, fontWeight: '800' },
  boostBtn: { flex: 2, backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  boostBtnText: { color: COLORS.background, fontSize: 13, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  modalBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalSecondary: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalSecondaryText: { color: COLORS.textSecondary, fontWeight: '700' },
  modalPrimary: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalPrimaryText: { color: COLORS.background, fontWeight: '800' },
  bottomPad: { height: 100 },
});
