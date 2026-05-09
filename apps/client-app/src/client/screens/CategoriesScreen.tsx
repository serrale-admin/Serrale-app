import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clientColors, clientRadius, clientSpacing, clientTypography } from "../theme";
import { useTranslation } from "../i18n";
import { CategoryCard } from "../components/CategoryCard";

export const CategoriesScreen = () => {
  const { t } = useTranslation();

  const categories = [
    { title: "Design & Creative", subtitle: "Branding, UI/UX, Graphics", icon: "brush-outline", bg: "#E9F5FF" },
    { title: "Development & IT", subtitle: "Web, Mobile, Software", icon: "code-slash-outline", bg: "#F2EAFF" },
    { title: "Home & Repairs", subtitle: "Cleaning, Plumbing, Electric", icon: "home-outline", bg: "#E7FAF6" },
    { title: "Marketing & Sales", subtitle: "Social Media, Ads, SEO", icon: "megaphone-outline", bg: "#FFF4E2" },
    { title: "Writing & Translation", subtitle: "Copywriting, Amharic", icon: "document-text-outline", bg: "#FEECEC" },
    { title: "Business & Finance", subtitle: "Accounting, Planning", icon: "briefcase-outline", bg: "#EAF3FF" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={clientTypography.h1}>{t("categories")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {categories.map((cat, index) => (
            <CategoryCard
              key={index}
              title={cat.title}
              subtitle={cat.subtitle}
              icon={cat.icon as any}
              onPress={() => {}}
              iconBg={cat.bg}
            />
          ))}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: clientColors.background,
  },
  header: {
    paddingHorizontal: clientSpacing.screenPadding,
    paddingTop: 60,
    marginBottom: clientSpacing.lg,
  },
  content: {
    paddingHorizontal: clientSpacing.screenPadding,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: clientSpacing.md,
  },
});
