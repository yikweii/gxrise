import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { COLORS } from '../constants/colours';
import { formatCurrency, formatPercent, formatDaysRemaining } from '../utils/formatters';
import { getCurrentUser } from '../services/mockData';
import { useLang } from '../context/LangContext';

export default function GoalsScreen({ navigation }) {
  const { lang } = useLang();
  const user = getCurrentUser();
  const [goals, setGoals] = useState(user.savings.goals);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [roundUpEnabled, setRoundUpEnabled] = useState(true);

  const toggleAutoSave = (goalId) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, autoSave: !g.autoSave } : g))
    );
  };

  const openDeposit = (goal) => {
    setDepositGoal(goal);
    setDepositAmount('');
    setShowDepositModal(true);
  };

  const confirmDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;
    setGoals((prev) =>
      prev.map((g) =>
        g.id === depositGoal.id
          ? { ...g, current: g.target != null ? Math.min(g.target, g.current + amt) : g.current + amt }
          : g
      )
    );
    setShowDepositModal(false);
    setDepositAmount('');
    setDepositGoal(null);
  };

  const addGoal = () => {
    if (!newGoalName) return;
    const newGoal = {
      id: `goal_${Date.now()}`,
      name: newGoalName,
      emoji: '🎯',
      target: newGoalTarget ? parseFloat(newGoalTarget) : null,
      current: 0,
      autoSave: false,
      autoSaveAmount: 0,
      roundUp: false,
      deadline: null,
      colour: COLORS.accent,
    };
    setGoals((prev) => [...prev, newGoal]);
    setNewGoalName('');
    setNewGoalTarget('');
    setShowAddModal(false);
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Matlamat Simpanan</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Text style={styles.addText}>+ Baru</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Round-up toggle ── */}
        <View style={styles.roundUpCard}>
          <View style={styles.roundUpLeft}>
            <Text style={styles.roundUpTitle}>🔄 Simpan Baki Syiling</Text>
            <Text style={styles.roundUpDesc}>
              Setiap transaksi akan dibundarkan ke RM seterusnya — baki pergi ke matlamat aktif kamu.
            </Text>
          </View>
          <Switch
            value={roundUpEnabled}
            onValueChange={setRoundUpEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.success }}
            thumbColor={roundUpEnabled ? '#fff' : COLORS.textLight}
          />
        </View>

        {/* ── Goals list ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pocket Simpanan Kamu</Text>
        </View>

        {goals.map((goal) => {
          const hasTarget = goal.target != null && goal.target > 0;
          const percent = hasTarget ? Math.min(100, (goal.current / goal.target) * 100) : 0;
          const isCompleted = hasTarget && percent >= 100;
          const remaining = hasTarget ? goal.target - goal.current : null;
          const accentColor = goal.colour || COLORS.accent;

          return (
            <View key={goal.id} style={[styles.goalCard, isCompleted && styles.goalCardCompleted]}>
              {/* Pocket hero header */}
              <View style={[styles.goalHero, { borderBottomColor: accentColor + '40' }]}>
                <View style={[styles.goalEmojiBox, { backgroundColor: accentColor + '25' }]}>
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                </View>
                <View style={styles.goalTitleBlock}>
                  <Text style={styles.goalName}>{goal.name}</Text>
                  {goal.deadline && (
                    <Text style={styles.goalDeadline}>
                      {formatDaysRemaining(goal.deadline, lang)}
                    </Text>
                  )}
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>🏆 Selesai!</Text>
                    </View>
                  )}
                </View>
                {hasTarget && (
                  <Text style={[styles.goalPercent, { color: accentColor }]}>
                    {formatPercent(percent)}
                  </Text>
                )}
              </View>

              {/* Balance */}
              <View style={styles.balanceRow}>
                <Text style={[styles.currentAmount, { color: accentColor }]}>
                  {formatCurrency(goal.current)}
                </Text>
                {hasTarget && (
                  <Text style={styles.targetAmount}>/ {formatCurrency(goal.target)}</Text>
                )}
              </View>

              {/* Progress bar */}
              {hasTarget && (
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percent}%`, backgroundColor: accentColor },
                    ]}
                  />
                </View>
              )}

              {hasTarget && !isCompleted && remaining != null && (
                <Text style={styles.remainingText}>
                  Perlu {formatCurrency(remaining)} lagi untuk capai matlamat
                </Text>
              )}

              {/* Auto-save settings */}
              <View style={styles.autoSaveRow}>
                <View style={styles.autoSaveLeft}>
                  <Text style={styles.autoSaveLabel}>Simpan Auto</Text>
                  {goal.autoSave && goal.autoSaveAmount > 0 && (
                    <Text style={styles.autoSaveAmount}>
                      {formatCurrency(goal.autoSaveAmount)}/bln
                    </Text>
                  )}
                </View>
                <Switch
                  value={goal.autoSave}
                  onValueChange={() => toggleAutoSave(goal.id)}
                  trackColor={{ false: COLORS.border, true: COLORS.success }}
                  thumbColor={goal.autoSave ? '#fff' : COLORS.textLight}
                />
              </View>

              {/* Action buttons */}
              {!isCompleted && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.depositBtn, { backgroundColor: accentColor }]}
                    onPress={() => openDeposit(goal)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.depositBtnText}>+ Tambah Simpanan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.settingsBtn, { borderColor: accentColor }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.settingsBtnText, { color: accentColor }]}>⚙</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* ── Empty state ── */}
        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>Belum ada matlamat simpanan.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAddModal(true)}>
              <Text style={styles.emptyBtnText}>Buat Matlamat Pertama</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── PTPTN CTA ── */}
        <TouchableOpacity
          style={styles.ptptnCTA}
          onPress={() => navigation.navigate('PTPTN')}
        >
          <Text style={styles.ptptnCTAIcon}>🎓</Text>
          <View style={styles.ptptnCTAText}>
            <Text style={styles.ptptnCTATitle}>PTPTN Pocket</Text>
            <Text style={styles.ptptnCTADesc}>Simpan terus untuk bayar PTPTN lebih awal</Text>
          </View>
          <Text style={styles.ptptnCTAArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Deposit Modal ── */}
      <Modal visible={showDepositModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Tambah Simpanan {depositGoal ? `— ${depositGoal.name}` : ''}
            </Text>
            {depositGoal && (
              <Text style={styles.modalSubtitle}>
                Baki semasa: {formatCurrency(depositGoal.current)}
                {depositGoal.target != null ? ` / ${formatCurrency(depositGoal.target)}` : ''}
              </Text>
            )}
            <TextInput
              style={styles.modalInput}
              placeholder="Jumlah (RM)"
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
                onPress={() => { setShowDepositModal(false); setDepositAmount(''); setDepositGoal(null); }}
              >
                <Text style={styles.modalSecondaryText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimary} onPress={confirmDeposit}>
                <Text style={styles.modalPrimaryText}>Simpan Sekarang</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Add Goal Modal ── */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pocket Simpanan Baru</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nama matlamat (contoh: iPhone 16)"
              placeholderTextColor={COLORS.textLight}
              value={newGoalName}
              onChangeText={setNewGoalName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Jumlah sasaran (RM) — pilihan"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={newGoalTarget}
              onChangeText={setNewGoalTarget}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => { setShowAddModal(false); setNewGoalName(''); setNewGoalTarget(''); }}
              >
                <Text style={styles.modalSecondaryText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimary} onPress={addGoal}>
                <Text style={styles.modalPrimaryText}>Cipta Pocket</Text>
              </TouchableOpacity>
            </View>
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
  addText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  roundUpCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  roundUpLeft: { flex: 1, marginRight: 12 },
  roundUpTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  roundUpDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },

  goalCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 14,
    borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
  },
  goalCardCompleted: { borderColor: COLORS.success, borderWidth: 2 },
  goalHero: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1,
  },
  goalEmojiBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  goalEmoji: { fontSize: 24 },
  goalTitleBlock: { flex: 1 },
  goalName: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  goalDeadline: { fontSize: 11, color: COLORS.textSecondary, marginTop: 3 },
  completedBadge: {
    backgroundColor: COLORS.success + '20', borderRadius: 6, paddingHorizontal: 8,
    paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4,
  },
  completedText: { fontSize: 11, fontWeight: '700', color: COLORS.success },
  goalPercent: { fontSize: 20, fontWeight: '900' },

  balanceRow: { flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: 16, paddingTop: 14 },
  currentAmount: { fontSize: 26, fontWeight: '900' },
  targetAmount: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 4 },

  progressTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4,
    overflow: 'hidden', marginHorizontal: 16, marginTop: 10,
  },
  progressFill: { height: '100%', borderRadius: 4 },

  remainingText: { fontSize: 12, color: COLORS.textSecondary, paddingHorizontal: 16, marginTop: 6 },

  autoSaveRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 12,
  },
  autoSaveLeft: {},
  autoSaveLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  autoSaveAmount: { fontSize: 12, color: COLORS.success, marginTop: 2, fontWeight: '600' },

  cardActions: { flexDirection: 'row', padding: 14, paddingTop: 0, gap: 10 },
  depositBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  depositBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  settingsBtn: {
    width: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  settingsBtnText: { fontSize: 18 },

  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 16 },
  emptyBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  ptptnCTA: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    marginHorizontal: 16, borderRadius: 14, padding: 16, marginBottom: 16,
  },
  ptptnCTAIcon: { fontSize: 28, marginRight: 12 },
  ptptnCTAText: { flex: 1 },
  ptptnCTATitle: { fontSize: 14, fontWeight: '800', color: '#fff' },
  ptptnCTADesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  ptptnCTAArrow: { fontSize: 18, color: 'rgba(255,255,255,0.8)' },

  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24,
    borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 14 },
  modalInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary, marginBottom: 12,
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
  modalActions: { flexDirection: 'row', gap: 12 },
  modalSecondary: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.textSecondary,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  modalSecondaryText: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  modalPrimary: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  bottomPad: { height: 100 },
});
