import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colours';
import { formatCurrency, formatShortDate, getCategoryIcon, getCategoryColour } from '../utils/formatters';
import { useLang } from '../context/LangContext';

export default function TransactionItem({ transaction }) {
  const { lang } = useLang();
  if (!transaction) return null;

  const { date, merchant, amount, category, type } = transaction;
  const isCredit = type === 'credit';
  const categoryIcon = getCategoryIcon(category);
  const relativeDate = formatShortDate(date, lang);

  return (
    <View style={styles.row}>
      <View style={styles.iconChip}>
        <Text style={styles.iconText}>{categoryIcon}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.merchantName} numberOfLines={1}>{merchant}</Text>
        <Text style={styles.dateText}>{relativeDate}</Text>
      </View>

      <View style={styles.amountCol}>
        <Text style={[styles.amount, { color: isCredit ? COLORS.success : COLORS.textPrimary }]}>
          {isCredit ? '+' : '-'}{formatCurrency(amount)}
        </Text>
        {isCredit && (
          <View style={styles.cashbackPill}>
            <Text style={styles.cashbackText}>{lang === 'en' ? 'in' : 'masuk'}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  details: {
    flex: 1,
    marginRight: 8,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  cashbackPill: {
    backgroundColor: COLORS.success + '20',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  cashbackText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
  },
});
