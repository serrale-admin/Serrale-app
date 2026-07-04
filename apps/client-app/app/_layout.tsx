import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ContactSheets from '../src/components/ContactSheets';
import Toast from '../src/components/Toast';
import { queryClient } from '../src/lib/queryClient';
import { colors } from '../src/lib/theme';
import { initializeSessionManager } from '../src/lib/session-manager';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initializeSessionManager().catch(() => {});
  }, []);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;


  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <View style={styles.root}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="provider/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="categories/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="providers" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="auth/login" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="auth/verify" options={{ animation: 'slide_from_right' }} />
            </Stack>
            <Toast />
            <ContactSheets />
            <StatusBar style="dark" />
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
