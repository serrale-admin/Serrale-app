import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
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
import { fill, useLabels } from '../lib/labels';
import { colors, fonts, layout, radius } from '../lib/theme';

interface Slide {
  title: string;
  sub: string;
  cta: string;
  bg: [string, string];
  photo?: ImageSourcePropType;
}

const trustArtwork = require('../../assets/home-trust-banner.png');
const professionalsArtwork = require('../../assets/home-banner-professionals.png');
const callWhatsappArtwork = require('../../assets/home-banner-call-whatsapp.png');

/** Fixed per-slide gradient backgrounds (localized copy is layered on at render). */
const SLIDE_BGS: [string, string][] = [
  ['#004C39', '#00614A'],
  ['#004936', '#00634B'],
  ['#004A3A', '#006652'],
];
const SLIDE_COUNT = SLIDE_BGS.length;

function PhotoSlide({ slide, onPress }: { slide: Slide; onPress(): void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.slide, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${slide.title}. ${slide.cta}`}
    >
      <Image source={slide.photo} style={styles.photoBg} resizeMode="cover" accessibilityIgnoresInvertColors />
      <LinearGradient
        colors={['rgba(4,47,34,0.80)', 'rgba(6,71,52,0.58)', 'rgba(6,71,52,0.22)', 'rgba(6,71,52,0.02)']}
        locations={[0, 0.36, 0.58, 0.86]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.photoCopy}>
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
    </Pressable>
  );
}

function GradientSlide({ slide, onPress }: { slide: Slide; onPress(): void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.slide, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${slide.title}. ${slide.cta}`}
    >
      <LinearGradient colors={slide.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
      <Image source={trustArtwork} style={styles.artwork} resizeMode="cover" accessibilityIgnoresInvertColors />
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
    </Pressable>
  );
}

/** Reference-based Home carousel with native copy over decorative or photo artwork. */
export default function HomeBanner({ onGo }: { onGo(index: number): void }) {
  const labels = useLabels();
  const b = labels.banner;
  const SLIDES: Slide[] = [
    {
      title: b.slide1Title,
      sub: b.slide1Sub,
      cta: labels.explore,
      bg: SLIDE_BGS[0],
      photo: professionalsArtwork,
    },
    { title: b.slide2Title, sub: b.slide2Sub, cta: b.slide2Cta, bg: SLIDE_BGS[1] },
    {
      title: b.slide3Title,
      sub: b.slide3Sub,
      cta: b.slide3Cta,
      bg: SLIDE_BGS[2],
      photo: callWhatsappArtwork,
    },
  ];
  const { width } = useWindowDimensions();
  const slideW = Math.min(width, layout.contentMaxWidth) - layout.gutter * 2;
  const ref = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (index + 1) % SLIDE_COUNT;
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
          <View key={slide.title} style={{ width: slideW }}>
            {slide.photo ? (
              <PhotoSlide slide={slide} onPress={() => onGo(slideIndex)} />
            ) : (
              <GradientSlide slide={slide} onPress={() => onGo(slideIndex)} />
            )}
          </View>
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
            accessibilityLabel={fill(labels.a11y.banner, { n: slideIndex + 1 })}
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
    position: 'relative',
  },
  photoBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  photoCopy: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxWidth: '58%',
    zIndex: 1,
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
    zIndex: 1,
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
