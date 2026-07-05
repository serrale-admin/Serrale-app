import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiBusinessError, HttpError, NetworkError } from '../../src/api';
import Button from '../../src/components/Button';
import ScreenHeader from '../../src/components/ScreenHeader';
import { useRequestOtp } from '../../src/hooks/queries';
import { Icon } from '../../src/lib/icons';
import { formatRetryMessage, newIdempotencyKey, retryInfoFromError } from '../../src/lib/otp-retry';
import { normalizeEthiopianPhone } from '../../src/lib/phone';
import { colors, fonts, radius } from '../../src/lib/theme';
import { PhoneForm, phoneSchema } from '../../src/schemas/auth';
import { useAppStore } from '../../src/store/appStore';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reason?: string; next?: string }>();
  const setPendingPhone = useAppStore((s) => s.setPendingPhone);
  const setPendingChallengeId = useAppStore((s) => s.setPendingChallengeId);
  const showToast = useAppStore((s) => s.showToast);
  const requestOtp = useRequestOtp();
  // Synchronous in-flight guard. `requestOtp.isPending` flips on the NEXT render,
  // so within one synchronous burst of taps it is still false — a ref flipped
  // immediately is what actually collapses N rapid taps into a single send.
  const sending = useRef(false);

  const { handleSubmit, watch, setValue, formState } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
    mode: 'onSubmit',
  });
  const phone = watch('phone');
  const error = formState.errors.phone?.message;

  const onSend = handleSubmit((v) => {
    // One logical send per user action: ignore duplicate taps while a send is
    // in flight. (React Query dedupes on mutationKey too, and the Idempotency-Key
    // makes a retried request replay the same challenge instead of a new SMS.)
    if (sending.current || requestOtp.isPending) return;
    sending.current = true;
    // One idempotency key per send action.
    const idempotencyKey = newIdempotencyKey();
    requestOtp.mutate(
      { phone: v.phone, idempotencyKey },
      {
        onSuccess: (challenge: { challengeId: string }) => {
          setPendingPhone(normalizeEthiopianPhone(v.phone) || v.phone);
          setPendingChallengeId(challenge.challengeId);
          router.replace({ pathname: '/auth/verify', params: { next: params.next } });
        },
        onError: (e) => {
          const message =
            e instanceof NetworkError
              ? "Couldn't reach SERRALE. Check your internet and try again."
              : e instanceof HttpError && e.status === 429
                ? formatRetryMessage(retryInfoFromError(e))
                : e instanceof ApiBusinessError
                  ? e.message
                  : e instanceof Error
                    ? e.message
                    : 'Could not send code. Please try again.';
          showToast(message, 'ph-warning-circle');
        },
        onSettled: () => {
          sending.current = false;
        },
      },
    );
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
      <View style={styles.body}>
        <View style={styles.iconBox}>
          <Icon name="ph-phone" size={26} color="#fff" weight="fill" />
        </View>
        <Text style={styles.h1}>Log in with phone</Text>
        <Text style={styles.subtitle}>
          {params.reason ? params.reason + '. ' : ''}Use your Ethiopian phone number to continue. We'll send a verification code by SMS.
        </Text>

        <View style={styles.inputRow}>
          <View style={styles.prefix}>
            <Text style={styles.flag}>🇪🇹</Text>
            <Text style={styles.prefixText}>+251</Text>
          </View>
          <TextInput
            value={phone}
            onChangeText={(t) => {
              setValue('phone', t.replace(/[^0-9]/g, '').slice(0, 10));
              if (requestOtp.error) requestOtp.reset();
            }}
            inputMode="numeric"
            placeholder="9 12 345 678"
            placeholderTextColor={colors.faint}
            style={[styles.input, { borderColor: error ? colors.danger : colors.borderField }]}
          />
        </View>
        {!!error && (
          <View style={styles.errorRow}>
            <Icon name="ph-warning-circle" size={14} color={colors.danger} weight="fill" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {requestOtp.error instanceof Error && !error && (
          <View style={styles.errorRow}>
            <Icon name="ph-warning-circle" size={14} color={colors.danger} weight="fill" />
            <Text style={styles.errorText}>
              {requestOtp.error instanceof NetworkError
                ? "Couldn't reach SERRALE. Check your internet and try again."
                : requestOtp.error instanceof HttpError && requestOtp.error.status === 429
                  ? formatRetryMessage(retryInfoFromError(requestOtp.error))
                  : requestOtp.error.message}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          label={requestOtp.isPending ? 'Sending…' : 'Send code'}
          loading={requestOtp.isPending}
          fullWidth
          onPress={onSend}
        />
        <Pressable style={styles.guest} onPress={() => router.replace('/(tabs)/home')} accessibilityRole="button">
          <Text style={styles.guestText}>Continue as guest</Text>
        </Pressable>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 22, paddingTop: 10 },
  iconBox: { width: 54, height: 54, borderRadius: radius.lg + 2, backgroundColor: '#0a5d3f', alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: fonts.heading, fontSize: 25, color: colors.text, marginTop: 18, marginBottom: 6 },
  subtitle: { fontSize: 13.5, color: colors.muted, lineHeight: 21, fontFamily: fonts.regular },
  inputRow: { flexDirection: 'row', gap: 9, marginTop: 24 },
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 52, paddingHorizontal: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderField, borderRadius: radius.md + 1 },
  flag: { fontSize: 16 },
  prefixText: { fontSize: 15, fontFamily: fonts.bold, color: colors.text },
  input: { flex: 1, height: 52, paddingHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderRadius: radius.md + 1, fontSize: 16, fontFamily: fonts.semibold, color: colors.text, letterSpacing: 0.5 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  errorText: { fontSize: 12, color: colors.danger, fontFamily: fonts.regular },
  footer: { paddingHorizontal: 22, paddingBottom: 22 },
  guest: { height: 48, marginTop: 9, alignItems: 'center', justifyContent: 'center' },
  guestText: { color: colors.muted, fontSize: 13.5, fontFamily: fonts.semibold },
});
