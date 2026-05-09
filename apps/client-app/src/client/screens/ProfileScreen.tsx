import React from "react";
import { ScrollView, StyleSheet, Text, View, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clientColors, clientRadius, clientShadows, clientSpacing, clientTypography } from "../theme";
import { useTranslation, useLanguageStore } from "../i18n";
import { AppButton } from "../components/AppButton";

export const ProfileScreen = () => {
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguageStore();

  const menuItems = [
    { label: "Account Settings", icon: "person-outline", color: clientColors.primary },
    { label: "My Projects", icon: "list-outline", color: clientColors.purple },
    { label: "Payment Methods", icon: "card-outline", color: clientColors.success },
    { label: "Notifications", icon: "notifications-outline", color: clientColors.warning },
    { label: "Help & Support", icon: "help-circle-outline", color: clientColors.teal },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={clientTypography.h1}>{t("profile")}</Text>
        <Pressable style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={clientColors.navy} />
        </Pressable>
      </View>

      <View style={styles.profileCard}>
        <Image
          source={{ uri: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nati" }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>Nati K.</Text>
        <Text style={styles.userEmail}>nati@example.com</Text>
        <AppButton
          label={t("improve_profile")}
          onPress={() => {}}
          variant="soft"
          style={styles.editButton}
          full={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.menuCard}>
          <Pressable 
            style={styles.menuItem} 
            onPress={() => setLanguage(language === "en" ? "am" : "en")}
          >
            <View style={[styles.iconBox, { backgroundColor: clientColors.softBlue }]}>
              <Ionicons name="language-outline" size={22} color={clientColors.primary} />
            </View>
            <Text style={styles.menuLabel}>Language</Text>
            <Text style={styles.menuValue}>{language === "en" ? "English" : "አማርኛ"}</Text>
            <Ionicons name="chevron-forward" size={18} color={clientColors.light} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <Pressable 
              key={index} 
              style={[styles.menuItem, index < menuItems.length - 1 && styles.borderBottom]}
            >
              <View style={[styles.iconBox, { backgroundColor: item.color + "15" }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={clientColors.light} />
            </Pressable>
          ))}
        </View>
      </View>

      <AppButton
        label="Log Out"
        onPress={() => {}}
        variant="outline"
        style={styles.logoutButton}
      />
      
      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: clientColors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: clientSpacing.screenPadding,
    paddingTop: 60,
    marginBottom: clientSpacing.lg,
  },
  settingsButton: {
    padding: 8,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: clientColors.white,
    marginHorizontal: clientSpacing.screenPadding,
    borderRadius: clientRadius.card,
    padding: clientSpacing.xl,
    ...clientShadows.card,
    marginBottom: clientSpacing.xxl,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: clientColors.softBlue,
    marginBottom: 16,
  },
  userName: {
    ...clientTypography.h2,
    marginBottom: 4,
  },
  userEmail: {
    ...clientTypography.body,
    color: clientColors.muted,
    marginBottom: 16,
  },
  editButton: {
    height: 40,
    paddingHorizontal: 24,
  },
  section: {
    paddingHorizontal: clientSpacing.screenPadding,
    marginBottom: clientSpacing.xl,
  },
  sectionTitle: {
    ...clientTypography.label,
    marginBottom: clientSpacing.sm,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: clientColors.white,
    borderRadius: clientRadius.large,
    ...clientShadows.card,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: clientSpacing.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: clientColors.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    ...clientTypography.title,
    fontWeight: "600",
  },
  menuValue: {
    ...clientTypography.body,
    color: clientColors.primary,
    marginRight: 8,
    fontWeight: "700",
  },
  logoutButton: {
    marginHorizontal: clientSpacing.screenPadding,
    marginTop: 10,
    borderColor: clientColors.danger,
  },
});
