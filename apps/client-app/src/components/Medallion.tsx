import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';
import { Icon } from '../lib/icons';
import { gradFor } from '../lib/theme';

interface Props {
  group: string;
  icon: string;
  size?: number;
  radius?: number;
  iconSize?: number;
  style?: ViewStyle;
}

/** Gradient rounded-square category medallion with a centered icon. */
export default function Medallion({ group, icon, size = 46, radius = 15, iconSize = 22, style }: Props) {
  return (
    <LinearGradient
      colors={gradFor(group)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.center, { width: size, height: size, borderRadius: radius }, style]}
    >
      <Icon name={icon} size={iconSize} color="#fff" weight="fill" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
