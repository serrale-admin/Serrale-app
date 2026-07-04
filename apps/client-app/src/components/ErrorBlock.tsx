import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts } from '../lib/theme';
import Button from './Button';

interface Props {
  /** Short headline, e.g. "Couldn't load providers". */
  title?: string;
  /** One-line explanation / recovery hint. */
  text?: string;
  /** When provided, renders a Try again button that calls this. */
  onRetry?(): void;
  retryLabel?: string;
}

/**
 * Centered error state with an optional retry action. Gives every data screen a
 * consistent failure surface instead of a bare message or silent empty list.
 */
export default function ErrorBlock({
  title = 'Something went wrong',
  text = 'Please check your connection and try again.',
  onRetry,
  retryLabel = 'Try again',
}: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <View style={styles.circle}>
        <Icon name="ph-warning-circle" size={28} color={colors.danger} weight="regular" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {onRetry ? (
        <Button label={retryLabel} icon="ph-arrow-right" variant="secondary" size="sm" onPress={onRetry} style={styles.retry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  circle: { width: 60, height: 60, borderRadius: 999, backgroundColor: colors.dangerSoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontFamily: fonts.bold, color: colors.text, marginTop: 15, textAlign: 'center' },
  text: { fontSize: 13, color: colors.muted, marginTop: 6, lineHeight: 20, textAlign: 'center', fontFamily: fonts.regular },
  retry: { marginTop: 16 },
});
