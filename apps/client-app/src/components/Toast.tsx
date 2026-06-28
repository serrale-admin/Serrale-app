import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts } from '../lib/theme';
import { useAppStore } from '../store/appStore';

/** Global toast pinned near the bottom of the screen. */
export default function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={styles.toast}>
        <Icon name={toast.icon} size={17} color={colors.gold} weight="fill" />
        <Text style={styles.text} numberOfLines={1}>
          {toast.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 96, alignItems: 'center', zIndex: 60 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    maxWidth: 320,
    backgroundColor: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  text: { color: '#fff', fontSize: 13, fontFamily: fonts.semibold },
});
