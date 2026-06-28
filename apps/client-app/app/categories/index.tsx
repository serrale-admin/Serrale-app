import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Medallion from '../../src/components/Medallion';
import { useCategoryGroups } from '../../src/hooks/queries';
import { fmt } from '../../src/lib/format';
import { Icon } from '../../src/lib/icons';
import { colors, fonts, radius, shadowCard } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/appStore';

export default function CategoriesScreen() {
  const router = useRouter();
  const am = useAppStore((s) => s.lang) === 'am';
  const [query, setQuery] = useState('');
  const groups = useCategoryGroups(query);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={6} accessibilityLabel="Back">
          <Icon name="ph-arrow-left" size={20} color={colors.text} weight="bold" />
        </Pressable>
        <Text style={styles.h1}>Categories</Text>
        <View style={styles.searchField}>
          <Icon name="ph-magnifying-glass" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search services"
            placeholderTextColor={colors.faint}
            style={styles.input}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {groups.data?.map((g) => (
          <View key={g.name} style={{ marginBottom: 22 }}>
            <View style={styles.groupHead}>
              <Text style={styles.groupName}>{g.name}</Text>
              <View style={styles.groupLine} />
            </View>
            <View style={styles.grid}>
              {g.items.map((c) => (
                <Pressable key={c.id} style={styles.card} onPress={() => router.push(`/categories/${c.id}`)}>
                  <View style={styles.cardBlob} />
                  <Medallion group={c.group} icon={c.icon} iconSize={23} />
                  <View style={{ width: '100%' }}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {am ? c.am : c.name}
                    </Text>
                    <View style={styles.cardMeta}>
                      <Icon name="ph-users-three" size={12} color={colors.success} weight="fill" />
                      <Text style={styles.cardCount}>{fmt(c.count)} providers</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingBottom: 10 },
  back: { width: 40, height: 40, marginLeft: -8, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: fonts.heading, fontSize: 25, color: colors.text, marginBottom: 12 },
  searchField: { flexDirection: 'row', alignItems: 'center', gap: 9, height: 46, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md + 1, paddingHorizontal: 14, ...shadowCard, shadowOpacity: 0.05 },
  input: { flex: 1, fontSize: 14, fontFamily: fonts.regular, color: colors.text, padding: 0 },
  body: { paddingHorizontal: 16, paddingTop: 6 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 11 },
  groupName: { fontSize: 12, fontFamily: fonts.bold, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.success },
  groupLine: { flex: 1, height: 1, backgroundColor: 'rgba(6,71,52,0.1)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47.7%', gap: 11, padding: 15, paddingTop: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.xl, overflow: 'hidden', ...shadowCard, shadowOpacity: 0.05 },
  cardBlob: { position: 'absolute', top: -22, right: -22, width: 66, height: 66, borderRadius: 999, backgroundColor: colors.soft, opacity: 0.55 },
  cardName: { fontSize: 14, fontFamily: fonts.bold, color: colors.text },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  cardCount: { fontSize: 11, fontFamily: fonts.semibold, color: colors.muted },
});
