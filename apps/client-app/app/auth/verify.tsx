import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HttpError } from '../../src/api';
import Button from '../../src/components/Button';
import OtpInput from '../../src/components/OtpInput';
import ScreenHeader from '../../src/components/ScreenHeader';
import { useLoginProvider, useRequestCustomerOtp, useRequestProviderOtp, useVerifyCustomerOtp, useVerifyProviderOtp } from '../../src/hooks/queries';
import { USE_MOCK } from '../../src/lib/env';
import { presentError } from '../../src/lib/error-presentation';
import { Icon } from '../../src/lib/icons';
import { fill, useLabels } from '../../src/lib/labels';
import { emptyOtp, otpComplete, parseOtpPaste, sanitizeSingleOtpDigit } from '../../src/lib/otp-code';
import { isReviewCodeDelivery, parseOtpDelivery } from '../../src/lib/otp-delivery';
import { DEFAULT_RESEND_COOLDOWN_SECONDS, newIdempotencyKey, retryInfoFromError } from '../../src/lib/otp-retry';
import { displayEthiopianPhone } from '../../src/lib/phone';
import { providerSession } from '../../src/lib/provider-session';
import { navigateAuthBack, safeNextRoute } from '../../src/lib/safe-route';
import { colors, fonts, layout, radius, shadowCard } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

