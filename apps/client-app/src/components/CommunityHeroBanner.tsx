import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@serrale/ui";

interface CommunityHeroBannerProps {
  onPressPostProject?: () => void;
}

const heroImage =
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80";

export function CommunityHeroBanner({ onPressPostProject }: CommunityHeroBannerProps) {
  return (
    <ImageBackground source={{ uri: heroImage }} style={styles.banner} imageStyle={styles.image}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Talents. Skills. Community.</Text>
        <Text style={styles.subtitle}>Ethiopia’s talent, working together.</Text>
        <Pressable style={styles.cta} onPress={onPressPostProject}>
          <Text style={styles.ctaText}>Post a Project</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
    minHeight: 210
  },
  image: {
    borderRadius: radius.lg
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(11, 31, 58, 0.45)",
    padding: spacing.lg,
    gap: spacing.sm
  },
  title: {
    ...typography.h2,
    color: colors.white
  },
  subtitle: {
    ...typography.body,
    color: colors.white
  },
  cta: {
    alignSelf: "flex-start",
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  ctaText: {
    ...typography.label,
    color: colors.white
  }
});
