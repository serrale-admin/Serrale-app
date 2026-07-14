import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthScreenHeader from '../../src/components/AuthScreenHeader';
import Button from '../../src/components/Button';
import PhoneField from '../../src/components/PhoneField';
import { fetchPhoneAccountHint } from '../../src/api';
import {
  useRequestCustomerSignupOtp,
  useRequestOtp,
  useRequestProviderOtp,
} from '../../src/hooks/queries';
import { HttpError } from '../../src/lib/http';
import { Icon } from '../../src/lib/icons';
import { presentError } from '../../src/lib/error-presentation';
import { useLabels } from '../../src/lib/labels';
import { parseOtpDelivery } from '../../src/lib/otp-delivery';
import { newIdempotencyKey } from '../../src/lib/otp-retry';

  resolveCustomerOtpIntent,
} from '../../src/lib/customer-otp-purpose';
import { parseOtpDelivery } from '../../src/lib/otp-delivery';
import { newIdempotencyKey } from '../../src/lib/otp-retry';
import { parsePhoneAccountHint, resolveLoginRoleFromHint } from '../../src/lib/phone-account';
import { normalizeEthiopianPhone } from '../../src/lib/phone';
import { navigateAuthBack, safeNextRoute } from '../../src/lib/safe-route';
import { colors, fonts, layout } from '../../src/lib/theme';
import { PhoneForm, phoneSchema } from '../../src/schemas/auth';
import { useAppStore } from '../../src/store/appStore';
import type { OtpChallenge } from '../../src/api/shared';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reason?: string; next?: string; role?: string; intent?: string }>();
  const setPendingPhone = useAppStore((s) => s.setPendingPhone);
  const setPendingChallengeId = useAppStore((s) => s.setPendingChallengeId);
  const setPendingOtpDelivery = useAppStore((s) => s.setPendingOtpDelivery);
  const setPendingAccountHint = useAppStore((s) => s.setPendingAccountHint);
  const setPendingAuthRole = useAppStore((s) => s.setPendingAuthRole);
  const setPendingOtpPurpose = useAppStore((s) => s.setPendingOtpPurpose);
  const setPhoneHasProvider = useAppStore((s) => s.setPhoneHasProvider);
  const showToast = useAppStore((s) => s.showToast);
  const requestCustomerLoginOtp = useRequestOtp();
  const requestCustomerSignupOtp = useRequestCustomerSignupOtp();
  const requestProviderOtp = useRequestProviderOtp();
  const labels = useLabels();
  const sending = useRef(false);

  const customerIntent = resolveCustomerOtpIntent(params);
  const customerPurpose = customerOtpPurposeForIntent(customerIntent);

  const [sendError, setSendError] = useState('');
  const [customerMissing, setCustomerMissing] = useState(false);
  const [providerMissing, setProviderMissing] = useState(false);

  const { handleSubmit, watch, setValue, formState } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
    mode: 'onSubmit',
  });
  const phone = watch('phone');
  const phoneError = formState.errors.phone ? labels.auth.invalidPhone : undefined;
  const preferredRole = params.role === 'provider' ? 'provider' : 'customer';
  const otpPending =
    requestCustomerLoginOtp.isPending ||
    requestCustomerSignupOtp.isPending ||
    requestProviderOtp.isPending;
  const mutationError =
    requestCustomerLoginOtp.error ??
    requestCustomerSignupOtp.error ??
    requestProviderOtp.error;
  const apiError =
    !phoneError && (sendError || (mutationError ? presentError(mutationError, labels).message : ''));

  const handleBack = () => {
    navigateAuthBack(safeNextRoute(params.next));
  };

  const onSend = handleSubmit(async (v) => {
    if (sending.current || otpPending) return;
    sending.current = true;
    setSendError('');
    setCustomerMissing(false);
    setProviderMissing(false);

    const idempotencyKey = newIdempotencyKey();
    const normalized = normalizeEthiopianPhone(v.phone) || v.phone;

    const proceedToVerify = (
      challenge: OtpChallenge,
      role: 'customer' | 'provider',
      purpose: typeof customerPurpose | 'directory_provider_login',
    ) => {
      setPendingPhone(normalized);
      setPendingChallengeId(challenge.challengeId);
      const delivery = parseOtpDelivery(challenge.delivery);
      setPendingOtpDelivery(delivery);
      setPendingAuthRole(role);
      setPendingOtpPurpose(purpose);
      const account = parsePhoneAccountHint(challenge.account);
      setPendingAccountHint(account);
      setPhoneHasProvider(account?.has_provider === true);
      if (delivery === 'review_code') {
        showToast(labels.verify.reviewCodeHint, 'ph-warning-circle');
      }
      router.replace({
        pathname: '/auth/verify',
        params: {
          next: params.next,
          ...(role === 'provider' ? { role: 'provider' } : {}),
          ...(customerIntent === 'request' ? { intent: 'request' } : {}),
        },
      });
    };

    try {
      const hintResponse = await fetchPhoneAccountHint(normalized, preferredRole).catch(() => null);
      const role = resolveLoginRoleFromHint(parsePhoneAccountHint(hintResponse?.account), preferredRole);
      const mutation =
        role === 'provider'
          ? requestProviderOtp
          : customerIntent === 'request'
            ? requestCustomerSignupOtp
            : requestCustomerLoginOtp;
      const purpose =
        role === 'provider' ? ('directory_provider_login' as const) : customerPurpose;

      mutation.mutate(
        { phone: v.phone, idempotencyKey },
        {
          onSuccess: (challenge) => proceedToVerify(challenge, role, purpose),
          onError: (e) => {
            if (e instanceof HttpError && e.code === 'CUSTOMER_NOT_FOUND') {
              setSendError(labels.auth.customerNotFound);
              setCustomerMissing(true);
              return;
            }
            if (e instanceof HttpError && e.code === 'PROVIDER_NOT_FOUND') {
              setSendError(labels.clientProfile.providerNotFound);
              setProviderMissing(true);
              return;
            }
            setSendError(presentError(e, labels).message);
          },
          onSettled: () => {
            sending.current = false;
          },
        },
      );
    } catch (e) {
      setSendError(presentError(e, labels).message);
      sending.current = false;
    }
  });

  const lead = `${params.reason ? `${params.reason}. ` : ''}${labels.auth.loginSubtitle}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthScreenHeader onBack={handleBack} backFallback={safeNextRoute(params.next)} />

          <Text style={styles.h1}>{labels.common.loginWithPhone}</Text>
          <Text style={styles.lead}>{lead}</Text>

          <View style={styles.section}>
            <PhoneField
              value={phone}
              errored={!!phoneError || !!apiError}
              onChangeText={(text) => {
                setValue('phone', text.replace(/[^0-9]/g, '').slice(0, 10));
                setSendError('');
                setCustomerMissing(false);
                setProviderMissing(false);
                requestCustomerLoginOtp.reset();
                requestCustomerSignupOtp.reset();
                requestProviderOtp.reset();
              }}
            />
            {!!phoneError && (
              <View style={styles.errorRow}>
                <Icon name="ph-warning-circle" size={14} color={colors.danger} weight="fill" />
                <Text style={styles.errorText}>{phoneError}</Text>
              </View>
            )}
            {!!apiError && (
              <View style={styles.errorRow}>
                <Icon name="ph-warning-circle" size={14} color={colors.danger} weight="fill" />
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            )}
            {customerMissing && (
              <Button
                label={labels.auth.customerRegisterLink}
                variant="secondary"
                size="md"
                fullWidth
                onPress={() =>
                  router.replace({
                    pathname: '/auth/login',
                    params: { intent: 'request', next: params.next || '/(tabs)/request' },
                  })
                }
              />
            )}
            {providerMissing && (
              <Button
                label={labels.clientProfile.providerRegisterLink}
                variant="secondary"
                size="md"
                fullWidth
                onPress={() => router.push('/provider/join')}
              />
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={otpPending ? labels.auth.sending : labels.auth.sendCode}
            variant="gold"
            icon="ph-paper-plane-tilt"
            loading={otpPending}
            fullWidth
            onPress={onSend}
          />
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>{labels.auth.orDivider}</Text>
            <View style={styles.orLine} />
          </View>
          <Button
            label={labels.auth.continueAsGuest}
            variant="secondary"
            size="md"
            fullWidth
            onPress={() => router.replace('/(tabs)/home')}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { paddingBottom: 16 },
  h1: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.green900,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    lineHeight: 36,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.muted,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  section: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  errorText: { flex: 1, fontSize: 12.5, color: colors.danger, fontFamily: fonts.regular, lineHeight: 17 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.bg,
    gap: 8,
    maxWidth: layout.contentMaxWidth + 32,
    alignSelf: 'center',
    width: '100%',
  },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.borderSoft },
  orText: { fontSize: 12, fontFamily: fonts.medium, color: colors.faint },
});
