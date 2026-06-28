import { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, shadowSheet } from '../lib/theme';

interface Props {
  visible: boolean;
  onClose(): void;
  children: ReactNode;
  /** Extra style for the sheet container (e.g. fixed height, background). */
  contentStyle?: ViewStyle;
  showHandle?: boolean;
}

/** Bottom-anchored sheet with a dim backdrop. */
export default function BottomSheet({ visible, onClose, children, contentStyle, showHandle = true }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.fill}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={[styles.sheet, contentStyle]}>
          {showHandle && (
            <View style={styles.handleRow}>
              <View style={styles.handle} />
            </View>
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,30,22,0.48)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingBottom: 24,
    ...shadowSheet,
  },
  handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 38, height: 4, borderRadius: 999, backgroundColor: 'rgba(6,71,52,0.16)' },
});
