import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../lib/icons';
import { useLabels } from '../lib/labels';
import { colors, fonts } from '../lib/theme';

const ICONS: Record<string, string> = {
  home: 'ph-house',
  search: 'ph-magnifying-glass',
  request: 'ph-plus-circle',
  profile: 'ph-user',
};

/** Custom bottom tab bar: pill behind the active icon + label. */
export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const labels = useLabels();
  const tabLabel = (name: string) => labels.tabs[name as keyof typeof labels.tabs] || name;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) + 12 }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const color = focused ? colors.green800 : colors.faint;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable key={route.key} style={styles.tab} onPress={onPress} accessibilityRole="button">
            <View style={[styles.pill, focused && styles.pillActive]}>
              <Icon name={ICONS[route.name] || 'ph-house'} size={21} color={color} weight={focused ? 'fill' : 'regular'} />
            </View>
            <Text style={[styles.label, { color }]}>{tabLabel(route.name)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 7,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(6,71,52,0.09)',
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  pill: { width: 48, height: 27, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: colors.soft },
  label: { fontSize: 10, fontFamily: fonts.semibold },
});
