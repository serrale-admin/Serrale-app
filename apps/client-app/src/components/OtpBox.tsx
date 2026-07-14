import { forwardRef } from 'react';
import { Platform, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius } from '../lib/theme';

type Props = TextInputProps & {
  size: number;
  errored?: boolean;
};

const OtpBox = forwardRef<TextInput, Props>(function OtpBox(
  { size, errored, style, value, ...rest },
  ref,
) {
  const filled = !!value;
  const height = size + 2;
  const fontSize = Math.max(16, Math.min(20, Math.round(size * 0.44)));

  return (
    <View style={[styles.shell, { width: size, height, flexShrink: 0, flexGrow: 0 }]}>
      <TextInput
        ref={ref}
        value={value}
        inputMode="numeric"
        maxLength={6}
        style={[
          styles.box,
          {
            width: size,
            height,
            fontSize,
            borderColor: errored ? colors.danger : filled ? colors.success : colors.borderInput,
          },
          Platform.OS === 'web' ? styles.boxWeb : null,
          style,
        ]}
        {...rest}
      />
    </View>
  );
});

export default OtpBox;

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
  },
  box: {
    textAlign: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: radius.md,
    fontFamily: fonts.bold,
    color: colors.text,
    padding: 0,
    margin: 0,
    minWidth: 0,
    maxWidth: '100%',
    flexGrow: 0,
    flexShrink: 0,
  },
  boxWeb: {
    boxSizing: 'border-box',
    outlineStyle: 'none',
  } as object,
});
