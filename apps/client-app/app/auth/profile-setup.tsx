import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchCustomerMe } from '../../src/api';
import Button from '../../src/components/Button';
import BasicProfileForm from '../../src/components/BasicProfileForm';
import ScreenHeader from '../../src/components/ScreenHeader';
import { useUpdateCustomerProfile } from '../../src/hooks/queries';
import { presentError } from '../../src/lib/error-presentation';
import { hasLinkedProviderSession } from '../../src/lib/phone-account';
import { useLabels } from '../../src/lib/labels';
import { displayEthiopianPhone } from '../../src/lib/phone';
import { safeNextRoute } from '../../src/lib/safe-route';
import { syncCustomerProfile } from '../../src/lib/session-manager';
import { colors, fonts, layout, radius, shadowCard } from '../../src/lib/theme';
import {
  basicProfileSchema,
  basicProfileToApiPayload,
  defaultBasicProfile,
  type BasicProfileForm as BasicProfileValues,
} from '../../src/schemas/basic-profile';
import { useAppStore } from '../../src/store/appStore';
import type { ApiCustomerProfile } from '../../src/api/serrale/types';

function customerToForm(customer: ApiCustomerProfile): BasicProfileValues {
  return {
    display_name: customer.display_name || '',
    area_slug: customer.area_slug || '',
  };
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const labels = useLabels();
  const t = labels.clientProfile;
  const loggedIn = useAppStore((s) => s.loggedIn);
  const user = useAppStore((s) => s.user);
  const phoneHasProvider = useAppStore((s) => s.phoneHasProvider);
  const showToast = useAppStore((s) => s.showToast);
  const mutation = useUpdateCustomerProfile();
  const [form, setForm] = useState(defaultBasicProfile());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedIn) {
      router.replace({ pathname: '/auth/login', params: { next: '/auth/profile-setup' } });
      return;
    }
    const redirectIfProvider = async () => {
      if (phoneHasProvider || (user?.phone && (await hasLinkedProviderSession(user.phone)))) {
        showToast(t.providerPrimaryHint, 'ph-briefcase');
        router.replace((safeNextRoute(params.next) || '/(tabs)/profile') as never);
        return true;
      }
      return false;
    };
    redirectIfProvider().then((skipped) => {
      if (skipped) return;
      fetchCustomerMe()
        .then((customer) => setForm(customerToForm(customer)))
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, [loggedIn, router, phoneHasProvider, user?.phone, params.next, showToast, t.providerPrimaryHint]);

  const onSave = () => {
    const parsed = basicProfileSchema.safeParse(form);
    if (!parsed.success) {
      showToast(t.incomplete, 'ph-warning-circle');
      return;
    }
    mutation.mutate(basicProfileToApiPayload(parsed.data), {
      onSuccess: async (customer) => {
        await syncCustomerProfile(customer);
        showToast(t.saved, 'ph-check-circle');
        router.replace((safeNextRoute(params.next) || '/(tabs)/profile') as never);
      },
      onError: (e) => showToast(presentError(e, labels).message, 'ph-warning-circle'),
    });
  };

  const phoneDisplay = user?.phone ? displayEthiopianPhone(user.phone) : '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader onBack={() => router.back()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.panel}>
            <Text style={styles.h1}>{t.title}</Text>
            <Text style={styles.sub}>{t.subtitle}</Text>
            {!loading && (
              <BasicProfileForm
                value={form}
                phoneDisplay={phoneDisplay}
                onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
                disabled={mutation.isPending}
              />
            )}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label={mutation.isPending ? t.saving : t.save}
            variant="gold"
            fullWidth
            loading={mutation.isPending}
            onPress={onSave}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: layout.gutter, paddingBottom: layout.sectionGap },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 8,
    ...shadowCard,
    shadowOpacity: 0.06,
  },
  h1: { fontFamily: fonts.heading, fontSize: 22, color: colors.green900 },
  sub: { marginTop: 6, marginBottom: 16, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.muted },
  footer: { paddingHorizontal: layout.gutter, paddingBottom: Platform.OS === 'ios' ? 24 : 16, paddingTop: 10 },
});
