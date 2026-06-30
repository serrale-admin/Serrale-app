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
}

/**
 * Circular frosted-glass icon container. White bubble + thin green rim + soft
 * shadow simulate glass without a BlurView dependency. Holds a bold deep-green icon.
 */
export default function IconBubble({
  icon,
  size = 52,
  iconSize = 24,
  iconColor = colors.green800,
  weight = 'fill',
  style,
}: Props) {
  return (
    <View style={[styles.bubble, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Icon name={icon} size={iconSize} color={iconColor} weight={weight} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#064734',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});
