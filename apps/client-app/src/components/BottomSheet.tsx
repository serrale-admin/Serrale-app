import { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadowSheet } from '../lib/theme';

interface Props {
  visible: boolean;
  onClose(): void;
  children: ReactNode;
  /** Extra style for the sheet container (e.g. fixed height, background). */
  contentStyle?: ViewStyle;
  showHandle?: boolean;
  /** Frosted liquid-glass sheet — opaque frosty white, not see-through. */
  glass?: boolean;
}

/** Bottom-anchored sheet with a dim backdrop. */
export default function BottomSheet({
  visible,
  onClose,
  children,
  contentStyle,
  showHandle = true,
  glass = false,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.fill}>
        <Pressable style={[styles.scrim, glass && styles.scrimGlass]} onPress={onClose} />
        <View style={[glass ? styles.sheetGlass : styles.sheet, contentStyle]}>
          {glass ? (
            <LinearGradient
              colors={[colors.glassWhiteHi, colors.glassWhite, colors.glassWhiteDeep]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
          ) : null}
          {showHandle && (
            <View style={styles.handleRow}>
              <View style={[styles.handle, glass && styles.handleGlass]} />
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
  scrimGlass: { backgroundColor: 'rgba(3,53,40,0.55)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingBottom: 24,
    ...shadowSheet,
  },
  sheetGlass: {
    // Opaque frosty white so the dim scrim reads behind, not through content.
    backgroundColor: colors.glassWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.glassWhiteBorder,
    overflow: 'hidden',
    ...shadowSheet,
  },
  handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 4, zIndex: 1 },
  handle: { width: 38, height: 4, borderRadius: 999, backgroundColor: 'rgba(6,71,52,0.16)' },
  handleGlass: { backgroundColor: 'rgba(16,46,37,0.28)', width: 42 },
});
