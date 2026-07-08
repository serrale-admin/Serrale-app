import { forwardRef, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Icon, IconWeight } from '../lib/icons';
import { useLabels } from '../lib/labels';
import { colors, fonts, layout, radius } from '../lib/theme';

/** Label above a control, with optional "(optional)" affix and error line. */
export function FieldLabel({ children, optional }: { children: ReactNode; optional?: boolean }) {
  return (
    <Text style={styles.label}>
      {children}
      {optional ? <Text style={styles.optional}> (optional)</Text> : null}
    </Text>
  );
}

interface TextFieldProps extends TextInputProps {
  /** Leading Phosphor icon (ph-*). */
  icon?: string;
  /** Show a clear (x) affordance and call this when tapped. */
  onClear?(): void;
  /** Draw the danger border (validation error). */
  errored?: boolean;
  containerStyle?: ViewStyle;
}

/**
 * Bordered single-line input surface with an optional leading icon and clear
 * button. Used for the category/provider search fields. Forwards the ref so the
 * caller keeps focus control.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { icon, onClear, errored, containerStyle, style, value, ...rest },
  ref,
) {
  const labels = useLabels();
  return (
    <View style={[styles.field, errored && styles.fieldErrored, containerStyle]}>
      {icon ? <Icon name={icon} size={18} color={colors.muted} /> : null}
      <TextInput
        ref={ref}
        value={value}
        placeholderTextColor={colors.faint}
        style={[styles.input, style]}
        {...rest}
      />
      {onClear && !!value ? (
        <Pressable onPress={onClear} hitSlop={8} accessibilityRole="button" accessibilityLabel={labels.common.clear}>
          <Icon name="ph-x-circle" size={18} color="#bcc6bf" weight="fill" />
        </Pressable>
      ) : null}
    </View>
  );
});

interface SelectFieldProps {
  onPress(): void;
  /** Current value text. Falls back to `placeholder` styling when empty. */
  value?: string;
  placeholder: string;
  icon?: string;
  iconColor?: string;
  iconWeight?: IconWeight;
  /** Trailing indicator: caret-right (navigate) or caret-down (picker). */
  caret?: 'right' | 'down';
  accessibilityLabel?: string;
}

/**
 * Disclosure row that looks like an input but opens a picker/sheet. Replaces the
 * bespoke "select" pressables on the request form.
 */
export function SelectField({
  onPress,
  value,
  placeholder,
  icon,
  iconColor = colors.muted,
  iconWeight = 'regular',
  caret = 'right',
  accessibilityLabel,
}: SelectFieldProps) {
  const filled = !!value;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? placeholder}
      style={styles.select}
    >
      {icon ? <Icon name={icon} size={17} color={iconColor} weight={iconWeight} /> : null}
      <Text style={[styles.selectText, { color: filled ? colors.text : colors.faint }]} numberOfLines={1}>
        {filled ? value : placeholder}
      </Text>
      <Icon name={caret === 'down' ? 'ph-caret-down' : 'ph-caret-right'} size={13} color={colors.faint} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontFamily: fonts.bold, color: colors.text, marginBottom: 7 },
  optional: { fontFamily: fonts.medium, color: colors.faint },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minHeight: layout.controlHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderField,
    borderRadius: radius.lg,
    paddingHorizontal: 13,
  },
  fieldErrored: { borderColor: colors.danger },
  input: { flex: 1, fontSize: 14, fontFamily: fonts.regular, color: colors.text, padding: 0 },
  select: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderField,
    borderRadius: radius.md + 1,
  },
  selectText: { flex: 1, fontSize: 14, fontFamily: fonts.regular },
});
