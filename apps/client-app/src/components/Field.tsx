import { forwardRef, ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Icon, IconWeight } from '../lib/icons';
import { useLabels } from '../lib/labels';
import { sanitizePhoneInput } from '../lib/phone';
import { colors, fonts, layout, radius, shadowCard } from '../lib/theme';

/** Label above a control, with optional "(optional)" affix and error line. */
export function FieldLabel({
  children,
  optional,
  compact,
}: {
  children: ReactNode;
  optional?: boolean;
  compact?: boolean;
}) {
  const labels = useLabels();
  const optionalSuffix = optional ? ` (${labels.common.optional})` : '';
  if (typeof children === 'string') {
    return (
      <Text style={[styles.label, compact && styles.labelCompact]}>
        {children}
        {optionalSuffix}
      </Text>
    );
  }
  return (
    <Text style={[styles.label, compact && styles.labelCompact]}>
      {children}
      {optional ? <Text style={styles.optional}>{optionalSuffix}</Text> : null}
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
  compact?: boolean;
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
  compact = false,
}: SelectFieldProps) {
  const filled = !!value;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? placeholder}
      style={[styles.select, compact && styles.selectCompact]}
    >
      {icon ? <Icon name={icon} size={compact ? 15 : 17} color={iconColor} weight={iconWeight} /> : null}
      <Text
        style={[styles.selectText, compact && styles.selectTextCompact, { color: filled ? colors.text : colors.faint }]}
        numberOfLines={1}
      >
        {filled ? value : placeholder}
      </Text>
      <Icon name={caret === 'down' ? 'ph-caret-down' : 'ph-caret-right'} size={13} color={colors.faint} weight="bold" />
    </Pressable>
  );
}

type LabeledInputProps = TextInputProps & {
  label: string;
  optional?: boolean;
  compact?: boolean;
};

/** Single-line form input — same surface as Request tab description fields. */
export function FormTextInput({ label, optional, compact, style, ...rest }: LabeledInputProps) {
  return (
    <View>
      <FieldLabel optional={optional} compact={compact}>
        {label}
      </FieldLabel>
      <TextInput
        placeholderTextColor={colors.faint}
        style={[compact ? styles.formInputCompact : styles.formInput, style]}
        {...rest}
      />
    </View>
  );
}

/** Multiline form input — matches Request tab `textarea` styling. */
export function FormTextArea({ label, optional, compact, style, ...rest }: LabeledInputProps) {
  return (
    <View>
      <FieldLabel optional={optional} compact={compact}>
        {label}
      </FieldLabel>
      <TextInput
        placeholderTextColor={colors.faint}
        multiline
        textAlignVertical="top"
        style={[compact ? styles.formTextareaCompact : styles.formTextarea, style]}
        {...rest}
      />
    </View>
  );
}

/** Ethiopian phone row — login-sized by default; pass compact for dense forms. */
export function EthiopianPhoneField({
  label,
  optional,
  value,
  onChangeText,
  errored,
  compact = false,
}: {
  label: string;
  optional?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  errored?: boolean;
  compact?: boolean;
}) {
  return (
    <View>
      <FieldLabel optional={optional} compact={compact}>
        {label}
      </FieldLabel>
      <LinearGradient
        colors={errored ? ['#b84a38', colors.danger] : [colors.green900, colors.green700]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.phoneShell, compact && styles.phoneShellCompact]}
      >
        <View style={[styles.phoneField, compact && styles.phoneFieldCompact]}>
          <LinearGradient
            colors={[colors.green800, colors.green700]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.phonePrefix, compact && styles.phonePrefixCompact]}
          >
            <Text style={[styles.flag, compact && styles.flagCompact]}>🇪🇹</Text>
            <Text style={[styles.prefixText, compact && styles.prefixTextCompact]}>+251</Text>
          </LinearGradient>
          <TextInput
            value={value}
            onChangeText={(raw) => onChangeText(sanitizePhoneInput(raw))}
            inputMode="numeric"
            placeholder="9 12 345 678"
            placeholderTextColor={colors.faint}
            style={[styles.phoneInput, compact && styles.phoneInputCompact]}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontFamily: fonts.bold, color: colors.text, marginBottom: 7 },
  labelCompact: { fontSize: 12, marginBottom: 5 },
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
  selectCompact: { height: 40, paddingHorizontal: 10, borderRadius: radius.md },
  selectTextCompact: { fontSize: 13 },
  formInput: {
    minHeight: layout.controlHeight,
    borderWidth: 1,
    borderColor: 'rgba(6,71,52,0.12)',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  formInputCompact: {
    height: 40,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.borderField,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  formTextarea: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(6,71,52,0.12)',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    lineHeight: 20,
  },
  formTextareaCompact: {
    minHeight: 68,
    borderWidth: 1,
    borderColor: colors.borderField,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingTop: 8,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.text,
    lineHeight: 18,
  },
  phoneShell: {
    borderRadius: radius.xxl,
    padding: 1.5,
    ...shadowCard,
    shadowOpacity: 0.08,
  },
  phoneShellCompact: {
    borderRadius: radius.md + 2,
    padding: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  phoneField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderRadius: radius.xxl - 1,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  phoneFieldCompact: {
    minHeight: 40,
    borderRadius: radius.md + 1,
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 6,
    paddingHorizontal: 14,
    minWidth: 92,
  },
  phonePrefixCompact: {
    gap: 5,
    paddingHorizontal: 10,
    minWidth: 78,
  },
  flag: { fontSize: 16 },
  flagCompact: { fontSize: 14 },
  prefixText: { fontSize: 15, fontFamily: fonts.bold, color: colors.onDark },
  prefixTextCompact: { fontSize: 12 },
  phoneInput: {
    flex: 1,
    minWidth: 0,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: colors.text,
    letterSpacing: 0.6,
  },
  phoneInputCompact: {
    height: 40,
    paddingHorizontal: 10,
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
