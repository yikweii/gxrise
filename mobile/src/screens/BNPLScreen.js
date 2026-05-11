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
import { formatCurrency, formatDate } from '../utils/formatters';
import { getBNPL, getCurrentUser } from '../services/mockData';
import { useLang } from '../context/LangContext';

const TRANSLATIONS = {
  bm: {
    back: '←',
    headerTitle: 'BNPL Saya',
    addBtn: '+ Tambah',
    totalBNPL: 'Jumlah BNPL',
    freeCash: 'Wang Bebas (selepas BNPL)',
    riskWarning1: '⚠️ BNPL mewakili',
    riskWarning2: '% daripada wang bebas kamu. Elakkan BNPL baru sehingga baki berkurang!',
    activePayments: 'Bayaran Aktif',
    outstandingBalance: 'Baki Tertunggak',
    instalment: 'Ansuran',
    today: 'Hari ini',
    daysLeftToPay: 'hari lagi untuk bayar',
    calendarTitle: '📅 Kalendar Bayaran — Mei 2026',
    mayTotal: 'Jumlah Mei',
    infoBanner: '💡 Tips: Bayar BNPL awal boleh elakkan faedah tambahan. Tetapkan peringatan 3 hari sebelum tarikh bayaran.',
    modalTitle: 'Tambah BNPL Manual',
    merchantPlaceholder: 'Nama peniaga / penyedia',
    amountPlaceholder: 'Jumlah (RM)',
    cancel: 'Batal',
    add: 'Tambah',
  },
  en: {
    back: '←',
    headerTitle: 'My BNPL',
    addBtn: '+ Add',
    totalBNPL: 'Total BNPL',
    freeCash: 'Free Cash (after BNPL)',
    riskWarning1: '⚠️ BNPL represents',
    riskWarning2: '% of your free cash. Avoid new BNPL until balance drops!',
    activePayments: 'Active Payments',
    outstandingBalance: 'Outstanding Balance',
    instalment: 'Instalment',
    today: 'Today',
    daysLeftToPay: 'days left to pay',
    calendarTitle: '📅 Payment Calendar — May 2026',
    mayTotal: 'May Total',
    infoBanner: '💡 Tip: Paying BNPL early avoids extra interest. Set a reminder 3 days before the due date.',
    modalTitle: 'Add BNPL Manually',
    merchantPlaceholder: 'Merchant / provider name',
    amountPlaceholder: 'Amount (RM)',
    cancel: 'Cancel',
    add: 'Add',
  },
};

const MALAY_MONTHS = { Jan: 0, Feb: 1, Mac: 2, Apr: 3, Mei: 4, Jun: 5, Jul: 6, Ogos: 7, Sep: 8, Okt: 9, Nov: 10, Dis: 11 };

function parseMalayDate(dateStr) {
  const [day, month, year] = dateStr.split(' ');
  return new Date(parseInt(year), MALAY_MONTHS[month] ?? 0, parseInt(day));
}

function daysUntilDate(isoOrMalayDate) {
  const due = isoOrMalayDate.includes('-')
    ? new Date(isoOrMalayDate)
    : parseMalayDate(isoOrMalayDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((due - today) / 86400000));
}

