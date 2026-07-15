import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ApiCustomerProfile, ApiProviderAccount } from '../../src/api/serrale/types';
import BasicProfileForm from '../../src/components/BasicProfileForm';
import Button from '../../src/components/Button';
import ProviderProfileForm from '../../src/components/ProviderProfileForm';
import ScreenHeader from '../../src/components/ScreenHeader';
import { useUpdateCustomerProfile, useUpdateProviderProfile } from '../../src/hooks/queries';
import { presentError } from '../../src/lib/error-presentation';
import { useLabels } from '../../src/lib/labels';
import { displayEthiopianPhone } from '../../src/lib/phone';
import { syncCustomerProfile, syncProviderProfile } from '../../src/lib/session-manager';
import { colors, fonts, layout, radius, shadowCard } from '../../src/lib/theme';
import {
  basicProfileSchema,
  basicProfileToApiPayload,
  defaultBasicProfile,
  type BasicProfileForm as BasicProfileValues,
} from '../../src/schemas/basic-profile';
import {
  defaultProviderProfile,
  providerProfileSchema,
  providerProfileToApiPatch,
  type ProviderProfileFormValues,
} from '../../src/schemas/provider-profile';
import { useAppStore } from '../../src/store/appStore';
import { fetchCustomerMe, fetchProviderMe } from '../../src/api';

function customerToForm(customer: ApiCustomerProfile): BasicProfileValues {
  return {
    display_name: customer.display_name || '',
    area_slug: customer.area_slug || '',
  };
}

function providerToForm(provider: ApiProviderAccount): ProviderProfileFormValues {
  return {
    fullName: provider.full_name || '',
    categorySlug: provider.category_slug || '',
    area: provider.area || '',
    whatsapp: provider.whatsapp || '',
    experience: provider.experience || '',
    description: provider.bio || '',
  };
}

export default function ProfileEditScreen() {
  const router = useRouter();
  const labels = useLabels();
  const p = labels.profile;
  const loggedIn = useAppStore((s) => s.loggedIn);
  const activeSession = useAppStore((s) => s.activeSession);
  const providerProfile = useAppStore((s) => s.providerProfile);
  const isProvider = activeSession === 'provider' && !!providerProfile;
  const showToast = useAppStore((s) => s.showToast);
  const phone = useAppStore((s) => s.user?.phone) || providerProfile?.phone || '';

  const customerMutation = useUpdateCustomerProfile();
  const providerMutation = useUpdateProviderProfile();

  const [loading, setLoading] = useState(true);
  const [customerForm, setCustomerForm] = useState(defaultBasicProfile());
  const [providerForm, setProviderForm] = useState(defaultProviderProfile());

  useEffect(() => {
    if (!loggedIn && !isProvider) {
      router.replace({ pathname: '/auth/login', params: { next: '/profile/edit' } });
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        if (isProvider) {
          const provider = await fetchProviderMe();
          setProviderForm(providerToForm(provider));
        } else {
          const customer = await fetchCustomerMe();
          setCustomerForm(customerToForm(customer));
        }
      } catch {
        showToast(labels.errors.unknownMessage, 'ph-warning-circle');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [loggedIn, isProvider, router, showToast, labels.errors.unknownMessage]);

  const phoneDisplay = phone ? displayEthiopianPhone(phone) : '';
  const saving = customerMutation.isPending || providerMutation.isPending;

  const onSave = () => {
    if (isProvider) {
      const parsed = providerProfileSchema.safeParse(providerForm);
      if (!parsed.success) {
        showToast(labels.clientProfile.incomplete, 'ph-warning-circle');
        return;
      }
      providerMutation.mutate(providerProfileToApiPatch(parsed.data), {
        onSuccess: async () => {
          await syncProviderProfile();
          showToast(p.saved, 'ph-check-circle');
          router.back();
        },
        onError: (e) => showToast(presentError(e, labels).message, 'ph-warning-circle'),
      });
      return;
    }

    const parsed = basicProfileSchema.safeParse(customerForm);
    if (!parsed.success) {
      showToast(labels.clientProfile.incomplete, 'ph-warning-circle');
      return;
    }
    customerMutation.mutate(basicProfileToApiPayload(parsed.data), {
      onSuccess: async (customer) => {
        await syncCustomerProfile(customer);
        showToast(p.saved, 'ph-check-circle');
        router.back();
      },
      onError: (e) => showToast(presentError(e, labels).message, 'ph-warning-circle'),
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={p.editTitle} onBack={() => router.back()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.panel}>
            <Text style={styles.sub}>{isProvider ? p.editSubtitleProvider : p.editSubtitleCustomer}</Text>
            {loading ? (
              <ActivityIndicator color={colors.green800} style={{ marginVertical: 24 }} />
            ) : isProvider ? (
              <ProviderProfileForm
                value={providerForm}
                phoneDisplay={phoneDisplay}
                onChange={(patch) => setProviderForm((current) => ({ ...current, ...patch }))}
                disabled={saving}
              />
            ) : (
              <BasicProfileForm
                value={customerForm}
                phoneDisplay={phoneDisplay}
                onChange={(patch) => setCustomerForm((current) => ({ ...current, ...patch }))}
                disabled={saving}
              />
            )}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label={saving ? labels.clientProfile.saving : labels.clientProfile.save}
            variant="gold"
            fullWidth
            loading={saving}
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
  sub: { marginBottom: 14, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.muted },
  footer: { paddingHorizontal: layout.gutter, paddingBottom: Platform.OS === 'ios' ? 24 : 16, paddingTop: 10 },
});
