import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import LoadingButton from '../components/LoadingButton';
import { COLORS } from '../config/constants';
import { formatCurrency } from '../utils/formatters';

/**
 * Final confirmation screen shown after a successful payment.
 * "Done" resets the navigation stack back to HomeScreen so the
 * user can't navigate back into a completed payment flow.
 */
export default function SuccessScreen({ route, navigation }) {
  const { referenceNumber, amountPaid, paymentReference } = route.params;

  const handleDone = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={styles.heading}>Payment Successful!</Text>
        <Text style={styles.subheading}>
          Your traffic fine has been paid. Show this confirmation to retrieve your license.
        </Text>

        <View style={styles.receiptBox}>
          <ReceiptRow label="Reference No." value={referenceNumber} />
          <ReceiptRow label="Payment Ref." value={paymentReference} />
          <ReceiptRow label="Amount Paid" value={formatCurrency(amountPaid)} last />
        </View>

        <LoadingButton title="Done" onPress={handleDone} />
      </View>
    </SafeAreaView>
  );
}

function ReceiptRow({ label, value, last = false }) {
  return (
    <View style={[styles.receiptRow, last && styles.receiptRowLast]}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={styles.receiptValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 44,
    color: COLORS.white,
    fontWeight: '800',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 18,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  receiptRowLast: {
    borderBottomWidth: 0,
  },
  receiptLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  receiptValue: {
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '700',
  },
});
