import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
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
import { colors, fonts, radius } from '../lib/theme';

interface Slide {
  title: string;
  sub: string;
  cta: string;
  icon: string;
  grad: [string, string];
}

const SLIDES: Slide[] = [
  { title: "Need a provider? We'll help", sub: 'Post a request in under a minute', cta: 'Request', icon: 'ph-hand-heart', grad: ['#075539', '#0f6c49'] },
  { title: 'Verified, admin-reviewed pros', sub: 'Trusted local providers near you', cta: 'Explore', icon: 'ph-seal-check', grad: ['#0c6b4d', '#16956a'] },
  { title: 'Call or WhatsApp directly', sub: 'Reach providers instantly', cta: 'Browse', icon: 'ph-phone-call', grad: ['#0a5f54', '#15867b'] },
];

/** Thin auto-sliding promo carousel shown below the Home search bar. */
export default function HomeBanner({ onGo }: { onGo(index: number): void }) {
  const { width } = useWindowDimensions();
  const slideW = width - 32; // 16px horizontal screen padding
  const ref = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      const next = (index + 1) % SLIDES.length;
      ref.current?.scrollTo({ x: next * slideW, animated: true });
      setIndex(next);
    }, 4500);
    return () => clearInterval(t);
  }, [index, slideW]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / slideW));
  };

  const goTo = (i: number) => {
    ref.current?.scrollTo({ x: i * slideW, animated: true });
    setIndex(i);
  };

  return (
    <View>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onEnd}
        style={styles.track}
      >
        {SLIDES.map((b, i) => (
          <Pressable key={i} onPress={() => onGo(i)} style={{ width: slideW }}>
            <LinearGradient colors={b.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.slide}>
              <View style={styles.blob} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{b.title}</Text>
                <Text style={styles.sub}>{b.sub}</Text>
                <View style={styles.cta}>
                  <Text style={styles.ctaText}>{b.cta}</Text>
                  <Icon name="ph-arrow-right" size={11} color={colors.text} weight="bold" />
                </View>
              </View>
              <Icon name={b.icon} size={50} color="rgba(255,255,255,0.2)" weight="fill" />
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => goTo(i)}
            style={[styles.dot, { width: index === i ? 20 : 6, backgroundColor: index === i ? colors.green800 : 'rgba(6,71,52,0.2)' }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { marginTop: 12, borderRadius: radius.lg + 2, overflow: 'hidden' },
  slide: { height: 98, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, overflow: 'hidden' },
  blob: { position: 'absolute', top: -26, right: -20, width: 96, height: 96, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.09)' },
  title: { fontSize: 15, fontFamily: fonts.bold, color: '#fff' },
  sub: { fontSize: 11.5, color: 'rgba(255,255,255,0.78)', marginTop: 3, fontFamily: fonts.regular },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, alignSelf: 'flex-start', backgroundColor: colors.gold, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 },
  ctaText: { fontSize: 11.5, fontFamily: fonts.bold, color: colors.text },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { height: 6, borderRadius: 999 },
});
