import { Modal, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts } from '../lib/theme';
import { useAppStore } from '../store/appStore';

/** Global toast — Modal so it sits above sheets/dialogs. */
export default function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;
  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View pointerEvents="none" style={styles.wrap}>
        <View style={styles.toast}>
          <Icon name={toast.icon} size={17} color={colors.gold} weight="fill" />
          <Text style={styles.text} numberOfLines={3}>
            {toast.text}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 110,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    maxWidth: 320,
    backgroundColor: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  text: { color: '#fff', fontSize: 13, fontFamily: fonts.semibold, flexShrink: 1 },
});
