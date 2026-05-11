import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colours';
import { formatCurrency, formatDaysRemaining, formatPercent } from '../utils/formatters';

/**
 * Group savings pocket card with progress bar and member avatars.
 */
export default function PocketCard({ pocket, onPress }) {
  if (!pocket) return null;

  const { name, goal, current, deadline, members, emoji } = pocket;
  const percent = Math.min(100, (current / goal) * 100);
  const daysRemaining = formatDaysRemaining(deadline);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{emoji || '💰'}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <Text style={styles.percent}>{formatPercent(percent)}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>

      {/* Amounts */}
      <View style={styles.amountRow}>
        <Text style={styles.currentAmount}>{formatCurrency(current)}</Text>
        <Text style={styles.goalAmount}>/ {formatCurrency(goal)}</Text>
      </View>

      {/* Footer: members + deadline */}
      <View style={styles.footer}>
        {/* Member avatars */}
        <View style={styles.avatarsRow}>
          {(members || []).slice(0, 4).map((member, idx) => (
            <View
              key={member.id || idx}
              style={[
                styles.avatar,
                { backgroundColor: member.colour || COLORS.accent, marginLeft: idx === 0 ? 0 : -8 },
              ]}
            >
              <Text style={styles.avatarText}>{member.initials}</Text>
            </View>
          ))}
          {members && members.length > 4 && (
            <View style={[styles.avatar, { backgroundColor: COLORS.textLight, marginLeft: -8 }]}>
              <Text style={styles.avatarText}>+{members.length - 4}</Text>
            </View>
          )}
        </View>

        {/* Deadline */}
        <Text style={styles.deadline}>{daysRemaining}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  percent: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accent,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currentAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  goalAmount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  deadline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
