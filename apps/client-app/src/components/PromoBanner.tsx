import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts, radius } from '../lib/theme';

interface Props {
  badge?: string;
  title: string;
  subtitle: string;
  cta: string;
  icon?: string;
  photo?: ImageSourcePropType;
  onPress(): void;
}

const trustArtwork = require('../../assets/home-trust-banner.png');

export default function PromoBanner({ badge, title, subtitle, cta, photo, onPress }: Props) {
  if (photo) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={cta}
      >
        <View style={styles.photoCard}>
          <Image
            source={photo}
            style={styles.photoBg}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          <LinearGradient
            colors={['rgba(4,47,34,0.80)', 'rgba(6,71,52,0.58)', 'rgba(6,71,52,0.22)', 'rgba(6,71,52,0.02)']}
            locations={[0, 0.36, 0.58, 0.86]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.photoContent} pointerEvents="box-none">
            <Text style={styles.photoTitle} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
            <Text style={styles.photoSub} numberOfLines={1} ellipsizeMode="tail">
              {subtitle}
            </Text>
            <View style={styles.photoCta}>
              <Text style={styles.photoCtaText} numberOfLines={1}>
                {cta}
              </Text>
              <Icon name="ph-caret-right" size={11} color={colors.green900} weight="bold" />
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={cta}>
      <LinearGradient
        colors={[colors.green900, colors.green700]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
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

        <Image source={trustArtwork} style={styles.artwork} resizeMode="cover" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.86 },
  /** Exact Home banner footprint (HomeBanner slide = 112). */
  photoCard: {
    height: 112,
    maxHeight: 112,
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  photoBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  photoContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '62%',
    overflow: 'hidden',
  },
  photoTitle: {
    width: '100%',
    fontSize: 13.5,
    lineHeight: 16,
    fontFamily: fonts.bold,
    color: '#fff',
    letterSpacing: -0.2,
  },
  photoSub: {
    width: '100%',
    marginTop: 2,
    fontSize: 10,
    lineHeight: 12,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.82)',
  },
  photoCta: {
    marginTop: 6,
    maxWidth: '100%',
    minWidth: 0,
    height: 26,
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    borderRadius: radius.md,
    backgroundColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoCtaText: { fontSize: 10.5, fontFamily: fonts.bold, color: colors.green900, flexShrink: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xxl,
    padding: 14,
    overflow: 'hidden',
    minHeight: 128,
    position: 'relative',
  },
  content: { flex: 1, alignItems: 'flex-start' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginBottom: 4,
  },
  badgeText: { color: '#fff', fontSize: 9.5, fontFamily: fonts.bold, letterSpacing: 0.7 },
  title: { fontSize: 21, fontFamily: fonts.heading, color: '#fff', lineHeight: 25 },
  sub: { fontSize: 12.5, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.82)', marginTop: 5, lineHeight: 17 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
    backgroundColor: colors.gold,
    paddingHorizontal: 13,
    height: 36,
    borderRadius: 11,
  },
  ctaText: { fontSize: 12.5, fontFamily: fonts.bold, color: colors.text },
  artwork: { width: 104, height: 92, marginLeft: 4, borderRadius: radius.lg },
});
