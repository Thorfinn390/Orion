import ChatSideBar from "@/components/AI/ChatSideBar";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiFetch } from "@/utils/apiFetch";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  brand: "#1568C4",
  primary: "#0D1A3A",
  surface: "#F4F6FA",
  white: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  meta: "#7B8BAA",
  red: "#EF4444",
};

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
interface MessageProps {
  role: "user" | "assistant";
  message_text: string;
  sentAt: string;
  userInitial: string;
  isLoading?: boolean;
}

const MessageBubble = React.memo(
  ({ role, message_text, sentAt, userInitial, isLoading }: MessageProps) => {
    const isUser = role === "user";
    return (
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={[
          styles.bubbleRow,
          isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant,
        ]}
      >
        {/* Avatar */}
        <View
          style={[
            styles.avatar,
            isUser ? styles.avatarUser : styles.avatarAssistant,
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              isUser ? styles.avatarTextUser : styles.avatarTextAssistant,
            ]}
          >
            {isUser ? userInitial : "N"}
          </Text>
        </View>

        {/* Bubble */}
        <View style={styles.bubbleWrap}>
          <View
            style={[
              styles.bubble,
              isUser ? styles.bubbleUser : styles.bubbleAssistant,
            ]}
          >
            {!isUser && <Text style={styles.novaLabel}>Nova</Text>}
            {isLoading ? (
              <View style={styles.loadingDots}>
                <ActivityIndicator size="small" color={C.brand} />
              </View>
            ) : (
              <Text
                style={[
                  styles.bubbleText,
                  isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant,
                ]}
              >
                {message_text}
              </Text>
            )}
          </View>
          {!isLoading && (
            <Text
              style={[
                styles.timestamp,
                isUser ? styles.timestampRight : styles.timestampLeft,
              ]}
            >
              {sentAt}
            </Text>
          )}
        </View>
      </MotiView>
    );
  },
);
MessageBubble.displayName = "MessageBubble";

