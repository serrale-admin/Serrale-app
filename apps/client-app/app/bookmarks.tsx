import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../src/components/EmptyState';
import ProviderRow from '../src/components/ProviderRow';
import ScreenHeader from '../src/components/ScreenHeader';
import { PROV } from '../src/data/mock';
import { colors, fonts, radius } from '../src/lib/theme';
import { useAppStore } from '../src/store/appStore';

export default function BookmarksScreen() {
  const router = useRouter();
  const saved = useAppStore((s) => s.saved);
  const list = PROV.filter((p) => saved[p.id]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Saved providers" />
      {list.length > 0 ? (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {list.map((p) => <ProviderRow key={p.id} provider={p} />)}
          <View style={{ height: 20 }} />
        </ScrollView>
      ) : (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="ph-bookmark-simple"
            circle={colors.goldSoft}
            iconColor={colors.goldText}
            title="No saved providers yet"
            text="Tap the bookmark icon on any provider to save them here."
          >
            <Pressable style={styles.btn} onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.btnText}>Browse providers</Text>
            </Pressable>
          </EmptyState>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: 16, gap: 10 },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  btn: { marginTop: 20, height: 46, paddingHorizontal: 22, borderRadius: radius.md + 1, backgroundColor: colors.green800, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 14, fontFamily: fonts.bold },
});
