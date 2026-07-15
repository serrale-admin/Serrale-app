import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from '../../src/api';
import Button from '../../src/components/Button';
import CategorySheet from '../../src/components/CategorySheet';
import {
  EthiopianPhoneField,
  FieldLabel,
  FormTextInput,
  SelectField,
} from '../../src/components/Field';
import LocationSheet from '../../src/components/LocationSheet';
import OtpInput from '../../src/components/OtpInput';
import ScreenHeader from '../../src/components/ScreenHeader';
import { CATS, JOIN_AREAS } from '../../src/data/mock';
import { areaLabel, categoryLabel } from '../../src/lib/directory-display';
import { presentError } from '../../src/lib/error-presentation';
import { Icon } from '../../src/lib/icons';
import { fill, useLabels } from '../../src/lib/labels';
import { DEFAULT_RESEND_COOLDOWN_SECONDS, newIdempotencyKey, retryInfoFromError } from '../../src/lib/otp-retry';
import { displayEthiopianPhone, normalizeEthiopianPhone } from '../../src/lib/phone';
import { emptyOtp, otpComplete, parseOtpPaste, sanitizeSingleOtpDigit } from '../../src/lib/otp-code';
import { providerSession } from '../../src/lib/provider-session';
import { safeNextRoute } from '../../src/lib/safe-route';
import { colors, fonts, layout, radius, shadowCard } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

type Step = 'form' | 'otp' | 'success';

