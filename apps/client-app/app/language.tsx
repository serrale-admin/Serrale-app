import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../src/components/Card';
import ScreenHeader from '../src/components/ScreenHeader';
import { Icon } from '../src/lib/icons';
import { useLabels } from '../src/lib/labels';
import { colors, fonts } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';
import type { Lang } from '../src/types';

export default function LanguageScreen() {
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const labels = useLabels();

  // Language names stay in their own script (English / አማርኛ); the sublabels and
  // the "selected" affix localize with the current UI language.
  const OPTIONS: { label: string; sub: string; flag: string; value: Lang }[] = [
    { label: 'English', sub: labels.language.default, flag: 'EN', value: 'en' },
    { label: 'አማርኛ', sub: labels.language.amharic, flag: 'አ', value: 'am' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={labels.common.language} />
      <View style={styles.body}>
        {OPTIONS.map((o) => {
          const active = lang === o.value;
          return (
            <Card
              key={o.value}
              onPress={() => setLang(o.value)}
              accessibilityLabel={`${o.label}${active ? labels.language.selectedSuffix : ''}`}
              style={[styles.option, active && styles.optionActive]}
            >
              <View style={[styles.flag, { backgroundColor: active ? colors.soft : '#F3F0E6' }]}>
                <Text style={styles.flagText}>{o.flag}</Text>
              </View>
              <View style={styles.textCol}>
                <Text style={styles.label}>{o.label}</Text>
                <Text style={styles.sub}>{o.sub}</Text>
              </View>
              {active && <Icon name="ph-check-circle" size={24} color={colors.success} weight="fill" />}
            </Card>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 16, paddingTop: 6, gap: 11 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16, paddingHorizontal: 15, borderWidth: 1.5 },
  optionActive: { borderColor: colors.success },
  flag: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flagText: { fontSize: 19, fontFamily: fonts.semibold, color: colors.text },
  textCol: { flex: 1 },
  label: { fontSize: 15, fontFamily: fonts.bold, color: colors.text },
  sub: { fontSize: 12, color: colors.faint, marginTop: 1, fontFamily: fonts.regular },
});
