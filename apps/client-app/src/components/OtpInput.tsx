import { StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, radius } from '../lib/theme';

interface Props {
  /** Current digits, one entry per box (controls length). */
  value: string[];
  /** Called with (index, text) on change — parent owns the state machine. */
  onChangeDigit(index: number, text: string): void;
  /** Called with (index, key) on key press — parent handles Backspace nav. */
  onKeyPress(index: number, key: string): void;
  /** Ref setter so the parent can focus individual boxes. */
  setRef(index: number, el: TextInput | null): void;
  /** Draw every box with the danger border (verification failed). */
  errored?: boolean;
}

/**
 * Presentational 6-digit code input row. All focus/advance/submit behavior lives
 * in the parent (auth/verify) — this only renders the boxes so their visuals
 * match the shared design without changing the verification logic.
 */
export default function OtpInput({ value, onChangeDigit, onKeyPress, setRef, errored }: Props) {
  return (
    <View style={styles.row}>
      {value.map((digit, i) => (
        <TextInput
          key={i}
          ref={(el) => setRef(i, el)}
          value={digit}
          onChangeText={(v) => onChangeDigit(i, v)}
          onKeyPress={(e) => onKeyPress(i, e.nativeEvent.key)}
          inputMode="numeric"
          maxLength={1}
          autoFocus={i === 0}
          accessibilityLabel={`Digit ${i + 1}`}
          style={[styles.box, { borderColor: errored ? colors.danger : digit ? colors.success : colors.borderInput }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 9 },
  box: {
    flex: 1,
    height: 58,
    textAlign: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: radius.md + 1,
    fontSize: 23,
    fontFamily: fonts.bold,
    color: colors.text,
  },
});
