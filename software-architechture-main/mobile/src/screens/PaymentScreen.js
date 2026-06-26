import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { payFine } from '../api/api';
import LoadingButton from '../components/LoadingButton';
import { COLORS } from '../config/constants';
import { formatCurrency, formatCardNumber, formatExpiry, generatePaymentReference } from '../utils/formatters';

/**
 * Simulated card payment form. No real payment gateway is used —
 * this mirrors the web app's mock payment flow.
 */
export default function PaymentScreen({ route, navigation }) {
  const { fineId, amount, referenceNumber } = route.params;

  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paying, setPaying] = useState(false);

  const validateForm = () => {
    if (!cardholderName.trim()) {
      Alert.alert('Missing information', 'Please enter the cardholder name.');
      return false;
    }
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Invalid card number', 'Card number must be 16 digits.');
      return false;
    }
    if (expiry.length !== 5) {
      Alert.alert('Invalid expiry date', 'Please enter expiry as MM/YY.');
      return false;
    }
    if (cvv.length !== 3) {
      Alert.alert('Invalid CVV', 'CVV must be 3 digits.');
      return false;
    }
    return true;
  };

  const handlePayNow = async () => {
    if (!validateForm()) return;

    setPaying(true);
    try {
      const paymentReference = generatePaymentReference();
      const paidFine = await payFine(fineId, paymentReference);
      navigation.navigate('Success', {
        referenceNumber: paidFine.referenceNumber || referenceNumber,
        amountPaid: paidFine.amount || amount,
        paymentReference: paidFine.paymentReference || paymentReference,
      });
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      Alert.alert('Payment Failed', serverMessage || 'Something went wrong. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
            <Text style={styles.refText}>Ref: {referenceNumber}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Card Details</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name on card"
                placeholderTextColor={COLORS.textMuted}
                value={cardholderName}
                onChangeText={setCardholderName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={19}
                value={cardNumber}
                onChangeText={(value) => setCardNumber(formatCardNumber(value))}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.rowItem]}>
                <Text style={styles.label}>Expiry (MM/YY)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={5}
                  value={expiry}
                  onChangeText={(value) => setExpiry(formatExpiry(value))}
                />
              </View>
              <View style={[styles.formGroup, styles.rowItem]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="•••"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={3}
                  value={cvv}
                  onChangeText={(value) => setCvv(value.replace(/\D/g, '').substring(0, 3))}
                />
              </View>
            </View>

            <LoadingButton title="Pay Now" onPress={handlePayNow} loading={paying} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  amountBox: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 13,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.white,
  },
  refText: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
});
