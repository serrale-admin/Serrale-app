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

/** Compact reference-style tab bar with an emphasized Request action. */
export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const labels = useLabels();
  const tabLabel = (name: string) => labels.tabs[name as keyof typeof labels.tabs] || name;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const color = focused ? colors.green800 : colors.faint;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={tabLabel(route.name)}
            accessibilityState={{ selected: focused }}
          >
            <View style={styles.iconWrap}>
              <Icon
                name={ICONS[route.name] || 'ph-house'}
                size={21}
                color={color}
                weight={focused ? 'fill' : 'regular'}
              />
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
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 5,
    paddingHorizontal: 6,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    shadowColor: colors.green900,
    shadowOpacity: 0.035,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: -1 },
    elevation: 3,
  },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'flex-start', gap: 2 },
  pressed: { opacity: 0.62 },
  iconWrap: { width: 42, height: 28, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 9.5, lineHeight: 12, fontFamily: fonts.semibold },
});
