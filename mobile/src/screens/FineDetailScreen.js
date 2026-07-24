import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FineCard from '../components/FineCard';
import LoadingButton from '../components/LoadingButton';
import { COLORS } from '../config/constants';


export default function FineDetailScreen({ route, navigation }) {
  const { fine } = route.params;
  const isPayable = fine.status !== 'PAID' && fine.status !== 'CANCELLED';

  const handlePayNow = () => {
    navigation.navigate('Payment', { fineId: fine.id, amount: fine.amount, referenceNumber: fine.referenceNumber });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FineCard fine={fine} />

        <View style={styles.actions}>
          {isPayable && (
            <LoadingButton title="Pay Now" onPress={handlePayNow} />
          )}
          <View style={styles.spacer} />
          <LoadingButton
            title="Back"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  actions: {
    marginTop: 20,
  },
  spacer: {
    height: 12,
  },
});