export default function BNPLScreen({ navigation }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const user = getCurrentUser();
  const bnplList = getBNPL();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMerchant, setNewMerchant] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const totalOutstanding = bnplList.reduce((s, b) => s + b.outstanding, 0);
  const freeCash = user.balance - totalOutstanding;
  const bnplRatio = (totalOutstanding / user.balance) * 100;

  const getUrgencyColour = (daysUntil) => {
    if (daysUntil <= 5) return COLORS.danger;
    if (daysUntil <= 14) return COLORS.warning;
    return COLORS.success;
  };

  const calendarItems = bnplList.map((b) => ({
    date: b.dueDate,
    provider: b.provider,
    amount: b.outstanding,
    nextPayment: b.nextPayment,
  }));

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Text style={styles.addText}>{t.addBtn}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Summary card ── */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t.totalBNPL}</Text>
              <Text style={[styles.summaryValue, { color: COLORS.danger }]}>
                {formatCurrency(totalOutstanding)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t.freeCash}</Text>
              <Text style={[styles.summaryValue, { color: freeCash < 200 ? COLORS.danger : COLORS.success }]}>
                {formatCurrency(freeCash)}
              </Text>
            </View>
          </View>

          {/* Risk warning */}
          {bnplRatio > 50 && (
            <View style={styles.riskWarning}>
              <Text style={styles.riskWarningIcon}>⚠️</Text>
              <Text style={styles.riskWarningText}>
                {t.riskWarning1} {Math.round(bnplRatio)}{t.riskWarning2}
              </Text>
            </View>
          )}
        </View>

        {/* ── BNPL List ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.activePayments}</Text>
        </View>

        {bnplList.map((bnpl) => {
          const daysUntil = daysUntilDate(bnpl.nextPayment);
          const urgencyColour = getUrgencyColour(daysUntil);
          const progress = ((bnpl.paid || 0) / bnpl.instalments) * 100;

          return (
            <View key={bnpl.id} style={styles.bnplCard}>
              {/* Provider badge */}
              <View style={styles.cardHeader}>
                <View style={styles.providerBadge}>
                  <Text style={styles.providerText}>{bnpl.provider}</Text>
                </View>
                <View style={[styles.urgencyBadge, { backgroundColor: urgencyColour + '20' }]}>
                  <Text style={[styles.urgencyText, { color: urgencyColour }]}>
                    {daysUntil <= 5 ? '⚠️ ' : ''}{bnpl.dueDate}
                  </Text>
                </View>
              </View>

              {/* Merchant */}
              <Text style={styles.merchantName}>{bnpl.merchant}</Text>

              {/* Amount and progress */}
              <View style={styles.amountRow}>
                <View>
                  <Text style={styles.amountLabel}>{t.outstandingBalance}</Text>
                  <Text style={[styles.amountValue, { color: COLORS.danger }]}>
                    {formatCurrency(bnpl.outstanding)}
                  </Text>
                </View>
                <View style={styles.instalmentsInfo}>
                  <Text style={styles.instalmentsLabel}>{t.instalment}</Text>
                  <Text style={styles.instalmentsValue}>
                    {bnpl.paid}/{bnpl.instalments}
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              {bnpl.instalments > 1 && (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
              )}

              {/* Days until */}
              <Text style={[styles.daysUntil, { color: urgencyColour }]}>
                {daysUntil <= 0 ? t.today : `${daysUntil} ${t.daysLeftToPay}`}
              </Text>
            </View>
          );
        })}

        {/* ── Payment Calendar ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.calendarTitle}</Text>
        </View>

        <View style={styles.calendarCard}>
          {calendarItems.map((item, idx) => {
            const daysUntil = daysUntilDate(item.nextPayment);
            const colour = getUrgencyColour(daysUntil);
            return (
              <View key={idx} style={styles.calendarRow}>
                <View style={[styles.calendarDot, { backgroundColor: colour }]} />
                <View style={styles.calendarInfo}>
                  <Text style={styles.calendarDate}>{item.date}</Text>
                  <Text style={styles.calendarProvider}>{item.provider}</Text>
                </View>
                <Text style={[styles.calendarAmount, { color: colour }]}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            );
          })}

          <View style={styles.calendarTotal}>
            <Text style={styles.calendarTotalLabel}>{t.mayTotal}</Text>
            <Text style={styles.calendarTotalValue}>{formatCurrency(totalOutstanding)}</Text>
          </View>
        </View>

        {/* ── Info banner ── */}
        {showInfoBanner && (
          <View style={styles.infoBanner}>
            <Text style={[styles.infoBannerText, { flex: 1 }]}>{t.infoBanner}</Text>
            <TouchableOpacity onPress={() => setShowInfoBanner(false)} style={{ paddingLeft: 8 }}>
              <Text style={{ fontSize: 16, color: COLORS.accent, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Add BNPL Modal ── */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.modalTitle}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t.merchantPlaceholder}
              placeholderTextColor={COLORS.textLight}
              value={newMerchant}
              onChangeText={setNewMerchant}
            />
            <TextInput
              style={styles.modalInput}
              placeholder={t.amountPlaceholder}
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={newAmount}
              onChangeText={setNewAmount}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => { setShowAddModal(false); setNewMerchant(''); setNewAmount(''); }}
              >
                <Text style={styles.modalSecondaryText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimary}
                onPress={() => { setShowAddModal(false); setNewMerchant(''); setNewAmount(''); }}
              >
                <Text style={styles.modalPrimaryText}>{t.add}</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  headerTitle: { color: COLORS.background, fontSize: 17, fontWeight: '800' },
  addText: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  summaryCard: {
    backgroundColor: COLORS.background, marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 2,
  },
  summaryRow: { flexDirection: 'row', marginBottom: 12 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4, textAlign: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '800' },
  summaryDivider: { width: 1, backgroundColor: COLORS.border },
  riskWarning: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.danger + '15', borderRadius: 10, padding: 10,
  },
  riskWarningIcon: { fontSize: 16, marginRight: 8 },
  riskWarningText: { flex: 1, fontSize: 12, color: COLORS.danger, lineHeight: 18, fontWeight: '600' },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  bnplCard: {
    backgroundColor: COLORS.background, marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  providerBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  providerText: { color: COLORS.background, fontSize: 12, fontWeight: '700' },
  urgencyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  urgencyText: { fontSize: 12, fontWeight: '600' },
  merchantName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  amountLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 3 },
  amountValue: { fontSize: 22, fontWeight: '900' },
  instalmentsInfo: { alignItems: 'center' },
  instalmentsLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  instalmentsValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  progressTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 3 },
  daysUntil: { fontSize: 12, fontWeight: '600' },
  calendarCard: {
    backgroundColor: COLORS.background, marginHorizontal: 16, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 2, marginBottom: 14,
  },
  calendarRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
  calendarDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  calendarInfo: { flex: 1 },
  calendarDate: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  calendarProvider: { fontSize: 11, color: COLORS.textSecondary },
  calendarAmount: { fontSize: 14, fontWeight: '800' },
  calendarTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12 },
  calendarTotalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  calendarTotalValue: { fontSize: 16, fontWeight: '900', color: COLORS.danger },
  infoBanner: {
    backgroundColor: COLORS.accent + '15', marginHorizontal: 16, borderRadius: 12,
    padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'flex-start',
  },
  infoBannerText: { fontSize: 13, color: COLORS.accent, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16 },
  modalInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary, marginBottom: 12,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalSecondary: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalSecondaryText: { color: COLORS.textSecondary, fontWeight: '700' },
  modalPrimary: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalPrimaryText: { color: COLORS.background, fontWeight: '800' },
  bottomPad: { height: 100 },
});
