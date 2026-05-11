import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { COLORS } from '../constants/colours';
import { formatCurrency } from '../utils/formatters';
import { getSubscriptions, creditBalance, getGoals, depositToGoal } from '../services/mockData';
import { getPotentialSavings, getCancelInstructions } from '../services/subscriptionDetector';
import SubscriptionItem from '../components/SubscriptionItem';
import { useLang } from '../context/LangContext';

const TRANSLATIONS = {
  bm: {
    back: '← Kembali',
    title: 'Langganan',
    potentialSavings: 'Potensi Penjimatan',
    highRiskDesc: 'langganan berisiko tinggi — tidak digunakan sejak lama',
    perMonth: '/bln',
    perYear: '/thn',
    totalMonthly: 'Jumlah Bayaran Bulanan',
    perYearLong: '/tahun',
    highRisk: 'Risiko Tinggi (tidak digunakan 30+ hari)',
    medium: 'Sederhana (7–30 hari)',
    low: 'Rendah (aktif)',
    noSubs: 'Tiada Langganan Aktif',
    allCancelled: 'Semua langganan telah dibatalkan. Baki kamu telah dikemaskini!',
    infoTitle: '💡 Cara jimat dengan cancel langganan',
    infoText: 'Setiap langganan yang tidak digunakan adalah wang yang sia-sia. Setelah cancel, jumlah tersebut akan dikreditkan semula ke baki kamu!',
    successCancelled: '✅ Berjaya Dibatalkan!',
    step: 'Langkah',
    of: 'daripada',
    backStep: '← Balik',
    next: 'Seterusnya →',
    confirmCancel: 'Sahkan Cancel',
    creditedBalance: 'dikreditkan ke baki!',
    balanceUpdated: 'Baki GXBank kamu telah dikemaskini',
    successlyCancelled: 'berjaya dibatalkan.',
    perMonthLong: '/bulan =',
    perYearExclaim: '/tahun!',
    save: 'Simpan',
    toEmergency: 'ke Dana Kecemasan 💰',
    close: 'Tutup',
  },
  en: {
    back: '← Back',
    title: 'Subscriptions',
    potentialSavings: 'Potential Savings',
    highRiskDesc: 'high-risk subscriptions — unused for a long time',
    perMonth: '/mo',
    perYear: '/yr',
    totalMonthly: 'Total Monthly Cost',
    perYearLong: '/year',
    highRisk: 'High Risk (unused 30+ days)',
    medium: 'Medium (7–30 days)',
    low: 'Low (active)',
    noSubs: 'No Active Subscriptions',
    allCancelled: 'All subscriptions cancelled. Your balance has been updated!',
    infoTitle: '💡 How to save by cancelling subscriptions',
    infoText: 'Every unused subscription is wasted money. Once cancelled, the amount will be credited back to your balance!',
    successCancelled: '✅ Successfully Cancelled!',
    step: 'Step',
    of: 'of',
    backStep: '← Back',
    next: 'Next →',
    confirmCancel: 'Confirm Cancel',
    creditedBalance: 'credited to balance!',
    balanceUpdated: 'Your GXBank balance has been updated',
    successlyCancelled: 'successfully cancelled.',
    perMonthLong: '/month =',
    perYearExclaim: '/year!',
    save: 'Save',
    toEmergency: 'to Emergency Fund 💰',
    close: 'Close',
  },
};

