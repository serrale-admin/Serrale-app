import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiBusinessError, HttpError, NetworkError } from '../../src/api';
import Button from '../../src/components/Button';
import OtpInput from '../../src/components/OtpInput';
import ScreenHeader from '../../src/components/ScreenHeader';
import { useRequestOtp, useVerifyOtp } from '../../src/hooks/queries';
import { USE_MOCK } from '../../src/lib/env';
import { Icon } from '../../src/lib/icons';
import { DEFAULT_RESEND_COOLDOWN_SECONDS, formatRetryMessage, newIdempotencyKey, retryInfoFromError } from '../../src/lib/otp-retry';
import { displayEthiopianPhone } from '../../src/lib/phone';
import { safeNextRoute } from '../../src/lib/safe-route';
import { colors, fonts } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

// Verify-side error codes that mean the challenge is DEAD (spent/expired). The
// user cannot retype their way out of these — route them back to re-request a
// fresh code. OTP_INCORRECT is deliberately excluded: that one keeps the
// challenge so the user can retype (attempt_count is bounded server-side).
const DEAD_CHALLENGE_CODES = new Set(['OTP_EXPIRED', 'OTP_INVALID_STATUS', 'OTP_MAX_ATTEMPTS', 'OTP_NOT_FOUND']);

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const phone = useAppStore((s) => s.pendingPhone);
  const challengeId = useAppStore((s) => s.pendingChallengeId);
  const showToast = useAppStore((s) => s.showToast);
  const setPendingChallengeId = useAppStore((s) => s.setPendingChallengeId);
  const requestOtp = useRequestOtp();
  const verifyMutation = useVerifyOtp();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
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

  /** Route back to phone entry to request a fresh code, preserving `next`. */
  const goReRequest = (message: string) => {
    setPendingChallengeId('');
    showToast(message, 'ph-warning-circle');
    router.replace({ pathname: '/auth/login', params: { next: params.next } });
  };

  useEffect(() => {
    if (!challengeId || !phone) {
      showToast('Enter your phone again to receive a code', 'ph-warning-circle');
      router.replace({ pathname: '/auth/login', params: { next: params.next } });
      return;
    }
    const t = setInterval(() => setResend((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => clearInterval(t);
  }, [challengeId, phone, params.next, router, showToast]);

  // Readable local (national) form, e.g. "0912 345 678" — what Ethiopians dial.
  const phoneDisplay = phone ? displayEthiopianPhone(phone) : '09XX XXX XXX';

  const submit = (code: string[]) => {
    if (code.some((d) => d === '')) {
      setError('Enter the 6-digit code.');
      return;
    }
    // One verify per submission — block duplicate taps and the auto-submit
    // firing on top of a manual Verify press.
    if (verifying.current || verifyMutation.isPending) return;
    verifying.current = true;
    verifyMutation.mutate(
      { phone, code: code.join(''), challengeId },
      {
        onSettled: () => {
          verifying.current = false;
        },
        onSuccess: async (result) => {
          try {
            const { handleExchange } = require('../../src/lib/session-manager');
            await handleExchange(phone, result.verifyToken);
            showToast('Welcome to SERRALE', 'ph-hand-waving');
            // Validate `next` to an internal route only — never navigate to an
            // arbitrary/external URL smuggled through the login→verify chain.
            router.replace(safeNextRoute(params.next) as never);
          } catch (e) {
            // The verify_token was consumed by the exchange attempt. A consumed/
            // invalid token (INVALID_VERIFY_TOKEN; 401 or 400) can't be reused, so
            // send the user back to re-request cleanly. A transient outage
            // (SESSION_STORE_UNAVAILABLE / 503) is retryable in place.
            const code = e instanceof HttpError ? e.code : undefined;
            if (code === 'SESSION_STORE_UNAVAILABLE' || (e instanceof HttpError && e.status === 503)) {
              setOtp(['', '', '', '', '', '']);
              setError('Temporary server session issue. Please try again in a moment.');
              setTimeout(() => inputs.current[0]?.focus(), 50);
              return;
            }
            goReRequest('Your verification expired. Please request a new code.');
          }
        },
        onError: (e) => {
          const code = e instanceof HttpError ? e.code : undefined;
          // A dead challenge (expired / already used / too many attempts) cannot
          // be retyped — route back to request a fresh code.
          if (code && DEAD_CHALLENGE_CODES.has(code)) {
            goReRequest('That code expired. Please request a new one.');
            return;
          }
          // Everything else stays on-screen. Generic, security-safe copy: never
          // reveal whether the phone is registered or why the code failed.
          const message =
            e instanceof NetworkError
              ? "Couldn't reach SERRALE. Check your internet and try again."
              : e instanceof HttpError && e.status === 429
                ? formatRetryMessage(retryInfoFromError(e))
                : e instanceof HttpError && (e.status === 401 || e.status === 400)
                  ? 'That code is incorrect. Please check the SMS and try again.'
                  : e instanceof ApiBusinessError
                    ? 'That code is incorrect. Please check the SMS and try again.'
                    : 'That code is incorrect. Please check the SMS and try again.';
          setOtp(['', '', '', '', '', '']);
          setError(message);
          setTimeout(() => inputs.current[0]?.focus(), 50);
        },
      },
    );
  };


  const setDigit = (i: number, v: string) => {
    const digit = v.replace(/[^0-9]/g, '').slice(-1);
    const next = otp.slice();
    next[i] = digit;
    setOtp(next);
    setError('');
    if (digit && i < 5) inputs.current[i + 1]?.focus();
    if (next.every((d) => d !== '') && !verifying.current && !verifyMutation.isPending) {
      setTimeout(() => submit(next), 100);
    }
  };

  const onKey = (i: number, key: string) => {
    if (key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const fillDemo = () => {
    const demo = ['1', '2', '3', '4', '5', '6'];
    setOtp(demo);
    setTimeout(() => submit(demo), 150);
  };

  const resendCode = () => {
    // In-flight guard + countdown gate: one resend per user action. The ref stops
    // a synchronous burst; the countdown and isPending guard the rest.
    if (resend > 0 || !phone || resending.current || requestOtp.isPending) return;
    resending.current = true;
    setError('');
    setOtp(['', '', '', '', '', '']);
    const idempotencyKey = newIdempotencyKey();
    requestOtp.mutate(
      { phone, idempotencyKey },
      {
        onSettled: () => {
          resending.current = false;
        },
        onSuccess: (challenge: { challengeId: string }) => {
          setPendingChallengeId(challenge.challengeId);
          setResend(DEFAULT_RESEND_COOLDOWN_SECONDS);
          showToast('Code resent', 'ph-paper-plane-tilt');
          setTimeout(() => inputs.current[0]?.focus(), 50);
        },
        onError: (e) => {
          if (e instanceof HttpError && e.status === 429) {
            // A stricter server cooldown OVERRIDES the local timer — drive the
            // countdown from the server's retry seconds and show a specific wait.
            const info = retryInfoFromError(e);
            if (info.seconds != null) startResendCooldown(info.seconds);
            setError(formatRetryMessage(info));
            return;
          }
          const message =
            e instanceof NetworkError
              ? "Couldn't reach SERRALE. Check your internet and try again."
              : e instanceof Error
                ? e.message
                : 'Could not resend code. Please try again.';
          setError(message);
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
      <View style={styles.body}>
        <Text style={styles.h1}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to <Text style={{ color: colors.text, fontFamily: fonts.bold }}>{phoneDisplay}</Text>.
        </Text>

        <View style={styles.otpWrap}>
          <OtpInput
            value={otp}
            onChangeDigit={setDigit}
            onKeyPress={onKey}
            setRef={(i, el) => { inputs.current[i] = el; }}
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
            <Text style={styles.resendText}>
              {requestOtp.isPending ? 'Sending…' : resend > 0 ? `Resend code in ${resend}s` : 'Resend code'}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.replace({ pathname: '/auth/login', params: { next: params.next } })} hitSlop={8}>
            <Text style={styles.changeText}>Change number</Text>
          </Pressable>
        </View>

        {USE_MOCK && (
          <Pressable style={styles.demo} onPress={fillDemo}>
            <Icon name="ph-magic-wand" size={14} color={colors.muted} />
            <Text style={styles.demoText}>Demo: auto-fill code</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          label={verifyMutation.isPending ? 'Verifying…' : 'Verify'}
          loading={verifyMutation.isPending}
          fullWidth
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
  body: { flex: 1, paddingHorizontal: 22, paddingTop: 10 },
  h1: { fontFamily: fonts.heading, fontSize: 25, color: colors.text, marginTop: 8, marginBottom: 6 },
  subtitle: { fontSize: 13.5, color: colors.muted, lineHeight: 21, fontFamily: fonts.regular },
  otpWrap: { marginTop: 26 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  errorText: { fontSize: 12, color: colors.danger, fontFamily: fonts.regular },
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  resendText: { fontSize: 13, color: colors.faint, fontFamily: fonts.regular },
  changeText: { fontSize: 13, fontFamily: fonts.bold, color: colors.success },
  demo: { marginTop: 20, height: 40, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(6,71,52,0.22)', borderRadius: 11, backgroundColor: colors.ivory, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  demoText: { fontSize: 12.5, fontFamily: fonts.semibold, color: colors.muted },
  footer: { paddingHorizontal: 22, paddingBottom: 22 },
});
