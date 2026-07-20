import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ReactNode, useEffect, useState } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../src/components/Button';
import CategorySheet from '../../src/components/CategorySheet';
import Chip from '../../src/components/Chip';
import { FieldLabel, FormTextArea, SelectField } from '../../src/components/Field';
import LocationSheet from '../../src/components/LocationSheet';
import { CATS } from '../../src/data/mock';
import { useCreateRequest } from '../../src/hooks/queries';
import { resolveCustomerFeatureAccess } from '../../src/lib/customerFeatureAccess';
import { areaLabel, categoryLabel } from '../../src/lib/directory-display';
import { presentError } from '../../src/lib/error-presentation';
import { Icon } from '../../src/lib/icons';
import { fill, useLabels } from '../../src/lib/labels';
import { colors, fonts, layout, radius, shadowCard } from '../../src/lib/theme';
import { defaultRequest, RequestForm, requestSchema } from '../../src/schemas/request';
import { useAppStore } from '../../src/store/appStore';

const WHEN = ['Emergency', 'Today', 'This week', 'Flexible'] as const;
const BUDGETS = ['Not sure', 'Under 1,000 ETB', '1,000–3,000 ETB', '3,000–7,000 ETB', '7,000+ ETB'];
const CONTACT = ['Call', 'WhatsApp', 'Both'] as const;
const WHEN_ICON: Record<(typeof WHEN)[number], string> = {
  Emergency: 'ph-warning-circle',
  Today: 'ph-lightning',
  'This week': 'ph-calendar-blank',
  Flexible: 'ph-clock',
};
const CONTACT_ICON: Record<(typeof CONTACT)[number], string> = {
  Call: 'ph-phone',
  WhatsApp: 'ph-whatsapp-logo',
  Both: 'ph-chats-circle',
};

const HERO_GRADIENT = {
  colors: ['rgba(4,47,34,0.82)', 'rgba(6,71,52,0.55)', 'rgba(6,71,52,0.18)'] as const,
  locations: [0, 0.45, 1] as const,
};
const requestHeroPhoto = require('../../assets/categories-banner.png');

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function ResultCard({
  icon,
  iconColor = colors.green700,
  title,
  text,
  subtext,
  children,
}: {
  icon: string;
  iconColor?: string;
  title: string;
  text: string;
  subtext?: string;
  children: ReactNode;
}) {
  return (
    <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
      <View style={styles.resultCard}>
        <View style={styles.resultIconWrap}>
          <Icon name={icon} size={26} color={iconColor} weight="fill" />
        </View>
        <Text style={styles.resultTitle}>{title}</Text>
        <Text style={styles.resultText}>{text}</Text>
        {!!subtext && <Text style={styles.resultSubtext}>{subtext}</Text>}
        <View style={styles.resultActions}>{children}</View>
      </View>
    </ScrollView>
  );
}

