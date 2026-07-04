import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts, layout, radius } from '../lib/theme';

interface Slide {
  title: string;
  sub: string;
  cta: string;
  bg: [string, string];
}

const SLIDES: Slide[] = [
  {
    title: 'Verified, admin-reviewed pros',
    sub: 'Trusted local providers near you',
    cta: 'Explore',
    bg: ['#004C39', '#00614A'],
  },
  {
    title: "Need a provider? We'll help",
    sub: 'Post a request in under a minute',
    cta: 'Request',
    bg: ['#004936', '#00634B'],
  },
  {
    title: 'Call or WhatsApp directly',
    sub: 'Reach local providers instantly',
    cta: 'Browse',
    bg: ['#004A3A', '#006652'],
  },
];

const artwork = require('../../assets/home-trust-banner.png');

/** Reference-based Home carousel with native copy over dedicated decorative artwork. */
export default function HomeBanner({ onGo }: { onGo(index: number): void }) {
  const { width } = useWindowDimensions();
  const slideW = Math.min(width, layout.contentMaxWidth) - layout.gutter * 2;
  const ref = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (index + 1) % SLIDES.length;
      ref.current?.scrollTo({ x: next * slideW, animated: true });
      setIndex(next);
    }, 5000);
    return () => clearInterval(timer);
  }, [index, slideW]);

  const onEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / slideW));
  };

  const goTo = (slideIndex: number) => {
    ref.current?.scrollTo({ x: slideIndex * slideW, animated: true });
    setIndex(slideIndex);
  };

  return (
    <View>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onEnd}
        style={[styles.track, { width: slideW }]}
      >
        {SLIDES.map((slide, slideIndex) => (
          <Pressable
            key={slide.title}
            onPress={() => onGo(slideIndex)}
            style={({ pressed }) => [{ width: slideW }, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`${slide.title}. ${slide.cta}`}
          >
            <LinearGradient colors={slide.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.slide}>
              <Image source={artwork} style={styles.artwork} resizeMode="cover" accessibilityIgnoresInvertColors />
              <View style={styles.copy}>
                <Text style={styles.title} numberOfLines={2}>
                  {slide.title}
                </Text>
                <Text style={styles.sub} numberOfLines={2}>
                  {slide.sub}
                </Text>
                <View style={styles.cta}>
                  <Text style={styles.ctaText}>{slide.cta}</Text>
                  <Icon name="ph-caret-right" size={11} color={colors.green900} weight="bold" />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.dots} accessibilityRole="tablist">
        {SLIDES.map((slide, slideIndex) => (
          <Pressable
            key={slide.title}
            onPress={() => goTo(slideIndex)}
            hitSlop={8}
            accessibilityRole="tab"
            accessibilityState={{ selected: index === slideIndex }}
            accessibilityLabel={`Banner ${slideIndex + 1}`}
            style={[
              styles.dot,
              {
                width: index === slideIndex ? 16 : 5,
                backgroundColor: index === slideIndex ? colors.green800 : 'rgba(6,71,52,0.18)',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { marginTop: 8, borderRadius: radius.xl, overflow: 'hidden' },
  pressed: { opacity: 0.86 },
  slide: {
    height: 112,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: radius.xl,
  },
  artwork: { position: 'absolute', top: 0, left: 0, width: '43%', height: '100%' },
  copy: {
    flex: 1,
    width: '61%',
    marginLeft: '39%',
    justifyContent: 'center',
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 10,
  },
  title: { fontSize: 14.5, lineHeight: 17, fontFamily: fonts.bold, color: '#fff', letterSpacing: -0.2 },
  sub: { marginTop: 3, fontSize: 10.5, lineHeight: 13, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.82)' },
  cta: {
    marginTop: 8,
    minWidth: 74,
    height: 29,
    alignSelf: 'flex-start',
    paddingHorizontal: 13,
    borderRadius: radius.md,
    backgroundColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  ctaText: { fontSize: 11, fontFamily: fonts.bold, color: colors.green900 },
  dots: { minHeight: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  dot: { height: 5, borderRadius: radius.pill },
});
