import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts, radius } from '../lib/theme';

interface Props {
  badge?: string;
  title: string;
  subtitle: string;
  cta: string;
  icon?: string;
  onPress(): void;
}

/**
 * Full-width deep-green promotional banner with an optional eyebrow badge,
 * headline, subtext, gold CTA, and a layered shield motif on the right.
 * Solid/gradient green — no imagery dependency, no decorative noise.
 */
export default function PromoBanner({ badge, title, subtitle, cta, icon = 'ph-shield-check', onPress }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={cta}>
      <LinearGradient
        colors={[colors.green900, colors.green700]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Concentric glow rings behind the shield motif */}
        <View style={styles.rings} pointerEvents="none">
          <View style={[styles.ring, { width: 150, height: 150, opacity: 0.06 }]} />
          <View style={[styles.ring, { width: 108, height: 108, opacity: 0.09 }]} />
          <View style={[styles.ring, { width: 70, height: 70, opacity: 0.12 }]} />
        </View>

        <View style={styles.content}>
          {!!badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>{subtitle}</Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>{cta}</Text>
            <Icon name="ph-arrow-right" size={13} color={colors.text} weight="bold" />
          </View>
        </View>

        <View style={styles.shield} pointerEvents="none">
          <Icon name={icon} size={42} color="#fff" weight="fill" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xxl,
    padding: 20,
    overflow: 'hidden',
    minHeight: 168,
  },
  content: { flex: 1, alignItems: 'flex-start' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 12,
  },
  badgeText: { color: '#fff', fontSize: 10.5, fontFamily: fonts.bold, letterSpacing: 0.8 },
  title: { fontSize: 27, fontFamily: fonts.heading, color: '#fff', lineHeight: 31 },
  sub: { fontSize: 13.5, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.82)', marginTop: 7, lineHeight: 19 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
    backgroundColor: colors.gold,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 13,
  },
  ctaText: { fontSize: 14, fontFamily: fonts.bold, color: colors.text },
  rings: { position: 'absolute', right: 8, top: 0, bottom: 0, width: 160, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderRadius: 999, backgroundColor: '#fff' },
  shield: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
