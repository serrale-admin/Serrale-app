import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../src/components/ScreenHeader';
import { Icon } from '../src/lib/icons';
import { colors, fonts, radius, shadowCard } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';
import type { Lang } from '../src/types';

const OPTIONS: { label: string; sub: string; flag: string; value: Lang }[] = [
  { label: 'English', sub: 'Default', flag: 'EN', value: 'en' },
  { label: 'አማርኛ', sub: 'Amharic', flag: 'አ', value: 'am' },
];

export default function LanguageScreen() {
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Language" />
      <View style={styles.body}>
        {OPTIONS.map((o) => {
          const active = lang === o.value;
          return (
            <Pressable key={o.value} style={[styles.option, { borderColor: active ? colors.success : 'rgba(6,71,52,0.1)' }]} onPress={() => setLang(o.value)}>
              <View style={[styles.flag, { backgroundColor: active ? colors.soft : '#F3F0E6' }]}>
                <Text style={styles.flagText}>{o.flag}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{o.label}</Text>
                <Text style={styles.sub}>{o.sub}</Text>
              </View>
              {active && <Icon name="ph-check-circle" size={24} color={colors.success} weight="fill" />}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 16, paddingTop: 6, gap: 11 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16, paddingHorizontal: 15, backgroundColor: colors.surface, borderWidth: 1.5, borderRadius: radius.lg + 2, ...shadowCard, shadowOpacity: 0.04 },
  flag: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flagText: { fontSize: 19, fontFamily: fonts.semibold, color: colors.text },
  label: { fontSize: 15, fontFamily: fonts.bold, color: colors.text },
  sub: { fontSize: 12, color: colors.faint, marginTop: 1, fontFamily: fonts.regular },
});
