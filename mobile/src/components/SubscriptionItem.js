import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colours';
import { formatCurrency } from '../utils/formatters';
import { useLang } from '../context/LangContext';

export default function SubscriptionItem({ subscription, onReview }) {
  const { lang } = useLang();
  if (!subscription) return null;

  const {
    service,
    amount,
    daysIdle,
    riskScore,
    riskLevel,
    level,
    colour,
    annual_cost,
  } = subscription;

  const resolvedLevel = riskLevel || level || 'LOW';
  const resolvedColour = colour || (resolvedLevel === 'HIGH' ? COLORS.danger : resolvedLevel === 'MEDIUM' ? COLORS.warning : COLORS.success);

  const riskEmoji = resolvedLevel === 'HIGH' ? '🔴' : resolvedLevel === 'MEDIUM' ? '🟡' : '🟢';
  const riskLabel = lang === 'en'
    ? (resolvedLevel === 'HIGH' ? 'High' : resolvedLevel === 'MEDIUM' ? 'Medium' : 'Low')
    : (resolvedLevel === 'HIGH' ? 'Tinggi' : resolvedLevel === 'MEDIUM' ? 'Sederhana' : 'Rendah');

  const idleLabel = daysIdle === 0
    ? (lang === 'en' ? 'Active today' : 'Aktif hari ini')
    : daysIdle === 1
    ? (lang === 'en' ? 'Last used yesterday' : 'Terakhir digunakan semalam')
    : (lang === 'en' ? `Not used for ${daysIdle} days` : `Tidak digunakan ${daysIdle} hari`);

  return (
    <View style={styles.card}>
      {/* Left: Risk dot + info */}
      <View style={styles.leftSection}>
        <View style={[styles.riskDot, { backgroundColor: resolvedColour }]} />
        <View style={styles.infoBlock}>
          <Text style={styles.serviceName}>{service}</Text>
          <Text style={styles.idleText}>{idleLabel}</Text>
          <View style={styles.riskPill}>
            <Text style={[styles.riskLabel, { color: resolvedColour }]}>
              {riskEmoji} {lang === 'en' ? 'Risk' : 'Risiko'} {riskLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Right: Amount + review button */}
      <View style={styles.rightSection}>
        <Text style={styles.amount}>{formatCurrency(amount)}{lang === 'en' ? '/mo' : '/bln'}</Text>
        <Text style={styles.annual}>RM {(annual_cost || amount * 12).toFixed(0)}{lang === 'en' ? '/yr' : '/thn'}</Text>
        <TouchableOpacity
          style={[
            styles.reviewBtn,
            { borderColor: resolvedLevel === 'HIGH' ? COLORS.danger : COLORS.accent },
          ]}
          onPress={() => onReview && onReview(subscription)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.reviewBtnText,
              { color: resolvedLevel === 'HIGH' ? COLORS.danger : COLORS.accent },
            ]}
          >
            {lang === 'en' ? 'Review' : 'Semak'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  riskDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 10,
  },
  infoBlock: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  idleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  riskPill: {
    alignSelf: 'flex-start',
  },
  riskLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'flex-end',
    padding: 14,
    paddingLeft: 0,
    minWidth: 90,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  annual: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  reviewBtn: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  reviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
