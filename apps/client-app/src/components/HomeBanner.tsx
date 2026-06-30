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
            <LinearGradient colors={b.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.slide}>
              {/* Shield motif with concentric glow rings on the left */}
              <View style={styles.shieldWrap}>
                <View style={[styles.ring, { width: 96, height: 96, opacity: 0.07 }]} />
                <View style={[styles.ring, { width: 70, height: 70, opacity: 0.1 }]} />
                <View style={styles.shield}>
                  <Icon name={b.icon} size={34} color="#fff" weight="fill" />
                </View>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.title} numberOfLines={2}>
                  {b.title}
                </Text>
                <Text style={styles.sub} numberOfLines={2}>
                  {b.sub}
                </Text>
                <View style={styles.cta}>
                  <Text style={styles.ctaText}>{b.cta}</Text>
                  <Icon name="ph-arrow-right" size={12} color={colors.text} weight="bold" />
                </View>
              </View>
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
  track: { marginTop: 12, borderRadius: radius.xxl, overflow: 'hidden' },
  slide: { minHeight: 116, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 18, paddingVertical: 16, overflow: 'hidden' },
  shieldWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderRadius: 999, backgroundColor: '#fff' },
  shield: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontFamily: fonts.bold, color: '#fff', lineHeight: 23 },
  sub: { fontSize: 12.5, color: 'rgba(255,255,255,0.82)', marginTop: 4, fontFamily: fonts.regular, lineHeight: 17 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, alignSelf: 'flex-start', backgroundColor: colors.gold, paddingHorizontal: 15, height: 38, borderRadius: 12 },
  ctaText: { fontSize: 13.5, fontFamily: fonts.bold, color: colors.text },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { height: 6, borderRadius: 999 },
});
