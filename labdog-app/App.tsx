import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth, AuthProvider } from './context/AuthContext';
import { useFonts } from 'expo-font';
import {
  GoogleSansCode_400Regular,
  GoogleSansCode_700Bold,
} from '@expo-google-fonts/google-sans-code';
import {
  GoogleSans_400Regular,
  GoogleSans_700Bold,
} from '@expo-google-fonts/google-sans';
import type { RootStackParamList } from './navigation/types';
import { colors } from './theme';
import MainTabs from './navigation/mainTabs';
import ScanScreen from './screens/ScanScreen';
import SignInScreen from './screens/SignInScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator(): React.JSX.Element {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}
    >
      {isLoggedIn ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Scan" component={ScanScreen} />
        </>
      ) : (
        <Stack.Screen name="SignIn" component={SignInScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App(): React.JSX.Element | null {
  const [fontsLoaded] = useFonts({
    GoogleSansCode_400Regular,
    GoogleSansCode_700Bold,
    GoogleSans_400Regular,
    GoogleSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}