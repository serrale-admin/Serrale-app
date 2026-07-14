import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts, radius, shadowCard } from '../lib/theme';

interface Props {
  value: string;
  onChangeText(text: string): void;
  errored?: boolean;
  placeholder?: string;
}

/** Categories search-field pattern for Ethiopian phone entry. */
export default function PhoneField({ value, onChangeText, errored, placeholder = '9 12 345 678' }: Props) {
  return (
    <View style={[styles.field, errored && styles.fieldError]}>
      <View style={styles.prefix}>
        <Text style={styles.flag}>🇪🇹</Text>
        <Text style={styles.prefixText}>+251</Text>
      </View>
      <View style={styles.divider} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        inputMode="numeric"
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        autoComplete={Platform.OS === 'web' ? 'off' : 'tel'}
        textContentType="telephoneNumber"
        selectionColor={colors.green800}
        cursorColor={colors.green800}
        style={[styles.input, Platform.OS === 'web' ? styles.inputWeb : null]}
        maxLength={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 54,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    paddingHorizontal: 14,
    ...shadowCard,
  },
  fieldError: { borderColor: colors.danger },
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  flag: { fontSize: 15 },
  prefixText: { fontSize: 14, fontFamily: fonts.bold, color: colors.green800 },
  divider: { width: 1, height: 22, backgroundColor: colors.borderSoft },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
    padding: 0,
    letterSpacing: 0.4,
    backgroundColor: 'transparent',
  },
  inputWeb: {
    outlineStyle: 'none',
    boxSizing: 'border-box',
  } as object,
});
