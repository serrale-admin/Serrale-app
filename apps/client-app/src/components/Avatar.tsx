import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import { avatarColor, initialsOf } from '../lib/format';
import { providerImage } from '../lib/provider-images';
import { colors, fonts } from '../lib/theme';

interface Props {
  name: string;
  size: number;
  radius: number;
  fontSize: number;
  imageUrl?: string;
  /** When set, fills with a gradient instead of the name-derived solid color. */
  gradient?: [string, string];
}

/** Initials avatar with a stable color (or gradient) fallback. */
export default function Avatar({ name, size, radius, fontSize, imageUrl, gradient }: Props) {
  const label = (
    <Text style={[styles.text, { fontSize }]} numberOfLines={1}>
      {initialsOf(name)}
    </Text>
  );
  const box = { width: size, height: size, borderRadius: radius };
  const localImage = providerImage(name);

  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={[box, styles.image]} resizeMode="cover" />;
  }

  if (localImage) {
    return <Image source={localImage} style={[box, styles.image]} resizeMode="cover" />;
  }

  if (gradient) {
    return (
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.center, box]}>
        {label}
      </LinearGradient>
    );
  }
  return <View style={[styles.center, box, { backgroundColor: avatarColor(name) }]}>{label}</View>;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  image: { backgroundColor: colors.soft },
  text: { fontFamily: fonts.heading, color: colors.surface, letterSpacing: 0.5 },
});
