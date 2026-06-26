import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge';
import { COLORS } from '../config/constants';
import { formatCurrency, formatDate } from '../utils/formatters';

/**
 * Detail card showing all relevant information for a single traffic fine.
 * @param {{ fine: Object }} props
 */
export default function FineCard({ fine }) {
  const violationName = fine.category?.name || fine.categoryId;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.refLabel}>REFERENCE</Text>
          <Text style={styles.refValue}>{fine.referenceNumber}</Text>
        </View>
        <StatusBadge status={fine.status} />
      </View>

      <View style={styles.amountBox}>
        <Text style={styles.amountLabel}>Amount Due</Text>
        <Text style={styles.amountValue}>{formatCurrency(fine.amount)}</Text>
      </View>

      <View style={styles.divider} />

      <Row label="Violation" value={violationName} />
      <Row label="Description" value={fine.violation} />
      <Row label="Driver Name" value={fine.driverName} />
      <Row label="License No." value={fine.driverLicense} />
      <Row label="Vehicle No." value={fine.vehicleNumber} />
      <Row label="Location" value={fine.location} />
      <Row label="District" value={fine.district} />
      <Row label="Date Issued" value={formatDate(fine.issuedAt)} />
      <Row label="Due Date" value={formatDate(fine.dueDate)} last />
    </View>
  );
}

function Row({ label, value, last = false }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexShrink: 1,
  },
  refLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  refValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  amountBox: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  amountLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
  },
  rowValue: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
    flex: 1.3,
    textAlign: 'right',
  },
});
