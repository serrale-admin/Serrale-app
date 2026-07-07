import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import Constants from 'expo-constants';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { segmentsToRouteTemplate, setCurrentRoute } from '../src/lib/http';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ContactSheets from '../src/components/ContactSheets';
import ErrorBoundary from '../src/components/ErrorBoundary';
import Toast from '../src/components/Toast';
import { getCrashReporter } from '../src/lib/crash-reporter';
import { logger } from '../src/lib/logger';
import { queryClient } from '../src/lib/queryClient';
import { colors } from '../src/lib/theme';
import { initializeSessionManager } from '../src/lib/session-manager';

const APP_VERSION =
  (Constants.expoConfig?.version as string | undefined) ??
  ((Constants as unknown as { manifest?: { version?: string } }).manifest?.version) ??
  '0.0.0';

// Tag every subsequent crash event with the release identifier. No-op until a
// real crash provider is wired at T12; safe to call now.
getCrashReporter().setRelease(APP_VERSION);

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Unresolved file-path segments (e.g. ['provider', '[id]']) — NOT the
  // resolved/concrete path. Using usePathname() here would leak dynamic-segment
  // values (ids, phone numbers, etc.) into request metadata. See lib/http.ts.
  const segments = useSegments();

  useEffect(() => {
    initializeSessionManager().catch(() => {});
  }, []);

  // Tag outgoing requests with the current route template (PII-free) so the
  // network layer can attach it as diagnostic metadata, AND drop a release-health
  // breadcrumb for the navigation. The route TEMPLATE (e.g. /provider/[id]) is
  // used deliberately — never a concrete path — so no id/phone leaks. See http.ts.
  useEffect(() => {
    const route = segmentsToRouteTemplate(segments);
    setCurrentRoute(route);
    logger.addBreadcrumb({ category: 'navigation', message: route });
  }, [segments]);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;


  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {/*
          The boundary sits INSIDE SafeAreaProvider (so the recovery screen keeps
          safe-area insets) but OUTSIDE QueryClientProvider and the navigator — a
          render/query crash is exactly what it must survive, so it cannot depend
          on the tree that failed. Restart resets the boundary and navigates to a
          safe root route via the imperative `router` (no navigation context read).
        */}
        <ErrorBoundary onReset={() => router.replace('/')}>
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
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
