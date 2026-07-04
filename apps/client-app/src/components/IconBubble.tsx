import { StyleSheet, View, ViewStyle } from 'react-native';
import { Icon, IconWeight } from '../lib/icons';
import { colors } from '../lib/theme';

interface Props {
  icon: string;
  size?: number;
  iconSize?: number;
  iconColor?: string;
  weight?: IconWeight;
  style?: ViewStyle;
  shape?: 'circle' | 'rounded';
}

/**
 * Circular frosted-glass icon container. White bubble + thin green rim + soft
 * shadow simulate glass without a BlurView dependency. Holds a bold deep-green icon.
 */
export default function IconBubble({
  icon,
  size = 48,
  iconSize = 22,
  iconColor = colors.green800,
  weight = 'fill',
  style,
  shape = 'rounded',
}: Props) {
  return (
    <View
      style={[
        styles.bubble,
        { width: size, height: size, borderRadius: shape === 'circle' ? size / 2 : Math.min(14, size * 0.3) },
        style,
      ]}
    >
      <Icon name={icon} size={iconSize} color={iconColor} weight={weight} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: colors.frostBorder,
    shadowColor: '#064734',
    shadowOpacity: 0.035,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
