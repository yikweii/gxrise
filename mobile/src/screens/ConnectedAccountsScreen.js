import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
} from 'react-native';
import { COLORS } from '../constants/colours';
import { formatRelativeDate } from '../utils/formatters';
import { getConnectedAccounts } from '../services/notificationParser';
import { useLang } from '../context/LangContext';

const TRANSLATIONS = {
  bm: {
    back: '← Kembali',
    headerTitle: 'Akaun Disambung',
    add: '+ Tambah',
    notifTitle: 'Aktifkan Notifikasi SMS',
    notifDesc: 'GX Rise boleh baca transaksi terus dari SMS bank kamu untuk rekod automatik.',
    notifBtn: 'Aktif',
    connected: 'Disambung',
    detected: 'Dikesan',
    notConnected: 'Belum disambung',
    allAccounts: 'Semua Akaun',
    detectedSms: 'Dikesan dari SMS — ketik untuk sambung',
    active: 'Aktif',
    connect: 'Sambung',
    addConnect: '+ Sambung',
    typeOther: 'Lain',
    transactions: 'transaksi',
    synced: 'Sinkron',
    never: 'belum pernah',
    settingsTitle: '⚙️ Tetapan Pemberitahuan',
    smsNotif: 'Notifikasi SMS',
    smsNotifDesc: 'Baca SMS bank secara automatik',
    bnplReminder: 'Peringatan BNPL',
    bnplReminderDesc: 'Notif 3 hari sebelum bayaran',
    weeklyDigest: 'Ringkasan Mingguan',
    weeklyDigestDesc: 'Setiap Ahad pagi',
    privacy: '🔒 GX Rise tidak menyimpan log masuk bank kamu. Semua data dikira setempat di peranti kamu sahaja.',
    modalTitle: 'Sambung Akaun Baru',
    modalDesc: 'Pilih institusi untuk disambungkan dengan GX Rise:',
    cancel: 'Batal',
    connectBtn: 'Sambung',
  },
  en: {
    back: '← Back',
    headerTitle: 'Connected Accounts',
    add: '+ Add',
    notifTitle: 'Enable SMS Notifications',
    notifDesc: 'GX Rise can read transactions directly from your bank SMS for automatic logging.',
    notifBtn: 'Enable',
    connected: 'Connected',
    detected: 'Detected',
    notConnected: 'Not connected',
    allAccounts: 'All Accounts',
    detectedSms: 'Detected from SMS — tap to connect',
    active: 'Active',
    connect: 'Connect',
    addConnect: '+ Connect',
    typeOther: 'Other',
    transactions: 'transactions',
    synced: 'Synced',
    never: 'never',
    settingsTitle: '⚙️ Notification Settings',
    smsNotif: 'SMS Notifications',
    smsNotifDesc: 'Automatically read bank SMS',
    bnplReminder: 'BNPL Reminders',
    bnplReminderDesc: 'Notify 3 days before payment',
    weeklyDigest: 'Weekly Digest',
    weeklyDigestDesc: 'Every Sunday morning',
    privacy: '🔒 GX Rise does not store your bank login. All data is calculated locally on your device only.',
    modalTitle: 'Connect New Account',
    modalDesc: 'Choose an institution to connect with GX Rise:',
    cancel: 'Cancel',
    connectBtn: 'Connect',
  },
};

