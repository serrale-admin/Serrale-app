import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { providerChatMessages, providerConversations } from "../../provider/data";
import type { ProviderConversation } from "../../provider/types";
import { IconSymbol } from "../../provider/components/IconSymbol";
import { providerColors, providerRadius, providerShadows, providerSpacing, providerTypography } from "../../provider/theme";

interface ProviderChatScreenProps {
  chatId: string;
}

export function ProviderChatScreen({ chatId }: ProviderChatScreenProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const conversation: ProviderConversation = useMemo(
    () => providerConversations.find((entry) => entry.id === chatId) ?? providerConversations[0],
    [chatId]
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerIconBtn}>
          <IconSymbol name="chevron-back" size={20} color={providerColors.title} />
        </Pressable>
        <View style={[styles.avatar, { backgroundColor: conversation.bg }]}>
          <Text style={[styles.avatarText, { color: conversation.fg }]}>{conversation.initials}</Text>
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.name}>{conversation.name}</Text>
          <Text style={styles.online}>Online</Text>
        </View>
      </View>

      <View style={styles.projectCard}>
        <IconSymbol name="briefcase-outline" size={16} color={providerColors.blue} />
        <View style={styles.projectTextWrap}>
          <Text style={styles.projectTag}>PROJECT</Text>
          <Text style={styles.projectTitle}>{conversation.project}</Text>
        </View>
        <IconSymbol name="chevron-forward" size={16} color={providerColors.muted} />
      </View>

      <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
        <Text style={styles.dayLabel}>Today</Text>
        {providerChatMessages.map((chatMessage) => {
          const mine = chatMessage.from === "me";

          return (
            <View key={chatMessage.id} style={[styles.bubbleRow, mine ? styles.rowRight : styles.rowLeft]}>
              <View style={[styles.bubble, mine ? styles.myBubble : styles.theirBubble]}>
                <Text style={[styles.bubbleText, mine ? styles.myBubbleText : styles.theirBubbleText]}>
                  {chatMessage.text}
                </Text>
              </View>
              <Text style={[styles.timeText, mine ? styles.timeRight : styles.timeLeft]}>{chatMessage.time}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputRow}>
        <Pressable style={styles.attachBtn}>
          <IconSymbol name="attach-outline" size={18} color={providerColors.blue} />
        </Pressable>
        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor={providerColors.light}
            value={message}
            onChangeText={setMessage}
            style={styles.input}
          />
        </View>
        <Pressable style={styles.sendBtn}>
          <IconSymbol name="paper-plane-outline" size={18} color={providerColors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: providerColors.appBg
  },
  header: {
    marginTop: providerSpacing.xxl,
    paddingHorizontal: providerSpacing.lg,
    paddingBottom: providerSpacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: providerColors.border,
    backgroundColor: providerColors.white
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    ...providerTypography.caption
  },
  headerTextWrap: {
    flex: 1
  },
  name: {
    ...providerTypography.title,
    color: providerColors.navy
  },
  online: {
    ...providerTypography.caption,
    color: providerColors.successGreen
  },
  projectCard: {
    marginHorizontal: providerSpacing.lg,
    marginTop: providerSpacing.md,
    borderRadius: providerRadius.md,
    backgroundColor: providerColors.softCard,
    paddingHorizontal: providerSpacing.md,
    paddingVertical: providerSpacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm
  },
  projectTextWrap: {
    flex: 1
  },
  projectTag: {
    ...providerTypography.caption,
    color: providerColors.muted
  },
  projectTitle: {
    ...providerTypography.label,
    color: providerColors.navy
  },
  messages: {
    paddingHorizontal: providerSpacing.lg,
    paddingTop: providerSpacing.md,
    paddingBottom: providerSpacing.md,
    gap: providerSpacing.sm
  },
  dayLabel: {
    ...providerTypography.caption,
    color: providerColors.muted,
    alignSelf: "center"
  },
  bubbleRow: {
    maxWidth: "82%"
  },
  rowRight: {
    alignSelf: "flex-end"
  },
  rowLeft: {
    alignSelf: "flex-start"
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: providerSpacing.md,
    paddingVertical: providerSpacing.sm
  },
  myBubble: {
    backgroundColor: providerColors.blue,
    borderTopRightRadius: 4
  },
  theirBubble: {
    backgroundColor: providerColors.white,
    borderTopLeftRadius: 4,
    ...providerShadows.card
  },
  bubbleText: {
    ...providerTypography.body,
    lineHeight: 20
  },
  myBubbleText: {
    color: providerColors.white
  },
  theirBubbleText: {
    color: providerColors.title
  },
  timeText: {
    ...providerTypography.caption,
    color: providerColors.muted,
    marginTop: 4
  },
  timeRight: {
    textAlign: "right"
  },
  timeLeft: {
    textAlign: "left"
  },
  inputRow: {
    paddingHorizontal: providerSpacing.md,
    paddingTop: providerSpacing.sm,
    paddingBottom: providerSpacing.xxl,
    borderTopWidth: 1,
    borderTopColor: providerColors.border,
    backgroundColor: providerColors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: providerSpacing.sm
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: providerColors.softCard,
    alignItems: "center",
    justifyContent: "center"
  },
  inputWrap: {
    flex: 1,
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: providerColors.softCard,
    paddingHorizontal: providerSpacing.md,
    justifyContent: "center"
  },
  input: {
    ...providerTypography.body,
    color: providerColors.title
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: providerColors.blue,
    alignItems: "center",
    justifyContent: "center"
  }
});