export default function RequestScreen() {
  const router = useRouter();
  const area = useAppStore((s) => s.area);
  const lang = useAppStore((s) => s.lang);
  const sessionReady = useAppStore((s) => s.sessionReady);
  const loggedIn = useAppStore((s) => s.loggedIn);
  const activeSession = useAppStore((s) => s.activeSession);
  const providerProfile = useAppStore((s) => s.providerProfile);
  const access = resolveCustomerFeatureAccess({
    sessionReady,
    loggedIn,
    activeSession,
    hasProviderProfile: !!providerProfile,
  });
  const showToast = useAppStore((s) => s.showToast);
  const am = lang === 'am';

  const mutation = useCreateRequest();
  const labels = useLabels();
  const t = labels.request;
  const errorView = mutation.isError ? presentError(mutation.error, labels) : null;
  const engagementLabel: Record<'Temporary' | 'Permanent', string> = {
    Temporary: t.engagement.temporary,
    Permanent: t.engagement.permanent,
  };
  const whenLabel: Record<(typeof WHEN)[number], string> = {
    Emergency: t.when.emergency,
    Today: t.when.today,
    'This week': t.when.thisWeek,
    Flexible: t.when.flexible,
  };
  const contactLabel: Record<(typeof CONTACT)[number], string> = {
    Call: t.contact.call,
    WhatsApp: t.contact.whatsapp,
    Both: t.contact.both,
  };
  const budgetLabel: Record<string, string> = {
    'Not sure': t.budget.notSure,
    'Under 1,000 ETB': t.budget.under1000,
    '1,000–3,000 ETB': t.budget.between1,
    '3,000–7,000 ETB': t.budget.between2,
    '7,000+ ETB': t.budget.over7000,
  };
  const { handleSubmit, watch, setValue, reset, clearErrors, formState: { errors } } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: defaultRequest(area),
  });
  const values = watch();

  const fieldError = (name: keyof RequestForm) => {
    if (name === 'categoryId' && errors.categoryId) return t.chooseService;
    if (name === 'area' && errors.area) return t.chooseArea;
    return undefined;
  };

  const mutationErrorText = mutation.error ? presentError(mutation.error, labels).message : null;
  useEffect(() => {
    if (mutationErrorText) showToast(mutationErrorText, 'ph-warning-circle');
  }, [mutationErrorText, showToast]);

  const [showCat, setShowCat] = useState(false);
  const [showArea, setShowArea] = useState(false);

  const startOver = () => {
    mutation.reset();
    reset(defaultRequest(area));
  };

  if (mutation.isSuccess) {
    const wasDuplicate = mutation.data?.duplicate;
    const successArea = mutation.variables?.area ? areaLabel(mutation.variables.area, am) : areaLabel(area, am);
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ResultCard
          icon="ph-check-circle"
          iconColor={colors.success}
          title={wasDuplicate ? t.successDupTitle : t.successTitle}
          text={wasDuplicate ? t.successDupText : fill(t.successText, { area: successArea })}
          subtext={t.successBody}
        >
          <Button label={labels.activity.viewMyRequests} variant="gold" size="md" fullWidth onPress={() => router.push('/bookmarks?tab=requests')} />
          <Button label={labels.common.browseProviders} variant="secondary" size="md" fullWidth onPress={() => router.push('/providers')} />
          <Button label={t.postAnother} variant="secondary" size="md" fullWidth onPress={startOver} />
        </ResultCard>
      </SafeAreaView>
    );
  }

  if (access === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ResultCard icon="ph-hand-heart" title={t.title} text={t.subtitle}>
          <Button label={labels.common.loading} variant="secondary" size="md" fullWidth disabled onPress={() => {}} />
        </ResultCard>
      </SafeAreaView>
    );
  }

  if (access === 'need_login') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ResultCard icon="ph-hand-heart" title={t.gateTitle} text={t.gateText}>
          <Button
            label={labels.common.loginWithPhone}
            icon="ph-phone"
            iconWeight="fill"
            variant="gold"
            size="md"
            fullWidth
            onPress={() =>
              router.replace({ pathname: '/auth/login', params: { reason: labels.auth.reasonRequest, next: '/(tabs)/request' } })
            }
          />
          <Button label={t.continueBrowsing} variant="secondary" size="md" fullWidth onPress={() => router.push('/(tabs)/search')} />
        </ResultCard>
      </SafeAreaView>
    );
  }

  const cat = CATS.find((c) => c.id === values.categoryId);
  const categoryLabelText = cat ? categoryLabel(cat, am) : '';
  const areaDisplay = values.area ? areaLabel(values.area, am) : areaLabel(area, am);
  const onInvalid = (formErrors: FieldErrors<RequestForm>) => {
    if (formErrors.categoryId) return showToast(t.chooseService, 'ph-warning-circle');
    if (formErrors.area) return showToast(t.chooseArea, 'ph-warning-circle');
    showToast(t.chooseService, 'ph-warning-circle');
  };
  const submit = handleSubmit((v) => mutation.mutate(v), onInvalid);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="SERRALE" />
            <Pressable
              style={({ pressed }) => [styles.locPill, pressed && styles.pressed]}
              onPress={() => setShowArea(true)}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={fill(labels.a11y.location, { area: areaDisplay })}
            >
              <Icon name="ph-map-pin" size={13} color={colors.green700} weight="fill" />
              <Text style={styles.locText} numberOfLines={1}>
                {areaDisplay}
              </Text>
              <Icon name="ph-caret-down" size={10} color={colors.green800} weight="bold" />
            </Pressable>
          </View>

          <View style={styles.heroWrap}>
            <ImageBackground source={requestHeroPhoto} style={styles.heroPhoto} imageStyle={styles.heroPhotoImage} resizeMode="cover">
              <LinearGradient colors={[...HERO_GRADIENT.colors]} locations={[...HERO_GRADIENT.locations]} style={styles.heroOverlay}>
                <View style={styles.heroBadge}>
                  <Icon name="ph-hand-heart" size={11} color={colors.gold} weight="fill" />
                  <Text style={styles.heroBadgeText}>{t.heroBadge}</Text>
                </View>
                <Text style={styles.heroTitle}>{t.title}</Text>
                <Text style={styles.heroSub}>{t.subtitle}</Text>
              </LinearGradient>
            </ImageBackground>
          </View>

          <View style={styles.formStack}>
            <SectionCard title={t.sectionDetails}>
              <FieldLabel compact>{t.serviceLabel}</FieldLabel>
              <SelectField
                compact
                onPress={() => setShowCat(true)}
                icon="ph-wrench"
                iconColor={colors.green700}
                iconWeight="fill"
                value={categoryLabelText}
                placeholder={t.servicePlaceholder}
                caret="down"
                errored={!!errors.categoryId}
                error={fieldError('categoryId')}
                accessibilityLabel={labels.a11y.selectService}
              />

              <FieldLabel compact>{t.areaLabel}</FieldLabel>
              <SelectField
                compact
                onPress={() => setShowArea(true)}
                icon="ph-map-pin"
                iconColor={colors.green700}
                iconWeight="fill"
                value={values.area ? areaLabel(values.area, am) : ''}
                placeholder={t.areaLabel}
                caret="down"
                errored={!!errors.area}
                error={fieldError('area')}
                accessibilityLabel={labels.a11y.selectArea}
              />

              <FieldLabel compact optional>
                {t.engagementLabel}
              </FieldLabel>
              <View style={styles.chipWrap}>
                {(['Temporary', 'Permanent'] as const).map((e) => {
                  const active = values.engagement === e;
                  return (
                    <Chip
                      key={e}
                      label={engagementLabel[e]}
                      active={active}
                      height={32}
                      onPress={() => setValue('engagement', active ? '' : e)}
                    />
                  );
                })}
              </View>

              <FormTextArea
                compact
                optional
                label={t.describeLabel}
                value={values.description}
                onChangeText={(text) => setValue('description', text.slice(0, 300), { shouldValidate: true })}
                placeholder={t.descPlaceholder}
              />
              <Text style={styles.counter}>{values.description.length}/300</Text>
            </SectionCard>

            <SectionCard title={t.sectionTiming}>
              <FieldLabel compact>{t.whenLabel}</FieldLabel>
              <View style={styles.chipWrap}>
                {WHEN.map((w) => (
                  <Chip
                    key={w}
                    label={whenLabel[w]}
                    iconName={WHEN_ICON[w]}
                    iconColor={values.when === w ? colors.onDark : colors.green700}
                    active={values.when === w}
                    height={32}
                    onPress={() => setValue('when', w)}
                  />
                ))}
              </View>

              <FieldLabel compact optional>
                {t.budgetLabel}
              </FieldLabel>
              <View style={styles.chipWrap}>
                {BUDGETS.map((b) => {
                  const active = values.budget === b;
                  return (
                    <Chip
                      key={b}
                      label={budgetLabel[b] ?? b}
                      active={active}
                      height={32}
                      onPress={() => setValue('budget', active ? '' : b)}
                    />
                  );
                })}
              </View>
            </SectionCard>

            <SectionCard title={t.sectionContact}>
              <FieldLabel compact>{t.contactLabel}</FieldLabel>
              <View style={styles.contactRow}>
                {CONTACT.map((c) => {
                  const active = values.preferredContact === c;
                  return (
                    <Pressable
                      key={c}
                      style={[styles.contactBtn, active && styles.contactActive]}
                      onPress={() => setValue('preferredContact', c)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Icon name={CONTACT_ICON[c]} size={14} color={active ? colors.onDark : colors.green800} weight="fill" />
                      <Text style={[styles.contactText, active && styles.contactTextActive]} numberOfLines={1}>
                        {contactLabel[c]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </SectionCard>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={
              mutation.isPending
                ? t.submitting
                : errorView?.kind === 'session-expired'
                  ? errorView.action
                  : mutation.isError
                    ? labels.errors.retry
                    : t.submit
            }
            icon="ph-paper-plane-tilt"
            variant="gold"
            size="md"
            fullWidth
            loading={mutation.isPending}
            onPress={
              errorView?.kind === 'session-expired'
                ? () => router.replace({ pathname: '/auth/login', params: { next: '/(tabs)/request' } })
                : submit
            }
          />
          <Text style={styles.submitHint}>{t.submitHint}</Text>
        </View>
      </KeyboardAvoidingView>

      <CategorySheet
        visible={showCat}
        onClose={() => setShowCat(false)}
        value={values.categoryId}
        onSelect={(id) => {
          setValue('categoryId', id, { shouldValidate: true });
          clearErrors('categoryId');
        }}
      />
      <LocationSheet
        visible={showArea}
        onClose={() => setShowArea(false)}
        value={values.area}
        onSelect={(a) => {
          setValue('area', a, { shouldValidate: true });
          clearErrors('area');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { paddingBottom: 12 },
  pressed: { opacity: 0.88 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.gutter,
    paddingTop: 2,
    paddingBottom: 4,
  },
  logo: { height: 36, width: 96, tintColor: colors.green800 },
  locPill: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.soft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: '56%',
  },
  locText: { flexShrink: 1, fontSize: 12.5, fontFamily: fonts.semibold, color: colors.text },
  heroWrap: {
    marginHorizontal: layout.gutter,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: 10,
    ...shadowCard,
    shadowOpacity: 0.08,
  },
  heroPhoto: { width: '100%', minHeight: 104 },
  heroPhotoImage: {
    borderRadius: radius.xl,
    height: '112%',
    transform: [{ translateY: -4 }],
  },
  heroOverlay: {
    flex: 1,
    minHeight: 104,
    paddingHorizontal: 13,
    paddingVertical: 12,
    justifyContent: 'flex-end',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  heroBadgeText: { fontSize: 10, fontFamily: fonts.bold, color: colors.onDark, letterSpacing: 0.15 },
  heroTitle: { fontFamily: fonts.heading, fontSize: 17, color: colors.onDark, lineHeight: 21 },
  heroSub: { marginTop: 3, fontSize: 11.5, lineHeight: 16, color: 'rgba(255,255,255,0.88)', fontFamily: fonts.regular },
  formStack: { paddingHorizontal: layout.gutter, gap: 10, maxWidth: layout.contentMaxWidth, alignSelf: 'center', width: '100%' },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 13,
    ...shadowCard,
    shadowOpacity: 0.05,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.green900,
    marginBottom: 8,
    lineHeight: 18,
  },
  sectionBody: { gap: 8 },
  counter: { textAlign: 'right', fontSize: 10.5, color: colors.muted, marginTop: -2, fontFamily: fonts.regular },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  contactRow: {
    flexDirection: 'row',
    gap: 5,
    backgroundColor: colors.frost,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.frostBorder,
    padding: 4,
  },
  contactBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 4,
  },
  contactActive: { backgroundColor: colors.green800 },
  contactText: { fontSize: 11.5, fontFamily: fonts.bold, color: colors.green800 },
  contactTextActive: { color: colors.onDark },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(6,71,52,0.08)',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  submitHint: {
    marginTop: 8,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.muted,
    textAlign: 'center',
    fontFamily: fonts.regular,
    paddingHorizontal: 6,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  errorText: { flex: 1, fontSize: 11.5, color: colors.danger, fontFamily: fonts.regular, lineHeight: 15 },
  resultWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.gutter,
    paddingVertical: 20,
  },
  resultCard: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 22,
    ...shadowCard,
    shadowOpacity: 0.06,
  },
  resultIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.green900,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 23,
  },
  resultText: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
  resultSubtext: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
    marginTop: 6,
    textAlign: 'center',
    fontFamily: fonts.regular,
    paddingHorizontal: 4,
  },
  resultActions: { width: '100%', marginTop: 16, gap: 8 },
});