export default function ConnectedAccountsScreen({ navigation }) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const accounts = getConnectedAccounts();
  const [notifPermission, setNotifPermission] = useState(false);
  const [bnplPermission, setBnplPermission] = useState(true);
  const [weeklyDigestPermission, setWeeklyDigestPermission] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState(null);

  const connectedCount = accounts.filter((a) => a.status === 'active').length;
  const detectedCount = accounts.filter((a) => a.status === 'detected').length;

  const ACCOUNT_TYPES = [
    { id: 'maybank', name: 'Maybank', icon: '🏦', type: 'bank', colour: '#FFCC00' },
    { id: 'cimb', name: 'CIMB', icon: '🏦', type: 'bank', colour: '#FF0000' },
    { id: 'tng', name: "Touch 'n Go eWallet", icon: '📱', type: 'ewallet', colour: '#00A0E9' },
    { id: 'boost', name: 'Boost', icon: '💳', type: 'ewallet', colour: '#E8145F' },
    { id: 'grab_paylater', name: 'GrabPay Later', icon: '💳', type: 'bnpl', colour: '#00B14F' },
  ];

  const getStatusColour = (status) => {
    if (status === 'active') return COLORS.success;
    if (status === 'detected') return COLORS.warning;
    return COLORS.textLight;
  };

  const getTypeLabel = (type) => {
    if (type === 'bank') return 'Bank';
    if (type === 'bnpl') return 'BNPL';
    if (type === 'ewallet') return 'e-Wallet';
    return t.typeOther;
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Text style={styles.addText}>{t.add}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Notification permission banner ── */}
        {!notifPermission && (
          <View style={styles.notifBanner}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifText}>
              <Text style={styles.notifTitle}>{t.notifTitle}</Text>
              <Text style={styles.notifDesc}>{t.notifDesc}</Text>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => setNotifPermission(true)}
            >
              <Text style={styles.notifBtnText}>{t.notifBtn}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Summary ── */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{connectedCount}</Text>
            <Text style={styles.summaryLabel}>{t.connected}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.warning }]}>{detectedCount}</Text>
            <Text style={styles.summaryLabel}>{t.detected}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{accounts.length - connectedCount - detectedCount}</Text>
            <Text style={styles.summaryLabel}>{t.notConnected}</Text>
          </View>
        </View>

        {/* ── Accounts list ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.allAccounts}</Text>
        </View>

        {accounts.map((account) => {
          const statusColour = getStatusColour(account.status);
          const isConnected = account.status === 'active';
          const isDetected = account.status === 'detected';

          return (
            <View key={account.id} style={styles.accountCard}>
              <View style={[styles.accountIcon, { backgroundColor: account.colour + '20' }]}>
                <View style={[styles.accountDot, { backgroundColor: account.colour }]} />
              </View>

              <View style={styles.accountInfo}>
                <View style={styles.accountNameRow}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountStatusEmoji}>{account.statusEmoji}</Text>
                </View>
                <Text style={styles.accountType}>{getTypeLabel(account.type)}</Text>
                {isConnected && (
                  <Text style={styles.accountMeta}>
                    {account.transactionCount} {t.transactions} •{' '}
                    {t.synced} {account.lastSync ? formatRelativeDate(account.lastSync, lang) : t.never}
                  </Text>
                )}
                {isDetected && (
                  <Text style={[styles.accountMeta, { color: COLORS.warning }]}>
                    {t.detectedSms}
                  </Text>
                )}
              </View>

              <View style={styles.accountAction}>
                {isConnected ? (
                  <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
                    <Text style={[styles.statusBadgeText, { color: COLORS.success }]}>{t.active}</Text>
                  </View>
                ) : isDetected ? (
                  <TouchableOpacity style={styles.connectBtn}>
                    <Text style={styles.connectBtnText}>{t.connect}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.addAccountBtn}>
                    <Text style={styles.addAccountBtnText}>{t.addConnect}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {/* ── Notification settings ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.settingsTitle}</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t.smsNotif}</Text>
              <Text style={styles.settingDesc}>{t.smsNotifDesc}</Text>
            </View>
            <Switch
              value={notifPermission}
              onValueChange={setNotifPermission}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor={notifPermission ? COLORS.background : COLORS.textLight}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t.bnplReminder}</Text>
              <Text style={styles.settingDesc}>{t.bnplReminderDesc}</Text>
            </View>
            <Switch
              value={bnplPermission}
              onValueChange={setBnplPermission}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor={bnplPermission ? COLORS.background : COLORS.textLight}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t.weeklyDigest}</Text>
              <Text style={styles.settingDesc}>{t.weeklyDigestDesc}</Text>
            </View>
            <Switch
              value={weeklyDigestPermission}
              onValueChange={setWeeklyDigestPermission}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor={weeklyDigestPermission ? COLORS.background : COLORS.textLight}
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              thumbColor={COLORS.background}
            />
          </View>
        </View>

        {/* ── Privacy note ── */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>{t.privacy}</Text>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Add Account Modal ── */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.modalTitle}</Text>
            <Text style={styles.modalDesc}>{t.modalDesc}</Text>
            <ScrollView style={styles.modalList}>
              {ACCOUNT_TYPES.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[
                    styles.modalAccountItem,
                    selectedAccountType === acc.id && styles.modalAccountItemSelected,
                  ]}
                  onPress={() => setSelectedAccountType(acc.id)}
                >
                  <Text style={styles.modalAccountIcon}>{acc.icon}</Text>
                  <Text style={styles.modalAccountName}>{acc.name}</Text>
                  <View style={styles.modalAccountTypeBadge}>
                    <Text style={styles.modalAccountTypeText}>{getTypeLabel(acc.type)}</Text>
                  </View>
                  {selectedAccountType === acc.id && (
                    <Text style={styles.modalAccountCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => { setShowAddModal(false); setSelectedAccountType(null); }}
              >
                <Text style={styles.modalSecondaryText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimary, !selectedAccountType && { opacity: 0.5 }]}
                disabled={!selectedAccountType}
                onPress={() => { setShowAddModal(false); setSelectedAccountType(null); }}
              >
                <Text style={styles.modalPrimaryText}>{t.connectBtn}</Text>
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
  notifBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 14, gap: 10,
  },
  notifIcon: { fontSize: 24 },
  notifText: { flex: 1 },
  notifTitle: { fontSize: 13, fontWeight: '800', color: COLORS.background, marginBottom: 3 },
  notifDesc: { fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 16 },
  notifBtn: { backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  notifBtnText: { color: COLORS.background, fontSize: 12, fontWeight: '800' },
  summaryRow: {
    flexDirection: 'row', backgroundColor: COLORS.background, marginHorizontal: 16,
    marginTop: 14, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 2 },
  summaryLabel: { fontSize: 11, color: COLORS.textSecondary },
  summaryDivider: { width: 1, backgroundColor: COLORS.border },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  accountCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background,
    marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, elevation: 1,
  },
  accountIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  accountDot: { width: 18, height: 18, borderRadius: 9 },
  accountInfo: { flex: 1 },
  accountNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  accountName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  accountStatusEmoji: { fontSize: 14 },
  accountType: { fontSize: 11, color: COLORS.textLight, marginBottom: 3, fontWeight: '600' },
  accountMeta: { fontSize: 11, color: COLORS.textSecondary },
  accountAction: { alignItems: 'center' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  connectBtn: { backgroundColor: COLORS.warning + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  connectBtnText: { color: COLORS.warning, fontSize: 12, fontWeight: '700' },
  addAccountBtn: { backgroundColor: COLORS.accent + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  addAccountBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.background, marginHorizontal: 16, marginTop: 14,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.surface,
  },
  settingInfo: { flex: 1, marginRight: 12 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  settingDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  privacyNote: {
    backgroundColor: COLORS.success + '15', marginHorizontal: 16, marginTop: 14,
    borderRadius: 12, padding: 14, marginBottom: 4,
  },
  privacyText: { fontSize: 12, color: COLORS.success, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  modalDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 },
  modalList: { marginBottom: 16 },
  modalAccountItem: {
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12,
    marginBottom: 8, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
  },
  modalAccountItemSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '10' },
  modalAccountIcon: { fontSize: 22, marginRight: 10 },
  modalAccountName: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  modalAccountTypeBadge: { backgroundColor: COLORS.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 },
  modalAccountTypeText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  modalAccountCheck: { fontSize: 16, color: COLORS.accent, fontWeight: '800' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalSecondary: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalSecondaryText: { color: COLORS.textSecondary, fontWeight: '700' },
  modalPrimary: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalPrimaryText: { color: COLORS.background, fontWeight: '800' },
  bottomPad: { height: 100 },
});
