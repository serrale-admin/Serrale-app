import { useMemo, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { fill, useLabels } from '../lib/labels';
import { OTP_LENGTH } from '../lib/otp-code';
import OtpBox from './OtpBox';

interface Props {
  value: string[];
  onChangeDigit(index: number, text: string): void;
  /** When the user pastes a multi-digit code into any box. */
  onPaste?(digits: string[]): void;
  onKeyPress(index: number, key: string): void;
  setRef(index: number, el: TextInput | null): void;
  errored?: boolean;
}

/** Compute box size so all six digits fit inside `availWidth` without overflow. */
export function otpBoxMetrics(availWidth: number) {
  if (availWidth <= 0) {
    return { gap: 6, box: 40 };
  }
  const gap = availWidth < 300 ? 4 : availWidth < 340 ? 5 : availWidth < 380 ? 6 : 8;
  const raw = Math.floor((availWidth - gap * (OTP_LENGTH - 1)) / OTP_LENGTH);
  const box = Math.min(44, Math.max(32, raw));
  return { gap, box };
}

/**
 * Responsive 6-digit OTP row. Box width is measured from the row container so
 * inputs stay proportional inside padded cards — not from the full window.
 */
export default function OtpInput({
  value,
  onChangeDigit,
  onPaste,
  onKeyPress,
  setRef,
  errored,
}: Props) {
  const labels = useLabels();
  const [rowWidth, setRowWidth] = useState(0);

  const metrics = useMemo(() => otpBoxMetrics(rowWidth), [rowWidth]);

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits.length > 1) {
      onPaste?.(digits.slice(0, OTP_LENGTH).split(''));
      return;
    }
    onChangeDigit(index, raw);
  };

  return (
    <View
      style={styles.outer}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - rowWidth) > 0.5) setRowWidth(w);
      }}
    >
      <View style={[styles.row, { gap: metrics.gap }]}>
        {value.map((digit, i) => (
          <OtpBox
            key={i}
            ref={(el) => setRef(i, el)}
            value={digit}
            size={metrics.box}
            errored={errored}
            autoFocus={i === 0}
            accessibilityLabel={fill(labels.a11y.digit, { n: i + 1 })}
            onChangeText={(text) => handleChange(i, text)}
            onKeyPress={(e) => onKeyPress(i, e.nativeEvent.key)}
            selectTextOnFocus
            {...(Platform.OS === 'android' ? { importantForAutofill: 'yes' as const } : {})}
            textContentType="oneTimeCode"
            autoComplete={Platform.OS === 'web' ? 'one-time-code' : 'sms-otp'}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap',
    width: '100%',
  },
});
