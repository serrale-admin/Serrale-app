import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts } from '../lib/theme';

interface Props {
  title?: string;
  right?: ReactNode;
  onBack?(): void;
}

/** Back-button header used by detail / settings-style screens. */
export default function ScreenHeader({ title, right, onBack }: Props) {
  const router = useRouter();
  const back = onBack || (() => router.back());
  return (
    <View style={styles.row}>
      <Pressable style={styles.backBtn} onPress={back} accessibilityLabel="Back" hitSlop={6}>
        <Icon name="ph-arrow-left" size={20} color={colors.text} weight="bold" />
      </Pressable>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={{ flex: 1 }} />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 8, paddingRight: 12, paddingBottom: 8, paddingTop: 2 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontFamily: fonts.bold, color: colors.text },
});