// Verify-side error codes that mean the challenge is DEAD (spent/expired). The
// user cannot retype their way out of these — route them back to re-request a
// fresh code. OTP_INCORRECT is deliberately excluded: that one keeps the
// challenge so the user can retype (attempt_count is bounded server-side).
const DEAD_CHALLENGE_CODES = new Set(['OTP_EXPIRED', 'OTP_INVALID_STATUS', 'OTP_MAX_ATTEMPTS', 'OTP_NOT_FOUND']);
const CONSUMED_VERIFY_TOKEN_CODES = new Set([
  'INVALID_VERIFY_TOKEN',
  'VERIFY_TOKEN_EXPIRED',
  'VERIFY_PHONE_MISMATCH',
  'VERIFY_PURPOSE_MISMATCH',
]);

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string; role?: string; intent?: string }>();
  const phone = useAppStore((s) => s.pendingPhone);
  const challengeId = useAppStore((s) => s.pendingChallengeId);
  const pendingOtpDelivery = useAppStore((s) => s.pendingOtpDelivery);
  const pendingOtpPurpose = useAppStore((s) => s.pendingOtpPurpose);
  const showToast = useAppStore((s) => s.showToast);
  const pendingAuthRole = useAppStore((s) => s.pendingAuthRole);
  const setPendingChallengeId = useAppStore((s) => s.setPendingChallengeId);
  const setPendingOtpDelivery = useAppStore((s) => s.setPendingOtpDelivery);
  const setPendingAccountHint = useAppStore((s) => s.setPendingAccountHint);
  const setPhoneHasProvider = useAppStore((s) => s.setPhoneHasProvider);
  const isProviderFlow = pendingAuthRole === 'provider';
  const customerPurpose: 'directory_customer_login' | 'directory_customer_request' =
    pendingOtpPurpose === 'directory_customer_request'
      ? 'directory_customer_request'
      : 'directory_customer_login';
  const requestCustomerOtp = useRequestCustomerOtp(customerPurpose);
  const requestProviderOtp = useRequestProviderOtp();
  const verifyCustomer = useVerifyCustomerOtp(customerPurpose);
  const verifyProvider = useVerifyProviderOtp();
  const loginProvider = useLoginProvider();
  const labels = useLabels();
  const requestOtp = isProviderFlow ? requestProviderOtp : requestCustomerOtp;
  const verifyMutation = isProviderFlow ? verifyProvider : verifyCustomer;

  const [otp, setOtp] = useState(emptyOtp());
  const [error, setError] = useState('');
  const [providerMissing, setProviderMissing] = useState(false);
  // Seeded from the backend cooldown constant (there is no server-provided
  // resend gate on the happy path — see otp-retry.ts). A stricter 429 overrides
  // this via `startResendCooldown`.
  const [resend, setResend] = useState(DEFAULT_RESEND_COOLDOWN_SECONDS);
  const inputs = useRef<(TextInput | null)[]>([]);
  // Synchronous in-flight guards (mutation `isPending` only flips next render, so
  // it cannot stop a rapid synchronous burst of taps — the refs can).
  const verifying = useRef(false);
  const resending = useRef(false);

  /** Restart the resend countdown, never SHORTENING an in-progress stricter wait. */
  const startResendCooldown = (seconds: number) => {
    setResend((current) => Math.max(current, Math.ceil(seconds)));
  };

  const loginParams = {
    next: params.next,
    ...(params.intent === 'request' ? { intent: 'request' as const } : {}),
    ...(isProviderFlow ? { role: 'provider' as const } : {}),
  };

  /** Route back to phone entry to request a fresh code, preserving `next`. */
  const goReRequest = (message: string) => {
    setPendingChallengeId('');
    showToast(message, 'ph-warning-circle');
    router.replace({ pathname: '/auth/login', params: loginParams });
  };

  useEffect(() => {
    if (!challengeId || !phone) {
      showToast(labels.verify.reenterPhone, 'ph-warning-circle');
      router.replace({ pathname: '/auth/login', params: loginParams });
      return;
    }
    const t = setInterval(() => setResend((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => clearInterval(t);
  }, [challengeId, phone, params.next, router, showToast, labels.verify.reenterPhone, isProviderFlow]);

  // Readable local (national) form, e.g. "0912 345 678" — what Ethiopians dial.
  const phoneDisplay = phone ? displayEthiopianPhone(phone) : '09XX XXX XXX';

  const handleBack = () => {
    navigateAuthBack(safeNextRoute(params.next));
  };

  const finishProviderLogin = (verifyToken: string) => {
    loginProvider.mutate(
      { verifyToken, phone },
      {
        onSuccess: async (session) => {
          await providerSession.write(session.session_token, session.provider);
          const {
            applyProviderSession,
            storeHybridCustomerSession,
          } = require('../../src/lib/session-manager');
          const { writeActiveSessionRole } = require('../../src/lib/session-role');
          if (session.customer_session?.access_token && session.customer_session?.refresh_token) {
            await storeHybridCustomerSession(session.customer_session);
          }
          await writeActiveSessionRole('provider');
          useAppStore.getState().setActiveSession('provider');
          applyProviderSession({
            sessionToken: session.session_token,
            provider: session.provider,
            savedAt: new Date().toISOString(),
          });
          showToast(labels.clientProfile.providerLoginSuccess, 'ph-hand-waving');
          router.replace(safeNextRoute(params.next) as never);
        },
        onError: (e) => {
          if (e instanceof HttpError && e.code === 'PROVIDER_NOT_FOUND') {
            setError(labels.clientProfile.providerNotFound);
            setProviderMissing(true);
            return;
          }
          setError(presentError(e, labels).message);
        },
      },
    );
  };

  const submit = (code: string[]) => {
    if (code.some((d) => d === '')) {
      setError(labels.verify.enterCode);
      return;
    }
    if (verifying.current || verifyMutation.isPending || loginProvider.isPending) return;
    verifying.current = true;
    setProviderMissing(false);
    verifyMutation.mutate(
      { phone, code: code.join(''), challengeId },
      {
        onSettled: () => {
          verifying.current = false;
        },
        onSuccess: async (result) => {
          if (isProviderFlow) {
            finishProviderLogin(result.verifyToken);
            return;
          }
          try {
            const { handleExchange } = require('../../src/lib/session-manager');
            const { resolvePostCustomerLogin } = require('../../src/lib/post-customer-login');
            await handleExchange(phone, result.verifyToken);
            const { needsProfileSetup } = await resolvePostCustomerLogin(phone);
            showToast(labels.common.welcomeToSerrale, 'ph-hand-waving');
            if (needsProfileSetup) {
              router.replace({ pathname: '/auth/profile-setup', params: { next: params.next } });
              return;
            }
            router.replace(safeNextRoute(params.next) as never);
          } catch (e) {
            // The verify_token was consumed by the exchange attempt. A consumed/
            // invalid token (INVALID_VERIFY_TOKEN; 401 or 400) can't be reused, so
            // send the user back to re-request cleanly. A transient outage
            // (SESSION_STORE_UNAVAILABLE / 503) is retryable in place.
            const code = e instanceof HttpError ? e.code : undefined;
            if (code === 'SESSION_STORE_UNAVAILABLE' || (e instanceof HttpError && e.status === 503)) {
              setOtp(emptyOtp());
              setError(labels.verify.tempSession);
              setTimeout(() => inputs.current[0]?.focus(), 50);
              return;
            }
            if (code && CONSUMED_VERIFY_TOKEN_CODES.has(code)) {
              goReRequest(labels.verify.expiredReRequest);
              return;
            }
            setOtp(emptyOtp());
            setError(presentError(e, labels).message);
            setTimeout(() => inputs.current[0]?.focus(), 50);
          }
        },
        onError: (e) => {
          const code = e instanceof HttpError ? e.code : undefined;
          // A dead challenge (expired / already used / too many attempts) cannot
          // be retyped — route back to request a fresh code.
          if (code && DEAD_CHALLENGE_CODES.has(code)) {
            goReRequest(labels.verify.codeExpired);
            return;
          }
          // Everything else stays on-screen. Generic, security-safe copy: never
          // reveal whether the phone is registered or why the code failed.
          const message =
            e instanceof HttpError && e.status === 429
              ? presentError(e, labels).message
              : e instanceof HttpError && (e.status === 401 || e.status === 400)
                  ? labels.verify.incorrectCode
                  : presentError(e, labels).message;
          setOtp(emptyOtp());
          setError(message);
          setTimeout(() => inputs.current[0]?.focus(), 50);
        },
      },
    );
  };

  const applyOtp = (next: string[], autoSubmit = true) => {
    setOtp(next);
    setError('');
    if (autoSubmit && otpComplete(next) && !verifying.current && !verifyMutation.isPending) {
      setTimeout(() => submit(next), 100);
    }
  };

  const setDigit = (i: number, v: string) => {
    const digit = sanitizeSingleOtpDigit(v);
    const next = otp.slice();
    next[i] = digit;
    applyOtp(next, true);
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (chars: string[]) => {
    const next = parseOtpPaste(chars.join(''));
    applyOtp(next, true);
    const firstEmpty = next.findIndex((d) => !d);
    inputs.current[firstEmpty === -1 ? 5 : firstEmpty]?.focus();
  };

  const onKey = (i: number, key: string) => {
    if (key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const fillDemo = () => {
    const demo = ['1', '2', '3', '4', '5', '6'];
    applyOtp(demo, true);
  };

  const resendCode = () => {
    if (resend > 0 || !phone || resending.current || requestOtp.isPending) return;
    resending.current = true;
    setError('');
    setOtp(emptyOtp());
    const idempotencyKey = newIdempotencyKey();
    requestOtp.mutate(
      { phone, idempotencyKey },
      {
        onSettled: () => {
          resending.current = false;
        },
        onSuccess: (challenge) => {
          setPendingChallengeId(challenge.challengeId);
          setPendingOtpDelivery(parseOtpDelivery(challenge.delivery));
          if (!isProviderFlow) {
            setPendingAccountHint(challenge.account ?? null);
            if (challenge.account?.has_provider) setPhoneHasProvider(true);
          }
          setResend(DEFAULT_RESEND_COOLDOWN_SECONDS);
          showToast(
            isReviewCodeDelivery(challenge.delivery) ? labels.verify.reviewCodeHint : labels.verify.codeResent,
            'ph-paper-plane-tilt',
          );
          setTimeout(() => inputs.current[0]?.focus(), 50);
        },
        onError: (e) => {
          if (e instanceof HttpError && e.status === 429) {
            // A stricter server cooldown OVERRIDES the local timer — drive the
            // countdown from the server's retry seconds and show a specific wait.
            const info = retryInfoFromError(e);
            if (info.seconds != null) startResendCooldown(info.seconds);
            setError(presentError(e, labels).message);
            return;
          }
          setError(presentError(e, labels).message);
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader onBack={handleBack} />
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
          <View style={styles.panel}>
            <Text style={styles.h1}>{labels.verify.title}</Text>
            <Text style={styles.subtitle}>
              {isReviewCodeDelivery(pendingOtpDelivery) ? (
                labels.verify.reviewCodeHint
              ) : (
                <>
                  {labels.verify.sentToPrefix}
                  <Text style={styles.phoneHighlight}>{phoneDisplay}</Text>
                  {labels.verify.sentToSuffix}
                </>
              )}
            </Text>

            <View style={styles.otpWrap}>
              <OtpInput
                value={otp}
                onChangeDigit={setDigit}
                onPaste={handlePaste}
                onKeyPress={onKey}
                setRef={(i, el) => {
                  inputs.current[i] = el;
                }}
                errored={!!error}
              />
            </View>

            {!!error && (
              <View style={styles.errorRow}>
                <Icon name="ph-warning-circle" size={14} color={colors.danger} weight="fill" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.resendRow}>
              <Pressable onPress={resendCode} disabled={resend > 0 || requestOtp.isPending} hitSlop={8}>
                <Text style={[styles.resendText, (resend > 0 || requestOtp.isPending) && styles.resendMuted]}>
                  {requestOtp.isPending
                    ? labels.auth.sending
                    : resend > 0
                      ? fill(labels.verify.resendIn, { seconds: resend })
                      : labels.verify.resend}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.replace({ pathname: '/auth/login', params: loginParams })}
                hitSlop={8}
              >
                <Text style={styles.changeText}>{labels.verify.changeNumber}</Text>
              </Pressable>
            </View>

            {USE_MOCK && (
              <Pressable style={styles.demo} onPress={fillDemo}>
                <Icon name="ph-magic-wand" size={14} color={colors.muted} />
                <Text style={styles.demoText}>{labels.verify.demoAutofill}</Text>
              </Pressable>
            )}
            {providerMissing && isProviderFlow && (
              <Button
                label={labels.clientProfile.providerRegisterLink}
                variant="secondary"
                size="md"
                fullWidth
                onPress={() => router.push('/provider/join')}
                style={{ marginTop: 12 }}
              />
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={
              verifyMutation.isPending || loginProvider.isPending
                ? labels.verify.verifying
                : labels.verify.verify
            }
            variant="gold"
            loading={verifyMutation.isPending || loginProvider.isPending}
            fullWidth
            disabled={!otpComplete(otp)}
            onPress={() => submit(otp)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: layout.gutter, paddingBottom: layout.sectionGap },
  panel: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    marginTop: 8,
    ...shadowCard,
    shadowOpacity: 0.06,
  },
  h1: { fontFamily: fonts.heading, fontSize: 22, color: colors.green900, lineHeight: 28 },
  subtitle: { marginTop: 8, fontSize: 13.5, color: colors.muted, lineHeight: 20, fontFamily: fonts.regular },
  phoneHighlight: { color: colors.text, fontFamily: fonts.bold },
  otpWrap: { marginTop: 22, width: '100%', overflow: 'hidden', alignItems: 'center' },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 14 },
  errorText: { flex: 1, fontSize: 12.5, color: colors.danger, fontFamily: fonts.regular, lineHeight: 17 },
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, gap: 12 },
  resendText: { fontSize: 13, color: colors.green800, fontFamily: fonts.semibold },
  resendMuted: { color: colors.faint, fontFamily: fonts.regular },
  changeText: { fontSize: 13, fontFamily: fonts.bold, color: colors.success },
  demo: {
    marginTop: 16,
    minHeight: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(6,71,52,0.22)',
    borderRadius: radius.lg,
    backgroundColor: colors.ivory,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  demoText: { fontSize: 12.5, fontFamily: fonts.semibold, color: colors.muted },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 22 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.bg,
    maxWidth: layout.contentMaxWidth + layout.gutter * 2,
    alignSelf: 'center',
    width: '100%',
  },
});
