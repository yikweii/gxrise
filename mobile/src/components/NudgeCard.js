import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colours';

function BoldBody({ text, style }) {
  if (!text) return null;
  const parts = text.split(/(RM[\d,]+(?:\.\d+)?|\d+%|\d+(?:\.\d+)?\s*hari|\d+(?:\.\d+)?\s*days?)/g);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        /^(RM[\d,]+(?:\.\d+)?|\d+%|\d+(?:\.\d+)?\s*hari|\d+(?:\.\d+)?\s*days?)$/.test(part)
          ? <Text key={i} style={{ fontWeight: '800', color: COLORS.textPrimary }}>{part}</Text>
          : part
      )}
    </Text>
  );
}

export default function NudgeCard({ nudge, onAction, onDismiss, compact = false }) {
  if (!nudge) return null;

  const primaryAction = nudge.actions?.find((a) => a.primary) || nudge.actions?.[0];
  const secondaryAction = nudge.actions?.find((a) => !a.primary);

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>🔔</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{nudge.title}</Text>
        <BoldBody text={nudge.body} style={styles.body} />

        {nudge.actions && nudge.actions.length > 0 && (
          <View style={styles.actionsRow}>
            {primaryAction && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => onAction && onAction(primaryAction.id, nudge)}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>{primaryAction.label}</Text>
              </TouchableOpacity>
            )}
            {secondaryAction && (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => {
                  if (secondaryAction.id === 'dismiss') {
                    onDismiss && onDismiss(nudge);
                  } else {
                    onAction && onAction(secondaryAction.id, nudge);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryBtnText}>{secondaryAction.label}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {onDismiss && !compact && (
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={() => onDismiss(nudge)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardCompact: {
    marginHorizontal: 0,
    marginVertical: 4,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    paddingRight: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  body: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  dismissBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  dismissText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
  },
});
