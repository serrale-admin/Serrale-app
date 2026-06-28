import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVerifyOtp } from '../../src/hooks/queries';
import { Icon } from '../../src/lib/icons';
import { colors, fonts, radius } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const phone = useAppStore((s) => s.pendingPhone);
  const login = useAppStore((s) => s.login);
  const showToast = useAppStore((s) => s.showToast);
  const verifyMutation = useVerifyOtp();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resend, setResend] = useState(45);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const t = setInterval(() => setResend((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const phoneMasked = (phone.replace('+251', '') || '9XXXXXXXX').replace(/(\d{3})(\d{3})(\d{0,3})/, '$1 $2 $3').trim() || '9XX XXX XXX';

  const submit = (code: string[]) => {
    if (code.some((d) => d === '')) {
      setError('Enter the 6-digit code.');
      return;
    }
    verifyMutation.mutate(
      { phone, code: code.join('') },
      {
        onSuccess: (user) => {
          login(user);
          showToast('Welcome to SERRALE', 'ph-hand-waving');
          const next = (params.next as string) || '/(tabs)/profile';
          router.replace(next as never);
        },
        onError: (e) => setError(e instanceof Error ? e.message : 'Incorrect code'),
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
    if (next.every((d) => d !== '')) setTimeout(() => submit(next), 100);
  };

  const onKey = (i: number, key: string) => {
    if (key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const fillDemo = () => {
    const demo = ['1', '2', '3', '4', '5', '6'];
    setOtp(demo);
    setTimeout(() => submit(demo), 150);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={6} accessibilityLabel="Back">
          <Icon name="ph-arrow-left" size={20} color={colors.text} weight="bold" />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.h1}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to <Text style={{ color: colors.text, fontFamily: fonts.bold }}>+251 {phoneMasked}</Text>.
        </Text>

        <View style={styles.otpRow}>
          {otp.map((d, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              value={d}
              onChangeText={(v) => setDigit(i, v)}
              onKeyPress={(e) => onKey(i, e.nativeEvent.key)}
              inputMode="numeric"
              maxLength={1}
              autoFocus={i === 0}
              style={[styles.otpBox, { borderColor: d ? colors.success : 'rgba(6,71,52,0.18)' }]}
            />
          ))}
        </View>
        {!!error && (
          <View style={styles.errorRow}>
            <Icon name="ph-warning-circle" size={14} color={colors.danger} weight="fill" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>{resend > 0 ? `Resend code in ${resend}s` : 'You can resend the code now'}</Text>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.changeText}>Change number</Text>
          </Pressable>
        </View>

        <Pressable style={styles.demo} onPress={fillDemo}>
          <Icon name="ph-magic-wand" size={14} color={colors.muted} />
          <Text style={styles.demoText}>Demo: auto-fill code</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.primary} onPress={() => submit(otp)} disabled={verifyMutation.isPending}>
          <Text style={styles.primaryText}>{verifyMutation.isPending ? 'Verifying…' : 'Verify'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerRow: { paddingLeft: 8, paddingTop: 2 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, paddingHorizontal: 22, paddingTop: 10 },
  h1: { fontFamily: fonts.heading, fontSize: 25, color: colors.text, marginTop: 8, marginBottom: 6 },
  subtitle: { fontSize: 13.5, color: colors.muted, lineHeight: 21, fontFamily: fonts.regular },
  otpRow: { flexDirection: 'row', gap: 9, marginTop: 26 },
  otpBox: { flex: 1, height: 58, textAlign: 'center', backgroundColor: colors.surface, borderWidth: 1.5, borderRadius: radius.md + 1, fontSize: 23, fontFamily: fonts.bold, color: colors.text },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  errorText: { fontSize: 12, color: colors.danger, fontFamily: fonts.regular },
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  resendText: { fontSize: 13, color: colors.faint, fontFamily: fonts.regular },
  changeText: { fontSize: 13, fontFamily: fonts.bold, color: colors.success },
  demo: { marginTop: 20, height: 40, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(6,71,52,0.22)', borderRadius: 11, backgroundColor: colors.ivory, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  demoText: { fontSize: 12.5, fontFamily: fonts.semibold, color: colors.muted },
  footer: { paddingHorizontal: 22, paddingBottom: 22 },
  primary: { height: 52, borderRadius: radius.lg, backgroundColor: colors.green800, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontSize: 15, fontFamily: fonts.bold },
});
