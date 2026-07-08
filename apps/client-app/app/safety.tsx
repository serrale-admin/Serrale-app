import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../src/components/Card';
import ScreenHeader from '../src/components/ScreenHeader';
import { Icon } from '../src/lib/icons';
import { useLabels } from '../src/lib/labels';
import { colors, fonts } from '../src/lib/theme';

export default function SafetyScreen() {
  const labels = useLabels();
  const t = labels.safety;
  const TIPS = [
    { title: t.tip1Title, text: t.tip1Text, icon: 'ph-handshake' },
    { title: t.tip2Title, text: t.tip2Text, icon: 'ph-seal-check' },
    { title: t.tip3Title, text: t.tip3Text, icon: 'ph-map-pin' },
    { title: t.tip4Title, text: t.tip4Text, icon: 'ph-note' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={labels.common.safetyTips} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {TIPS.map((t, i) => (
          <Card key={i} style={styles.card}>
            <View style={styles.icon}>
              <Icon name={t.icon} size={18} color={colors.success} weight="fill" />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.text}>{t.text}</Text>
            </View>
          </Card>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 16, paddingTop: 4, gap: 11 },
  card: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 14 },
  icon: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  textCol: { flex: 1 },
  title: { fontSize: 14, fontFamily: fonts.bold, color: colors.text },
  text: { fontSize: 12.5, color: colors.muted, lineHeight: 19, marginTop: 3, fontFamily: fonts.regular },
});
