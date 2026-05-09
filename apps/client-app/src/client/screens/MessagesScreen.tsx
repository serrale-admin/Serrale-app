import React from "react";
import { ScrollView, StyleSheet, Text, View, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clientColors, clientRadius, clientShadows, clientSpacing, clientTypography } from "../theme";
import { useTranslation } from "../i18n";

export const MessagesScreen = () => {
  const { t } = useTranslation();

  const chats = [
    {
      id: "1",
      name: "Liya Mengesha",
      lastMessage: "I can start on your project this Monday.",
      time: "2m ago",
      unread: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liya",
    },
    {
      id: "2",
      name: "Samuel G.",
      lastMessage: "The quote for the mobile app is ready.",
      time: "1h ago",
      unread: false,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Samuel",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={clientTypography.h1}>{t("messages")}</Text>
        <Pressable style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color={clientColors.navy} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {chats.map((chat) => (
          <Pressable key={chat.id} style={styles.chatItem}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: chat.avatar }} style={styles.avatar} />
              {chat.unread && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={clientTypography.title}>{chat.name}</Text>
                <Text style={clientTypography.caption}>{chat.time}</Text>
              </View>
              <Text 
                style={[clientTypography.body, chat.unread && styles.unreadText]} 
                numberOfLines={1}
              >
                {chat.lastMessage}
              </Text>
            </View>
          </Pressable>
        ))}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: clientSpacing.screenPadding,
    paddingTop: 60,
    marginBottom: clientSpacing.lg,
  },
  searchButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: clientColors.white,
    ...clientShadows.card,
  },
  content: {
    paddingHorizontal: clientSpacing.screenPadding,
  },
  chatItem: {
    flexDirection: "row",
    backgroundColor: clientColors.white,
    padding: clientSpacing.md,
    borderRadius: clientRadius.large,
    marginBottom: clientSpacing.sm,
    alignItems: "center",
    ...clientShadows.card,
  },
  avatarContainer: {
    position: "relative",
    marginRight: clientSpacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: clientRadius.medium,
    backgroundColor: clientColors.softBlue,
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: clientColors.primary,
    borderWidth: 2,
    borderColor: clientColors.white,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: "700",
    color: clientColors.navy,
  },
});
