import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../src/lib/icons';
import { colors, fonts, radius } from '../../src/lib/theme';
import { PhoneForm, phoneSchema } from '../../src/schemas/auth';
import { useAppStore } from '../../src/store/appStore';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ reason?: string; next?: string }>();
  const setPendingPhone = useAppStore((s) => s.setPendingPhone);

  const { handleSubmit, watch, setValue, formState } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
    mode: 'onSubmit',
  });
  const phone = watch('phone');
  const error = formState.errors.phone?.message;

  const onSend = handleSubmit((v) => {
    setPendingPhone(v.phone);
    router.push({ pathname: '/auth/verify', params: { next: params.next } });
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={6} accessibilityLabel="Back">
          <Icon name="ph-arrow-left" size={20} color={colors.text} weight="bold" />
        </Pressable>
      </View>

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
            onChangeText={(t) => setValue('phone', t.replace(/[^0-9]/g, '').slice(0, 10))}
            inputMode="numeric"
            placeholder="9 12 345 678"
            placeholderTextColor={colors.faint}
            style={[styles.input, { borderColor: error ? colors.danger : 'rgba(6,71,52,0.14)' }]}
          />
        </View>
        {!!error && (
          <View style={styles.errorRow}>
            <Icon name="ph-warning-circle" size={14} color={colors.danger} weight="fill" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.primary} onPress={onSend}>
          <Text style={styles.primaryText}>Send code</Text>
        </Pressable>
        <Pressable style={styles.guest} onPress={() => router.replace('/(tabs)/home')}>
          <Text style={styles.guestText}>Continue as guest</Text>
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
  iconBox: { width: 54, height: 54, borderRadius: radius.lg + 2, backgroundColor: '#0a5d3f', alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: fonts.heading, fontSize: 25, color: colors.text, marginTop: 18, marginBottom: 6 },
  subtitle: { fontSize: 13.5, color: colors.muted, lineHeight: 21, fontFamily: fonts.regular },
  inputRow: { flexDirection: 'row', gap: 9, marginTop: 24 },
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 52, paddingHorizontal: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(6,71,52,0.14)', borderRadius: radius.md + 1 },
  flag: { fontSize: 16 },
  prefixText: { fontSize: 15, fontFamily: fonts.bold, color: colors.text },
  input: { flex: 1, height: 52, paddingHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderRadius: radius.md + 1, fontSize: 16, fontFamily: fonts.semibold, color: colors.text, letterSpacing: 0.5 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  errorText: { fontSize: 12, color: colors.danger, fontFamily: fonts.regular },
  footer: { paddingHorizontal: 22, paddingBottom: 22 },
  primary: { height: 52, borderRadius: radius.lg, backgroundColor: colors.green800, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontSize: 15, fontFamily: fonts.bold },
  guest: { height: 48, marginTop: 9, alignItems: 'center', justifyContent: 'center' },
  guestText: { color: colors.muted, fontSize: 13.5, fontFamily: fonts.semibold },
});
