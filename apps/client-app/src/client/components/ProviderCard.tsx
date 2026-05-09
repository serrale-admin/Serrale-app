import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clientColors, clientRadius, clientShadows, clientSpacing, clientTypography } from "../theme";
import { AppButton } from "./AppButton";
import { useTranslation } from "../i18n";

interface ProviderCardProps {
  name: string;
  specialty: string;
  rating: number;
  location: string;
  avatarUrl?: string;
  verified?: boolean;
  onViewProfile: () => void;
}

export const ProviderCard = ({
  name,
  specialty,
  rating,
  location,
  avatarUrl,
  verified = true,
  onViewProfile,
}: ProviderCardProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <Ionicons name="person" size={30} color={clientColors.light} />
            </View>
          )}
          {verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark-sharp" size={12} color={clientColors.white} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={clientTypography.title}>{name}</Text>
          <Text style={clientTypography.body}>{specialty}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={clientColors.warning} />
              <Text style={styles.metaText}>{rating.toFixed(1)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={clientColors.muted} />
              <Text style={styles.metaText}>{location}</Text>
            </View>
          </View>
        </View>
      </View>
      <AppButton
        label={t("view_profile")}
        onPress={onViewProfile}
        variant="primary"
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: clientColors.white,
    borderRadius: clientRadius.card,
    padding: clientSpacing.md,
    ...clientShadows.card,
    marginBottom: clientSpacing.md,
  },
  header: {
    flexDirection: "row",
    marginBottom: clientSpacing.md,
  },
  avatarContainer: {
    position: "relative",
    marginRight: clientSpacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: clientRadius.medium,
  },
  placeholderAvatar: {
    backgroundColor: clientColors.softBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: clientColors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: clientColors.white,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: clientSpacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    ...clientTypography.caption,
    color: clientColors.muted,
  },
  button: {
    height: 48,
  },
});
