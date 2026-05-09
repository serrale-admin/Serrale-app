import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import { useRouter } from "expo-router";

import { providerConversations } from "../../provider/data";
import { ProviderHeader } from "../../provider/components/ProviderHeader";
import { ProviderScreen } from "../../provider/components/ProviderScreen";
import { providerColors, providerSpacing, providerTypography } from "../../provider/theme";
import { IconSymbol } from "../../provider/components/IconSymbol";

export function ProviderMessagesScreen() {
  const router = useRouter();

  return (
    <ProviderScreen contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <ProviderHeader title="Messages" />
        <Pressable style={styles.searchButton}>
          <IconSymbol name="search-outline" size={18} color={providerColors.title} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {["All", "Unread", "Active"].map((filter, index) => {
          const active = index === 0;
          return (
            <View key={filter} style={[styles.filterChip, active ? styles.activeFilterChip : null]}>
              <Text style={[styles.filterText, active ? styles.activeFilterText : null]}>{filter}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.list}>
        {providerConversations.map((conversation) => (
          <Pressable
            key={conversation.id}
            style={styles.messageRow}
            onPress={() =>
              router.push({
                pathname: "/messages/[chatId]",
                params: { chatId: conversation.id }
              })
            }
          >
            <View style={[styles.avatar, { backgroundColor: conversation.bg }]}>
              <Text style={[styles.avatarText, { color: conversation.fg }]}>{conversation.initials}</Text>
            </View>
            <View style={styles.messageTextWrap}>
              <View style={styles.messageTop}>
                <Text style={styles.name}>{conversation.name}</Text>
                <Text style={styles.time}>{conversation.time}</Text>
              </View>
              <Text style={styles.project}>{conversation.project}</Text>
              <Text
                style={[styles.preview, conversation.unread > 0 ? styles.previewUnread : null]}
                numberOfLines={1}
              >
                {conversation.last}
              </Text>
            </View>
            {conversation.unread > 0 ? (
              <View style={styles.unread}>
                <Text style={styles.unreadText}>{conversation.unread}</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>
    </ProviderScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: providerSpacing.md
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  filters: {
    gap: providerSpacing.sm
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: providerColors.border,
    backgroundColor: providerColors.white,
    paddingHorizontal: providerSpacing.md,
    paddingVertical: providerSpacing.sm
  },
  activeFilterChip: {
    borderColor: providerColors.blue,
    backgroundColor: providerColors.blue
  },
  filterText: {
    ...providerTypography.caption,
    color: providerColors.body
  },
  activeFilterText: {
    color: providerColors.white
  },
  list: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: providerColors.white
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: providerSpacing.sm,
    paddingHorizontal: providerSpacing.md,
    paddingVertical: providerSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: providerColors.border
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    ...providerTypography.label
  },
  messageTextWrap: {
    flex: 1
  },
  messageTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: providerSpacing.sm
  },
  name: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  time: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  project: {
    ...providerTypography.caption,
    color: providerColors.blue,
    marginTop: 2
  },
  preview: {
    ...providerTypography.body,
    color: providerColors.body,
    marginTop: 4
  },
  previewUnread: {
    fontWeight: "700"
  },
  unread: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: providerColors.blue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24
  },
  unreadText: {
    ...providerTypography.caption,
    color: providerColors.white
  }
});
