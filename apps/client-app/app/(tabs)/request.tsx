import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategorySheet from '../../src/components/CategorySheet';
import LocationSheet from '../../src/components/LocationSheet';
import { CATS } from '../../src/data/mock';
import { useCreateRequest } from '../../src/hooks/queries';
import { Icon } from '../../src/lib/icons';
import { colors, fonts, radius } from '../../src/lib/theme';
import { defaultRequest, RequestForm, requestSchema } from '../../src/schemas/request';
import { useAppStore } from '../../src/store/appStore';

const WHEN = ['Today', 'This week', 'Flexible'] as const;
const BUDGETS = ['Not sure', 'Under 1,000 ETB', '1,000–3,000 ETB', '3,000–7,000 ETB', '7,000+ ETB'];
const CONTACT = ['Call', 'WhatsApp', 'Both'] as const;
const CONTACT_ICON: Record<string, string> = { Call: 'ph-phone', WhatsApp: 'ph-whatsapp-logo', Both: 'ph-chats-circle' };

export default function RequestScreen() {
  const router = useRouter();
  const area = useAppStore((s) => s.area);
  const lang = useAppStore((s) => s.lang);
  const loggedIn = useAppStore((s) => s.loggedIn);
  const showToast = useAppStore((s) => s.showToast);
  const am = lang === 'am';

  const mutation = useCreateRequest();
  const { handleSubmit, watch, setValue, reset } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: defaultRequest(area),
  });
  const values = watch();

  const [showCat, setShowCat] = useState(false);
  const [showArea, setShowArea] = useState(false);

  // Success state
  if (mutation.isSuccess) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.centerWrap} showsVerticalScrollIndicator={false}>
          <View style={[styles.bigCircle, { backgroundColor: colors.soft }]}>
            <Icon name="ph-check-circle" size={48} color={colors.success} weight="fill" />
          </View>
          <Text style={styles.successTitle}>We received your request</Text>
          <Text style={styles.successText}>SERRALE will help match your request with relevant providers near {mutation.variables?.area}.</Text>
          <Pressable style={[styles.primaryWide, { backgroundColor: colors.green800 }]} onPress={() => router.push('/providers')}>
            <Text style={styles.primaryWideText}>Browse providers</Text>
          </Pressable>
          <Pressable style={styles.outlineWide} onPress={() => { mutation.reset(); reset(defaultRequest(area)); showToast('No active requests yet', 'ph-tray'); }}>
            <Text style={styles.outlineWideText}>View my requests</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Guest gate
  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.centerWrap} showsVerticalScrollIndicator={false}>
          <View style={styles.gateIcon}>
            <Icon name="ph-hand-heart" size={40} color={colors.goldText} weight="fill" />
          </View>
          <Text style={styles.successTitle}>Post a service request</Text>
          <Text style={styles.successText}>Log in with your phone to tell SERRALE what you need. We'll help you find the right provider.</Text>
          <Pressable style={[styles.primaryWide, { backgroundColor: colors.green800 }]} onPress={() => router.replace({ pathname: '/auth/login', params: { reason: 'Log in to post a request', next: '/(tabs)/request' } })}>
            <Icon name="ph-phone" size={17} color="#fff" weight="fill" />
            <Text style={styles.primaryWideText}>Log in with phone</Text>
          </Pressable>
          <Pressable style={styles.outlineWide} onPress={() => router.push('/categories')}>
            <Text style={styles.outlineWideText}>Continue browsing</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const cat = CATS.find((c) => c.id === values.categoryId);
  const onInvalid = () => showToast(!values.categoryId ? 'Choose a service' : 'Describe the work briefly', 'ph-warning-circle');
  const submit = handleSubmit((v) => mutation.mutate(v), onInvalid);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.formHeader}>
        <Text style={styles.h1}>Post a request</Text>
        <Text style={styles.subtitle}>Tell us what you need — it only takes a moment.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>What service do you need?</Text>
        <Pressable style={styles.select} onPress={() => setShowCat(true)}>
          <Icon name="ph-magnifying-glass" size={17} color={colors.muted} />
          <Text style={[styles.selectText, { color: cat ? colors.text : colors.faint }]}>
            {cat ? (am ? cat.am : cat.name) : 'e.g. plumber, cleaner, painter'}
          </Text>
          <Icon name="ph-caret-right" size={13} color={colors.faint} weight="bold" />
        </Pressable>

        <Text style={[styles.label, { marginTop: 18 }]}>Where do you need it?</Text>
        <Pressable style={styles.select} onPress={() => setShowArea(true)}>
          <Icon name="ph-map-pin" size={16} color={colors.success} weight="fill" />
          <Text style={[styles.selectText, { fontFamily: fonts.medium }]}>{values.area}</Text>
          <Icon name="ph-caret-down" size={13} color={colors.faint} weight="bold" />
        </Pressable>

        <Text style={[styles.label, { marginTop: 18 }]}>Describe the work</Text>
        <TextInput
          value={values.description}
          onChangeText={(t) => setValue('description', t.slice(0, 300))}
          placeholder="Example: I need help fixing a leaking sink."
          placeholderTextColor={colors.faint}
          multiline
          style={styles.textarea}
        />
        <Text style={styles.counter}>{values.description.length}/300</Text>

        <Text style={[styles.label, { marginTop: 14 }]}>When do you need it?</Text>
        <View style={styles.rowGap}>
          {WHEN.map((w) => (
            <Pressable key={w} style={[styles.segment, values.when === w && styles.segmentActive]} onPress={() => setValue('when', w)}>
              <Text style={[styles.segmentText, values.when === w && styles.segmentTextActive]}>{w}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 18 }]}>
          Budget <Text style={styles.optional}>(optional)</Text>
        </Text>
        <View style={styles.wrapRow}>
          {BUDGETS.map((b) => {
            const active = values.budget === b;
            return (
              <Pressable key={b} style={[styles.budget, active && styles.segmentActive]} onPress={() => setValue('budget', active ? '' : b)}>
                <Text style={[styles.budgetText, active && styles.segmentTextActive]}>{b}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 18 }]}>How should providers contact you?</Text>
        <View style={styles.contactGroup}>
          {CONTACT.map((c) => {
            const active = values.preferredContact === c;
            return (
              <Pressable key={c} style={[styles.contactBtn, active && styles.contactActive]} onPress={() => setValue('preferredContact', c)}>
                <Icon name={CONTACT_ICON[c]} size={15} color={active ? colors.green800 : '#5a7a6c'} weight="fill" />
                <Text style={[styles.contactText, { color: active ? colors.green800 : '#5a7a6c' }]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.submit} onPress={submit} disabled={mutation.isPending}>
          <Icon name="ph-paper-plane-tilt" size={17} color={colors.text} weight="bold" />
          <Text style={styles.submitText}>{mutation.isPending ? 'Submitting…' : 'Submit request'}</Text>
        </Pressable>
      </View>

      <CategorySheet visible={showCat} onClose={() => setShowCat(false)} onSelect={(id) => setValue('categoryId', id)} />
      <LocationSheet visible={showArea} onClose={() => setShowArea(false)} value={values.area} onSelect={(a) => setValue('area', a)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  centerWrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 24 },
  bigCircle: { width: 84, height: 84, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  gateIcon: { width: 78, height: 78, borderRadius: 22, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontFamily: fonts.heading, fontSize: 23, color: colors.text, marginTop: 18, textAlign: 'center' },
  successText: { fontSize: 13.5, color: colors.muted, lineHeight: 21, marginTop: 9, textAlign: 'center', maxWidth: 290, fontFamily: fonts.regular },
  primaryWide: { marginTop: 24, width: '100%', maxWidth: 290, height: 50, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryWideText: { color: '#fff', fontSize: 15, fontFamily: fonts.bold },
  outlineWide: { marginTop: 11, width: '100%', maxWidth: 290, height: 48, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(6,71,52,0.16)', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  outlineWideText: { color: colors.green800, fontSize: 14, fontFamily: fonts.bold },
  formHeader: { paddingHorizontal: 16, paddingTop: 2, paddingBottom: 8 },
  h1: { fontFamily: fonts.heading, fontSize: 25, color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 3, fontFamily: fonts.regular },
  form: { paddingHorizontal: 16, paddingTop: 8 },
  label: { fontSize: 13, fontFamily: fonts.bold, color: colors.text, marginBottom: 7 },
  optional: { fontFamily: fonts.medium, color: colors.faint },
  select: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(6,71,52,0.14)', borderRadius: radius.md + 1 },
  selectText: { flex: 1, fontSize: 14, fontFamily: fonts.regular },
  textarea: { height: 92, padding: 12, paddingTop: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(6,71,52,0.14)', borderRadius: radius.md + 1, fontSize: 13.5, fontFamily: fonts.regular, color: colors.text, textAlignVertical: 'top', lineHeight: 20 },
  counter: { textAlign: 'right', fontSize: 11, color: colors.faint, marginTop: 4, fontFamily: fonts.regular },
  rowGap: { flexDirection: 'row', gap: 8 },
  segment: { flex: 1, height: 40, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(6,71,52,0.14)', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: colors.green800, borderColor: colors.green800 },
  segmentText: { fontSize: 13, fontFamily: fonts.semibold, color: colors.text },
  segmentTextActive: { color: '#fff' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  budget: { height: 36, paddingHorizontal: 13, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(6,71,52,0.14)', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  budgetText: { fontSize: 12.5, fontFamily: fonts.semibold, color: colors.text },
  contactGroup: { flexDirection: 'row', gap: 8, backgroundColor: colors.soft, borderRadius: radius.md + 1, padding: 4 },
  contactBtn: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  contactActive: { backgroundColor: colors.surface },
  contactText: { fontSize: 13, fontFamily: fonts.bold },
  footer: { paddingHorizontal: 16, paddingTop: 11, paddingBottom: 20, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: 'rgba(6,71,52,0.09)' },
  submit: { height: 50, borderRadius: radius.lg, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  submitText: { color: colors.text, fontSize: 15, fontFamily: fonts.bold },
});
