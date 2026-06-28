import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '../lib/icons';
import { colors, fonts } from '../lib/theme';

interface Props {
  icon: string;
  title: string;
  text: string;
  /** Optional circular tinted background behind the icon. */
  circle?: string;
  iconColor?: string;
  children?: ReactNode;
}

/** Centered empty / no-results state with an optional action area. */
export default function EmptyState({ icon, title, text, circle, iconColor = colors.success, children }: Props) {
  return (
    <View style={styles.wrap}>
      {circle ? (
        <View style={[styles.circle, { backgroundColor: circle }]}>
          <Icon name={icon} size={30} color={iconColor} weight="regular" />
        </View>
      ) : (
        <Icon name={icon} size={42} color="#bcc6bf" weight="regular" />
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 42 },
  circle: { width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontFamily: fonts.bold, color: colors.text, marginTop: 16, textAlign: 'center' },
  text: { fontSize: 13, color: colors.muted, marginTop: 7, lineHeight: 20, textAlign: 'center', fontFamily: fonts.regular },
});