const RenderEmpty = ({ fullName }: { fullName: string | null }) => (
  <View style={styles.emptyWrap}>
    <MotiView
      from={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 500 }}
      style={styles.emptyInner}
    >
      <View style={styles.emptyIconWrap}>
        <Text style={styles.emptyIcon}>✦</Text>
      </View>
      <Text style={styles.emptyLabel}>Welcome back</Text>
      <Text style={styles.emptyName}>{fullName || "Traveler"}</Text>
      <Text style={styles.emptyHint}>
        Ask Nova anything about your flights,{"\n"}bookings, or travel plans.
      </Text>
    </MotiView>
  </View>
);

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
const LLM = () => {
  const router = useRouter();
  const [chatsOpened, setChatsOpened] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  // Use a ref for chatId so mutations always see the latest value
  const chatIdRef = useRef<string | null>(null);
  const [chatId, _setChatId] = useState<string | null>(null);
  const setChatId = (id: string | null) => {
    chatIdRef.current = id;
    _setChatId(id);
  };

  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const userId = useAuthStore((state) => state.userId);
  const fullName = useAuthStore((state) => state.fullName);
  const userInitial = fullName?.charAt(0).toUpperCase() || "U";

  // ── CREATE CHAT ─────------------
  const { mutateAsync: createChatMutate } = useMutation({
    mutationFn: async () => {
      console.log("[CHAT] Creating new chat...");
      const response = await apiFetch("/chat/", { method: "POST" });
      const data = await response.json();
      console.log("[CHAT] Create response:", JSON.stringify(data));
      return data;
    },
    onSuccess: (data) => {
      const id = data?.data?.id ?? data?.id ?? null;
      console.log("[CHAT] New chat ID:", id);
      if (id) {
        setChatId(id);
        queryClient.invalidateQueries({ queryKey: ["chat-history", userId] });
      } else {
        console.warn("[CHAT] No ID found in create response:", data);
      }
    },
  });

  // ── SEND MESSAGE ───────────────────────────────────────────────────────────
  const { mutate: sendMessageMutate, isPending } = useMutation({
    mutationFn: async ({
      activeId,
      text,
      time,
    }: {
      activeId: string;
      text: string;
      time: string;
    }) => {
      console.log(`[MSG] Sending to chat ${activeId}:`, text);
      const response = await apiFetch(`/chat/${activeId}/message`, {
        method: "POST",
        body: JSON.stringify({
          message_text: text,
          firstMessage: messages.length === 0,
          sentAt: time,
        }),
      });

      console.log("[MSG] Response status:", response.status);
      const data = await response.json();
      console.log("[MSG] Response body:", JSON.stringify(data));

      if (!response.ok) {
        throw new Error(data?.message ?? `HTTP ${response.status}`);
      }

      // Handle both { data: {...} } and flat { id, role, ... } shapes
      return data?.data ?? data;
    },
    onSuccess: (data) => {
      console.log(
        "[MSG] onSuccess, replacing placeholder with:",
        JSON.stringify(data),
      );
      setMessages((prev) => {
        const next = prev.map((msg) =>
          msg.id === "loading-temp"
            ? { ...data, id: data.id ?? Date.now().toString() }
            : msg,
        );
        console.log("[MSG] Messages after update:", next.length);
        return next;
      });
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    },
    onError: (error: any) => {
      console.error("[MSG] Send failed:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== "loading-temp"));
      Toast.show({
        type: "error",
        text1: "Message Failed",
        text2: error?.message ?? "Unknown error",
      });
    },
  });

  // ── SEND HANDLER ───────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isPending) return;

    const sentAt = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessage("");

    // Optimistically add user message + loading placeholder immediately
    const userMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      message_text: trimmed,
      sentAt,
    };
    const loadingMsg = {
      id: "loading-temp",
      role: "assistant" as const,
      message_text: "",
      sentAt: "",
      isLoading: true,
    };

    console.log("[FLOW] Adding optimistic messages...");
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    // Resolve chat ID
    let activeId = chatIdRef.current;
    console.log("[FLOW] Current chatId:", activeId);

    if (!activeId) {
      try {
        const newChat = await createChatMutate();
        activeId = newChat?.data?.id ?? newChat?.id ?? null;
        console.log("[FLOW] Created chat, activeId:", activeId);
        if (!activeId) {
          throw new Error("Chat creation returned no ID");
        }
        setChatId(activeId);
      } catch (err: any) {
        console.error("[FLOW] Chat creation failed:", err);
        setMessages((prev) =>
          prev.filter((m) => m.id !== "loading-temp" && m.id !== userMsg.id),
        );
        Toast.show({
          type: "error",
          text1: "Could not start chat",
          text2: err?.message ?? "Check your connection",
        });
        return;
      }
    }

    sendMessageMutate({ activeId: activeId!, text: trimmed, time: sentAt });
  }, [message, isPending, createChatMutate, sendMessageMutate]);

  const sendDisabled = !message.trim() || isPending;

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      {/* Sidebar */}
      <MotiView
        animate={{ translateX: chatsOpened ? 0 : -320 }}
        transition={{ type: "timing", duration: 250 }}
        style={styles.sidebar}
      >
        <ChatSideBar changeSideBarStatus={setChatsOpened} />
      </MotiView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setChatsOpened(true)}
            style={styles.iconBtn}
          >
            <Ionicons name="menu-outline" size={26} color={C.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerEyebrow}>Orion Flight Intelligence</Text>
            <Text style={styles.headerTitle}>Nova</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={styles.iconBtn}
          >
            <Ionicons name="home-outline" size={22} color={C.primary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              role={item.role}
              message_text={item.message_text}
              sentAt={item.sentAt}
              userInitial={userInitial}
              isLoading={item.isLoading}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<RenderEmpty fullName={fullName} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* ── NEW INPUT BAR ── */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.inputOuter}>
            {/* Left icon */}
            <View style={styles.inputIconLeft}>
              <Ionicons name="sparkles-outline" size={18} color={C.brand} />
            </View>

            <TextInput
              placeholder="Ask Nova anything..."
              placeholderTextColor={C.meta}
              value={message}
              onChangeText={setMessage}
              style={styles.textInput}
              multiline
              maxLength={1000}
              returnKeyType="default"
            />

            {/* Send button */}
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={sendDisabled}
              activeOpacity={0.8}
              style={[
                styles.sendBtn,
                sendDisabled ? styles.sendBtnOff : styles.sendBtnOn,
              ]}
            >
              {isPending ? (
                <ActivityIndicator size="small" color={C.white} />
              ) : (
                <Ionicons name="arrow-up" size={20} color={C.white} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.inputHint}>
            Nova may make mistakes. Verify important info.
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Backdrop */}
      {chatsOpened && (
        <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setChatsOpened(false)}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={20}
              tint="dark"
              experimentalBlurMethod="dimezisBlurView"
            />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LLM;

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  root: { flex: 1, backgroundColor: C.surface },
  backdrop: { zIndex: 20 },

  // Sidebar
  sidebar: {
    zIndex: 30,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "80%",
  },

  // Header
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerCenter: { alignItems: "center" },
  headerEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    color: C.meta,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.primary },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  // List
  listContent: { flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20 },

  // Bubbles
  bubbleRow: { marginBottom: 14, maxWidth: "88%", flexDirection: "row" },
  bubbleRowUser: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  bubbleRowAssistant: { alignSelf: "flex-start" },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarUser: { backgroundColor: C.brand, marginLeft: 8 },
  avatarAssistant: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
  },
  avatarText: { fontSize: 11, fontWeight: "900" },
  avatarTextUser: { color: C.white },
  avatarTextAssistant: { color: C.brand },

  bubbleWrap: { flex: 1 },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: C.brand,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderBottomLeftRadius: 4,
  },
  novaLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: C.brand,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: C.white },
  bubbleTextAssistant: { color: C.primary },
  loadingDots: { paddingVertical: 2, alignItems: "flex-start" },

  timestamp: {
    fontSize: 10,
    color: C.meta,
    marginTop: 4,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  timestampRight: { textAlign: "right" },
  timestampLeft: { textAlign: "left" },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyInner: { alignItems: "center" },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.brand + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyIcon: { fontSize: 24, color: C.brand },
  emptyLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.meta,
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 8,
  },
  emptyName: {
    fontSize: 32,
    fontWeight: "900",
    color: C.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  emptyHint: {
    fontSize: 15,
    color: C.meta,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
  },

  // ── INPUT BAR ──────────────────────────────────────────────────────────────
  inputBar: {
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: C.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
  },
  inputOuter: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    // Focus glow handled via shadow — static since we can't do :focus in RN easily
    shadowColor: C.brand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  inputIconLeft: {
    width: 28,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    color: C.primary,
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: 6,
    maxHeight: 120, // allow multiline up to ~5 lines
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    marginBottom: 1,
  },
  sendBtnOn: {
    backgroundColor: C.brand,
    shadowColor: C.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnOff: { backgroundColor: C.borderStrong },
  inputHint: {
    fontSize: 10,
    color: C.meta,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 2,
    fontWeight: "500",
  },
});