const TERMS_URL = 'https://serrale.com/terms';
const DEAD_CHALLENGE_CODES = new Set(['OTP_EXPIRED', 'OTP_INVALID_STATUS', 'OTP_MAX_ATTEMPTS', 'OTP_NOT_FOUND']);
const joinTrustArt = require('../../assets/provider-join-banner.png');

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function ProviderJoinScreen() {
  const router = useRouter();
  const labels = useLabels();
  const t = labels.providerJoin;
  const showToast = useAppStore((s) => s.showToast);
  const am = useAppStore((s) => s.lang) === 'am';
  const [step, setStep] = useState<Step>('form');
  const [challengeId, setChallengeId] = useState('');
  const [otp, setOtp] = useState(emptyOtp());
  const [otpErrored, setOtpErrored] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const [showArea, setShowArea] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitCooldown, setSubmitCooldown] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    categorySlug: '',
    area: '',
    experience: '',
  });
  const sending = useRef(false);
  const verifying = useRef(false);
  const resending = useRef(false);
  const challengeIdRef = useRef('');
  const phoneRef = useRef('');

  const otpRequestMutation = useMutation({
    mutationFn: ({ phone, idempotencyKey }: { phone: string; idempotencyKey: string }) =>
      api.requestOtp(phone, 'directory_provider_join', idempotencyKey),
  });
  const otpVerifyMutation = useMutation({
    mutationFn: (code: string) =>
      api.verifyOtp({
        phone: phoneRef.current,
        code,
        challengeId: challengeIdRef.current,
        purpose: 'directory_provider_join',
      }),
  });
  const providerRegisterMutation = useMutation({
    mutationFn: (verifyToken: string) => {
      const whatsapp = form.whatsapp.trim() ? normalizeEthiopianPhone(form.whatsapp) : null;
      return api.registerProvider({
        verifyToken,
        phone: phoneRef.current,
        fullName: form.fullName,
        categorySlug: form.categorySlug,
        area: form.area || undefined,
        whatsappNumber: whatsapp || undefined,
        experience: form.experience || undefined,
      });
    },
  });

  challengeIdRef.current = challengeId;
  phoneRef.current = normalizeEthiopianPhone(form.phone) || form.phone;

  const category = CATS.find((c) => c.id === form.categorySlug);
  const categoryLabelText = category ? categoryLabel(category, am) : '';
  const areaLabelText = form.area ? areaLabel(form.area, am) : '';
  const canVerify = otpComplete(otp);

  useEffect(() => {
    if (submitCooldown <= 0 && resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setSubmitCooldown((s) => (s <= 1 ? 0 : s - 1));
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [submitCooldown, resendCooldown]);

  const startSubmitCooldown = (seconds: number) => {
    setSubmitCooldown((current) => Math.max(current, Math.ceil(seconds)));
  };

  const startResendCooldown = (seconds: number) => {
    setResendCooldown((current) => Math.max(current, Math.ceil(seconds)));
  };

  const toastError = (e: unknown, onRateLimit?: (seconds: number) => void) => {
    if (e instanceof api.HttpError && e.status === 429) {
      const info = retryInfoFromError(e);
      if (info.seconds != null) onRateLimit?.(info.seconds);
    }
    showToast(presentError(e, labels).message, 'ph-warning-circle');
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('form');
      setOtp(emptyOtp());
      setChallengeId('');
      setOtpErrored(false);
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(safeNextRoute('/(tabs)/profile'));
  };

  const validateForm = (): boolean => {
    if (!form.fullName.trim()) {
      showToast(t.requiredFields, 'ph-warning-circle');
      return false;
    }
    if (!normalizeEthiopianPhone(form.phone)) {
      showToast(labels.auth.invalidPhone, 'ph-warning-circle');
      return false;
    }
    if (form.whatsapp.trim() && !normalizeEthiopianPhone(form.whatsapp)) {
      showToast(labels.apiErrors.INVALID_WHATSAPP, 'ph-warning-circle');
      return false;
    }
    if (!form.categorySlug) {
      showToast(t.categoryRequired, 'ph-warning-circle');
      return false;
    }
    if (!termsAccepted) {
      showToast(t.termsRequired, 'ph-warning-circle');
      return false;
    }
    return true;
  };

  const phoneForOtpCopy = form.phone
    ? displayEthiopianPhone(form.phone) || normalizeEthiopianPhone(form.phone) || form.phone
    : '';

  const verifyButtonLabel = otpVerifyMutation.isPending
    ? t.verifyingOtp
    : providerRegisterMutation.isPending
      ? t.registering
      : t.verifyAndRegister;

  const submitForm = async () => {
    if (!validateForm() || sending.current || otpRequestMutation.isPending || submitCooldown > 0) return;
    const normalizedPhone = normalizeEthiopianPhone(form.phone);
    if (!normalizedPhone) return;
    sending.current = true;
    try {
      const otpChallenge = await otpRequestMutation.mutateAsync({
        phone: normalizedPhone,
        idempotencyKey: newIdempotencyKey(),
      });
      challengeIdRef.current = otpChallenge.challengeId;
      phoneRef.current = normalizedPhone;
      setChallengeId(otpChallenge.challengeId);
      setStep('otp');
      setOtpErrored(false);
      startResendCooldown(DEFAULT_RESEND_COOLDOWN_SECONDS);
    } catch (e) {
      toastError(e, startSubmitCooldown);
    } finally {
      sending.current = false;
    }
  };

  const submitOtp = async (digits: string[]) => {
    if (
      verifying.current ||
      otpVerifyMutation.isPending ||
      providerRegisterMutation.isPending ||
      !otpComplete(digits)
    ) {
      return;
    }
    if (!challengeIdRef.current) {
      showToast(labels.verify.codeExpired, 'ph-warning-circle');
      setStep('form');
      setChallengeId('');
      setOtp(emptyOtp());
      return;
    }
    verifying.current = true;
    setOtpErrored(false);
    try {
      const verified = await otpVerifyMutation.mutateAsync(digits.join(''));
      const registered = await providerRegisterMutation.mutateAsync(verified.verifyToken);
      await providerSession.write(registered.session_token, registered.provider);
      const { applyProviderSession } = require('../../src/lib/session-manager');
      const { writeActiveSessionRole } = require('../../src/lib/session-role');
      await writeActiveSessionRole('provider');
      useAppStore.getState().setActiveSession('provider');
      applyProviderSession({
        sessionToken: registered.session_token,
        provider: registered.provider,
        savedAt: new Date().toISOString(),
      });
      setStep('success');
    } catch (e) {
      const code = e instanceof api.HttpError ? e.code : undefined;
      if (code === 'PHONE_ALREADY_REGISTERED') {
        const msg = labels.apiErrors.PHONE_ALREADY_REGISTERED;
        showToast(msg, 'ph-warning-circle');
        setStep('form');
        setChallengeId('');
        setOtp(emptyOtp());
        return;
      }
      if (code && DEAD_CHALLENGE_CODES.has(code)) {
        setStep('form');
        setChallengeId('');
        setOtp(emptyOtp());
        showToast(labels.verify.codeExpired, 'ph-warning-circle');
        return;
      }
      toastError(e, startResendCooldown);
      setOtpErrored(true);
      setOtp(emptyOtp());
      setTimeout(() => inputs.current[0]?.focus(), 60);
    } finally {
      verifying.current = false;
    }
  };

  const resend = async () => {
    const normalizedPhone = normalizeEthiopianPhone(form.phone);
    if (!normalizedPhone || resending.current || otpRequestMutation.isPending || resendCooldown > 0) {
      return;
    }
    resending.current = true;
    setOtpErrored(false);
    try {
      const otpChallenge = await otpRequestMutation.mutateAsync({
        phone: normalizedPhone,
        idempotencyKey: newIdempotencyKey(),
      });
      challengeIdRef.current = otpChallenge.challengeId;
      phoneRef.current = normalizedPhone;
      setChallengeId(otpChallenge.challengeId);
      setOtp(emptyOtp());
      startResendCooldown(DEFAULT_RESEND_COOLDOWN_SECONDS);
      showToast(labels.verify.codeResent, 'ph-paper-plane-tilt');
      setTimeout(() => inputs.current[0]?.focus(), 60);
    } catch (e) {
      toastError(e, startResendCooldown);
    } finally {
      resending.current = false;
    }
  };

  const applyOtp = (next: string[], autoSubmit = true) => {
    setOtp(next);
    setOtpErrored(false);
    if (autoSubmit && otpComplete(next) && !verifying.current && !otpVerifyMutation.isPending) {
      setTimeout(() => submitOtp(next), 120);
    }
  };

  const setDigit = (i: number, value: string) => {
    const digit = sanitizeSingleOtpDigit(value);
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

  const openTerms = () => {
    Linking.openURL(TERMS_URL).catch(() => showToast(labels.errors.connectionMessage, 'ph-warning-circle'));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader onBack={handleBack} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <ScrollView
          contentContainerStyle={[styles.scrollBody, step === 'form' && styles.scrollBodyForm]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step !== 'success' && (
            <>
              <View style={styles.heroRow}>
                <View style={styles.heroIcon}>
                  <Icon name="ph-storefront" size={18} color={colors.green800} weight="fill" />
                </View>
                <View style={styles.heroCopy}>
                  <Text style={styles.eyebrow}>{t.eyebrow}</Text>
                  <Text style={styles.h1}>{t.title}</Text>
                </View>
              </View>

              <View style={styles.trustBanner}>
                <Image
                  source={joinTrustArt}
                  style={styles.trustArtBg}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
                <LinearGradient
                  colors={[
                    'rgba(4,47,34,0.80)',
                    'rgba(6,71,52,0.58)',
                    'rgba(6,71,52,0.22)',
                    'rgba(6,71,52,0.02)',
                  ]}
                  locations={[0, 0.36, 0.58, 0.86]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.trustCopy}>
                  <Text style={styles.trustTitle} numberOfLines={2}>
                    {t.trustAside}
                  </Text>
                </View>
              </View>
            </>
          )}

          {step === 'form' && (
            <View style={styles.formStack}>
              <SectionCard title={t.sectionContact}>
                <FormTextInput
                  compact
                  label={t.fullName}
                  value={form.fullName}
                  onChangeText={(v) => setForm((s) => ({ ...s, fullName: v }))}
                />
                <EthiopianPhoneField
                  compact
                  label={t.phone}
                  value={form.phone}
                  onChangeText={(v) => setForm((s) => ({ ...s, phone: v }))}
                />
                <EthiopianPhoneField
                  compact
                  optional
                  label={t.whatsapp}
                  value={form.whatsapp}
                  onChangeText={(v) => setForm((s) => ({ ...s, whatsapp: v }))}
                />
              </SectionCard>

              <SectionCard title={t.sectionService}>
                <FieldLabel compact>{t.serviceCategory}</FieldLabel>
                <SelectField
                  compact
                  onPress={() => setShowCategory(true)}
                  icon="ph-wrench"
                  iconColor={colors.green700}
                  iconWeight="fill"
                  value={categoryLabelText}
                  placeholder={t.selectCategory}
                  caret="down"
                  accessibilityLabel={labels.a11y.selectService}
                />

                <FieldLabel compact optional>
                  {t.area}
                </FieldLabel>
                <SelectField
                  compact
                  onPress={() => setShowArea(true)}
                  icon="ph-map-pin"
                  iconColor={colors.green700}
                  iconWeight="fill"
                  value={areaLabelText}
                  placeholder={t.selectArea}
                  caret="down"
                  accessibilityLabel={labels.a11y.selectArea}
                />

                <FormTextInput
                  compact
                  optional
                  label={t.experience}
                  placeholder={t.experienceExample}
                  value={form.experience}
                  onChangeText={(v) => setForm((s) => ({ ...s, experience: v }))}
                />

                <View style={styles.photoPlaceholder} accessibilityLabel={t.photoTitle}>
                  <Text style={styles.photoTitle}>{t.photoTitle}</Text>
                  <Text style={styles.photoDesc}>{t.photoDesc}</Text>
                </View>
              </SectionCard>
            </View>
          )}

          {step === 'otp' && (
            <View style={styles.formStack}>
              <View style={styles.otpCard}>
                <Text style={styles.stepTitle}>{t.otpSentTitle}</Text>
                <Text style={styles.helper}>{fill(t.otpSentBody, { phone: phoneForOtpCopy })}</Text>
                <View style={styles.otpInputWrap}>
                  <OtpInput
                    value={otp}
                    onChangeDigit={setDigit}
                    onPaste={handlePaste}
                    onKeyPress={onKey}
                    setRef={(i, el) => {
                      inputs.current[i] = el;
                    }}
                    errored={otpErrored}
                  />
                </View>
                <View style={styles.otpActions}>
                  <Pressable onPress={resend} disabled={resendCooldown > 0 || otpRequestMutation.isPending} hitSlop={8}>
                    <Text style={[styles.link, (resendCooldown > 0 || otpRequestMutation.isPending) && styles.linkMuted]}>
                      {otpRequestMutation.isPending
                        ? labels.auth.sending
                        : resendCooldown > 0
                          ? fill(labels.verify.resendIn, { seconds: resendCooldown })
                          : labels.verify.resend}
                    </Text>
                  </Pressable>
                  <Pressable onPress={handleBack} hitSlop={8}>
                    <Text style={styles.link}>{t.editDetails}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {step === 'success' && (
            <LinearGradient colors={[colors.green800, colors.green700]} style={styles.successCard}>
              <Icon name="ph-check-circle" size={32} color={colors.gold} weight="fill" />
              <Text style={styles.successTitle}>{t.successTitle}</Text>
              <Text style={styles.successText}>{t.successText}</Text>
              <Button label={t.backToProfile} variant="gold" onPress={() => router.replace('/(tabs)/profile')} fullWidth />
            </LinearGradient>
          )}
        </ScrollView>

        {step === 'form' && (
          <View style={styles.footer}>
            <View style={styles.termsCenter}>
              <View style={styles.termsRow}>
                <Pressable
                  onPress={() => setTermsAccepted((v) => !v)}
                  hitSlop={6}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: termsAccepted }}
                >
                  <Icon
                    name={termsAccepted ? 'ph-check-square' : 'ph-square'}
                    size={20}
                    color={termsAccepted ? colors.green800 : colors.faint}
                    weight={termsAccepted ? 'fill' : 'regular'}
                  />
                </Pressable>
                <View style={styles.termsCopy}>
                  <Text style={styles.termsText}>{t.termsPrefix}</Text>
                  <Pressable onPress={openTerms} hitSlop={4}>
                    <Text style={styles.termsLink}>{t.termsLink}</Text>
                  </Pressable>
                  {!!t.termsSuffix && <Text style={styles.termsText}>{t.termsSuffix}</Text>}
                </View>
              </View>
            </View>
            <Button
              label={otpRequestMutation.isPending ? t.sendingOtp : t.submit}
              icon="ph-paper-plane-tilt"
              variant="gold"
              size="md"
              loading={otpRequestMutation.isPending}
              disabled={submitCooldown > 0 || otpRequestMutation.isPending}
              onPress={submitForm}
              fullWidth
              style={styles.submitBtn}
            />
            <Text style={styles.submitHint}>{t.submitHint}</Text>
          </View>
        )}

        {step === 'otp' && (
          <View style={styles.footer}>
            <Button
              label={verifyButtonLabel}
              variant="gold"
              size="md"
              loading={otpVerifyMutation.isPending || providerRegisterMutation.isPending}
              onPress={() => submitOtp(otp)}
              fullWidth
              disabled={!canVerify}
              style={styles.submitBtn}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      <CategorySheet
        visible={showCategory}
        onClose={() => setShowCategory(false)}
        value={form.categorySlug}
        title={t.selectCategory}
        excludeIds={['more-services']}
        onSelect={(id) => setForm((s) => ({ ...s, categorySlug: id }))}
      />
      <LocationSheet
        visible={showArea}
        onClose={() => setShowArea(false)}
        value={form.area}
        areas={JOIN_AREAS}
        title={t.selectArea}
        onSelect={(area) => setForm((s) => ({ ...s, area }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scrollBody: { paddingHorizontal: layout.gutter, paddingBottom: 12 },
  scrollBodyForm: { paddingBottom: 120 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 0 },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    borderWidth: 1.5,
    borderColor: colors.green800,
  },
  heroCopy: { flex: 1, minWidth: 0 },
  eyebrow: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.green700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  h1: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 22, color: colors.green900 },
  trustBanner: {
    marginTop: 10,
    borderRadius: radius.lg,
    overflow: 'hidden',
    height: 80,
    position: 'relative',
    ...shadowCard,
    shadowOpacity: 0.06,
  },
  trustArtBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  trustCopy: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    zIndex: 1,
    maxWidth: '62%',
  },
  trustTitle: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 19, color: colors.onDark },
  formStack: { marginTop: 10, gap: 8 },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 6,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 12, color: colors.green900 },
  sectionBody: { gap: 6 },
  photoPlaceholder: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    backgroundColor: colors.soft,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
  photoTitle: { fontFamily: fonts.semibold, fontSize: 12, color: colors.green900 },
  photoDesc: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 15, color: colors.muted },
  termsCenter: { alignItems: 'center', paddingBottom: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, maxWidth: 320 },
  termsCopy: { flexShrink: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 2 },
  termsText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.text, textAlign: 'center' },
  termsLink: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 17, color: colors.green800, textDecorationLine: 'underline' },
  otpCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 10,
    ...shadowCard,
    shadowOpacity: 0.06,
  },
  stepTitle: { fontFamily: fonts.heading, color: colors.green900, fontSize: 17, lineHeight: 22 },
  helper: { fontFamily: fonts.regular, color: colors.muted, fontSize: 13, lineHeight: 18 },
  otpInputWrap: { width: '100%', paddingVertical: 4, overflow: 'hidden', alignItems: 'center' },
  otpActions: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 0 },
  link: { fontFamily: fonts.semibold, color: colors.green800, fontSize: 12 },
  linkMuted: { color: colors.faint },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 6 : 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.bg,
    gap: 7,
  },
  submitBtn: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.green800,
  },
  submitHint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  successCard: {
    marginTop: 8,
    borderRadius: radius.xxl,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  successTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.onDark, textAlign: 'center' },
  successText: {
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 6,
  },
});
