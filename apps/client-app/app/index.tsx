import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLabels } from '../src/lib/labels';
import { fonts } from '../src/lib/theme';

/** Branded splash that briefly loads, then enters the app. */
export default function Splash() {
  const router = useRouter();
  const labels = useLabels();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/(tabs)/home'), 1700);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <Pressable style={styles.fill} onPress={() => router.replace('/(tabs)/home')}>
      <LinearGradient colors={['#075539', '#053b2b', '#022a1f']} style={styles.fill}>
        <StatusBar style="light" />
        <View style={styles.center}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline}>{labels.splash.tagline}</Text>
        </View>
        <View style={styles.loader}>
          <ActivityIndicator color="#F6B93B" />
          <Text style={styles.loaderText}>{labels.splash.preparing}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  logo: { width: 188, height: 60, tintColor: '#fff' },
  tagline: { color: 'rgba(255,255,255,0.66)', fontSize: 13, letterSpacing: 0.4, fontFamily: fonts.medium },
  loader: { position: 'absolute', bottom: 64, left: 0, right: 0, alignItems: 'center', gap: 9, flexDirection: 'row', justifyContent: 'center' },
  loaderText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: fonts.regular },
});