export default function SubscriptionScreen({ navigation }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const [subscriptions, setSubscriptions] = useState(getSubscriptions());
  const [selectedSub, setSelectedSub] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelStep, setCancelStep] = useState(0);
  const [walletCredited, setWalletCredited] = useState(null);

  const savings = getPotentialSavings(subscriptions);
  const totalMonthly = subscriptions.reduce((s, sub) => s + sub.amount, 0);

  const handleReview = (sub) => {
    setSelectedSub(sub);
    setCancelStep(0);
    setWalletCredited(null);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedSub) return;
    const refund = selectedSub.amount;
    creditBalance(refund);
    setSubscriptions((prev) => prev.filter((s) => s.id !== selectedSub.id));
    setWalletCredited(refund);
    setCancelStep(cancelSteps.length);
  };

  const cancelSteps = selectedSub ? getCancelInstructions(selectedSub.service) : [];

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
        {/* ── Savings banner ── */}
        {savings.monthly > 0 && (
          <View style={styles.savingsBanner}>
            <View style={styles.savingsLeft}>
              <Text style={styles.savingsTitle}>{t.potentialSavings}</Text>
              <Text style={styles.savingsDesc}>
                {savings.highRiskCount} {t.highRiskDesc}
              </Text>
            </View>
            <View style={styles.savingsAmounts}>
              <Text style={styles.savingsMonthly}>{formatCurrency(savings.monthly)}{t.perMonth}</Text>
              <Text style={styles.savingsAnnual}>{formatCurrency(savings.annual)}{t.perYear}</Text>
            </View>
          </View>
        )}

        {/* ── Total monthly ── */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>{t.totalMonthly}</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalMonthly)}</Text>
          <Text style={styles.totalAnnual}>{formatCurrency(totalMonthly * 12)}{t.perYearLong}</Text>
        </View>

        {/* ── Risk legend ── */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.legendText}>{t.highRisk}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.legendText}>{t.medium}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.legendText}>{t.low}</Text>
          </View>
        </View>

        {/* ── Subscription list ── */}
        <View style={styles.listSection}>
          {subscriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyTitle}>{t.noSubs}</Text>
              <Text style={styles.emptyDesc}>{t.allCancelled}</Text>
            </View>
          ) : (
            subscriptions.map((sub) => (
              <SubscriptionItem key={sub.id} subscription={sub} onReview={handleReview} />
            ))
          )}
        </View>

        {/* ── Info card ── */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t.infoTitle}</Text>
          <Text style={styles.infoText}>{t.infoText}</Text>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Cancel Modal ── */}
      <Modal visible={showCancelModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedSub && (
              <>
                <Text style={styles.modalTitle}>
                  {cancelStep < cancelSteps.length ? `Cancel ${selectedSub.service}` : t.successCancelled}
                </Text>

                {cancelStep < cancelSteps.length ? (
                  <>
                    {/* Close button during steps */}
                    <TouchableOpacity
                      style={styles.stepCloseBtn}
                      onPress={() => setShowCancelModal(false)}
                    >
                      <Text style={styles.stepCloseBtnText}>✕</Text>
                    </TouchableOpacity>

                    {/* Step indicator */}
                    <View style={styles.stepIndicator}>
                      {cancelSteps.map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.stepDot,
                            i === cancelStep && styles.stepDotActive,
                            i < cancelStep && styles.stepDotDone,
                          ]}
                        />
                      ))}
                    </View>

                    <Text style={styles.stepLabel}>{t.step} {cancelStep + 1} {t.of} {cancelSteps.length}</Text>
                    <Text style={styles.stepText}>{cancelSteps[cancelStep]}</Text>

                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.modalSecondary}
                        onPress={() => cancelStep > 0 ? setCancelStep(cancelStep - 1) : setShowCancelModal(false)}
                      >
                        <Text style={styles.modalSecondaryText}>{t.backStep}</Text>
                      </TouchableOpacity>
                      {cancelStep < cancelSteps.length - 1 ? (
                        <TouchableOpacity
                          style={[styles.modalPrimary, { flex: 1 }]}
                          onPress={() => setCancelStep(cancelStep + 1)}
                        >
                          <Text style={styles.modalPrimaryText}>{t.next}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.modalPrimary, styles.modalPrimaryDanger, { flex: 1 }]}
                          onPress={handleConfirmCancel}
                        >
                          <Text style={styles.modalPrimaryText}>{t.confirmCancel}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                ) : (
                  <>
                    {/* Wallet credited notification */}
                    {walletCredited !== null && (
                      <View style={styles.creditedBadge}>
                        <Text style={styles.creditedIcon}>💰</Text>
                        <View>
                          <Text style={styles.creditedTitle}>
                            {formatCurrency(walletCredited)} {t.creditedBalance}
                          </Text>
                          <Text style={styles.creditedDesc}>
                            {t.balanceUpdated}
                          </Text>
                        </View>
                      </View>
                    )}

                    <Text style={styles.successText}>
                      {selectedSub.service} {t.successlyCancelled}{'\n\n'}
                      Penjimatan: {formatCurrency(selectedSub.amount)}{t.perMonthLong}{' '}
                      {formatCurrency(selectedSub.amount * 12)}{t.perYearExclaim}
                    </Text>

                    <TouchableOpacity
                      style={styles.saveGoalBtn}
                      onPress={() => {
                        const emergencyGoal = getGoals().find((g) => g.id === 'goal_001');
                        if (emergencyGoal) depositToGoal('goal_001', selectedSub.amount);
                        setShowCancelModal(false);
                        navigation.navigate('Pocket');
                      }}
                    >
                      <Text style={styles.saveGoalBtnText}>
                        {t.save} {formatCurrency(selectedSub.amount)} {t.toEmergency}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalSecondary}
                      onPress={() => setShowCancelModal(false)}
                    >
                      <Text style={styles.modalSecondaryText}>{t.close}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
  placeholder: { width: 60 },
  savingsBanner: {
    backgroundColor: COLORS.warning + '20', marginHorizontal: 16, marginTop: 16,
    borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center',
    borderLeftWidth: 4, borderLeftColor: COLORS.warning,
  },
  savingsLeft: { flex: 1, marginRight: 12 },
  savingsTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 3 },
  savingsDesc: { fontSize: 12, color: COLORS.textSecondary },
  savingsAmounts: { alignItems: 'flex-end' },
  savingsMonthly: { fontSize: 16, fontWeight: '900', color: COLORS.warning },
  savingsAnnual: { fontSize: 11, color: COLORS.textSecondary },
  totalCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginTop: 12,
    borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  totalLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  totalValue: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 2 },
  totalAnnual: { fontSize: 13, color: COLORS.textSecondary },
  legendRow: { marginHorizontal: 16, marginTop: 12, gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: COLORS.textSecondary },
  listSection: { marginHorizontal: 16, marginTop: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  infoCard: {
    backgroundColor: COLORS.primary, marginHorizontal: 16, marginTop: 14,
    borderRadius: 14, padding: 16, marginBottom: 14,
  },
  infoTitle: { fontSize: 13, fontWeight: '800', color: '#fff', marginBottom: 8 },
  infoText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16 },
  stepIndicator: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border },
  stepDotActive: { backgroundColor: COLORS.accent, width: 24 },
  stepDotDone: { backgroundColor: COLORS.success },
  stepCloseBtn: { position: 'absolute', right: 24, top: 20, padding: 4 },
  stepCloseBtnText: { fontSize: 18, color: COLORS.textSecondary },
  stepLabel: { fontSize: 11, color: COLORS.textLight, marginBottom: 10 },
  stepText: { fontSize: 15, color: COLORS.textPrimary, lineHeight: 24, marginBottom: 20 },
  creditedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.success + '20', borderRadius: 14, padding: 14,
    marginBottom: 14, borderWidth: 1, borderColor: COLORS.success,
  },
  creditedIcon: { fontSize: 28 },
  creditedTitle: { fontSize: 15, fontWeight: '800', color: COLORS.success },
  creditedDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  successText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 16 },
  saveGoalBtn: {
    backgroundColor: COLORS.success, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginBottom: 10,
  },
  saveGoalBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalSecondary: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.textSecondary,
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  modalSecondaryText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 14 },
  modalPrimary: {
    backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12,
    paddingHorizontal: 20, alignItems: 'center',
  },
  modalPrimaryDanger: { backgroundColor: COLORS.danger },
  modalPrimaryText: { color: '#fff', fontWeight: '800' },
  bottomPad: { height: 100 },
});
