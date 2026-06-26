import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: '#fef9c3', text: '#854d0e' },
  paid: { label: 'Paid', bg: '#dcfce7', text: '#166534' },
  overdue: { label: 'Overdue', bg: '#fee2e2', text: '#991b1b' },
  cancelled: { label: 'Cancelled', bg: '#e2e8f0', text: '#475569' },
};

/**
 * Colored badge that reflects a fine's payment status.
 * @param {{ status: string }} props
 */
export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
