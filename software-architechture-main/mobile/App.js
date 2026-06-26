import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import FineDetailScreen from './src/screens/FineDetailScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import { COLORS } from './src/config/constants';

const Stack = createStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: '700' },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={headerOptions}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SL Traffic Fine Pay' }} />
          <Stack.Screen name="FineDetail" component={FineDetailScreen} options={{ title: 'Fine Details' }} />
          <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
          <Stack.Screen
            name="Success"
            component={SuccessScreen}
            options={{
              title: 'Payment Complete',
              headerLeft: () => null,
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
