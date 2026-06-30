import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts, radius } from '../lib/theme';

/** Deep-green safety reminder banner shown near the bottom of Home. */
export default function SafetyCard({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress(): void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
      <LinearGradient
        colors={[colors.green800, colors.green700]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.icon}>
          <Icon name="ph-shield-check" size={21} color={colors.gold} weight="fill" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>{subtitle}</Text>
        </View>
        <Icon name="ph-caret-right" size={16} color="rgba(255,255,255,0.8)" weight="bold" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 15, borderRadius: radius.xxl, flexDirection: 'row', alignItems: 'center', gap: 13 },
  icon: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14.5, fontFamily: fonts.bold, color: '#fff' },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.74)', marginTop: 2, lineHeight: 16.5, fontFamily: fonts.regular },
});
