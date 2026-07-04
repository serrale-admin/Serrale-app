import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../src/components/Card';
import ScreenHeader from '../src/components/ScreenHeader';
import { Icon } from '../src/lib/icons';
import { colors, fonts } from '../src/lib/theme';

const TIPS = [
  { title: 'Agree on terms first', text: 'Agree on price, time, and work scope clearly before any work begins.', icon: 'ph-handshake' },
  { title: 'Prefer trust signals', text: 'Choose verified and admin-reviewed providers with visible past work.', icon: 'ph-seal-check' },
  { title: 'Meet safely', text: 'Confirm the location and keep initial contact within SERRALE.', icon: 'ph-map-pin' },
  { title: 'Keep records', text: 'Save the provider profile and the details you agreed on.', icon: 'ph-note' },
];

export default function SafetyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Safety tips" />
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
