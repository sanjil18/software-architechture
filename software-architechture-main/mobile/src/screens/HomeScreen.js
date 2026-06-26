import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { getCategories, lookupFine } from '../api/api';
import LoadingButton from '../components/LoadingButton';
import { COLORS } from '../config/constants';

/**
 * Landing screen: driver enters their fine reference number and category,
 * then looks the fine up against the backend.
 */
export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const result = await getCategories();
      setCategories(result || []);
      if (result && result.length > 0) {
        setCategoryId(result[0].categoryId);
      }
    } catch (error) {
      setErrorMessage('Could not load fine categories. Check your connection.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleLookup = async () => {
    setErrorMessage('');

    if (!referenceNumber.trim()) {
      setErrorMessage('Please enter your fine reference number.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Please select a violation category.');
      return;
    }

    setSearching(true);
    try {
      const fine = await lookupFine(referenceNumber.trim().toUpperCase(), categoryId);
      navigation.navigate('FineDetail', { fine });
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      setErrorMessage(serverMessage || 'Fine not found. Please check your details and try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.badgeIcon}>🚔</Text>
            <Text style={styles.title}>Sri Lanka Police</Text>
            <Text style={styles.subtitle}>Traffic Fine Payment</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Find Your Fine</Text>
            <Text style={styles.cardSubtitle}>
              Enter the details from your traffic fine notice.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Reference Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. TF-2024-001"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                value={referenceNumber}
                onChangeText={setReferenceNumber}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Violation Category</Text>
              {categoriesLoading ? (
                <View style={styles.pickerLoading}>
                  <ActivityIndicator color={COLORS.primary} />
                </View>
              ) : (
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={categoryId}
                    onValueChange={(value) => setCategoryId(value)}
                  >
                    {categories.map((category) => (
                      <Picker.Item
                        key={category.categoryId}
                        label={`${category.categoryId} — ${category.name}`}
                        value={category.categoryId}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <LoadingButton
              title="Look Up Fine"
              onPress={handleLookup}
              loading={searching}
              disabled={categoriesLoading}
            />
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
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 18,
    lineHeight: 18,
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  pickerLoading: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 14,
    textAlign: 'center',
  },
});
