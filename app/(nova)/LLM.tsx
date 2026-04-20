import ChatSideBar from "@/components/AI/ChatSideBar";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { apiFetch } from "@/utils/apiFetch";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import Markdown from "react-native-markdown-display";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

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

    const formattedTime = useMemo(() => {
      if (!sentAt) return "";
      try {
        return new Date(sentAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return "";
      }
    }, [sentAt]);

    const markdownStyles = useMemo(
      () => ({
        body: {
          ...styles.bubbleText,
          color: isUser ? C.white : C.primary,
        },
        paragraph: {
          marginTop: 0,
          marginBottom: 0,
          flexWrap: "wrap",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "flex-start",
        },
        link: {
          color: isUser ? C.white : C.brand,
          textDecorationLine: "underline",
        },
        bullet_list: { marginTop: 4 },
        ordered_list: { marginTop: 4 },
      }),
      [isUser],
    );

    return (
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={[
          styles.bubbleRow,
          isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant,
        ]}
      >
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
              <Markdown style={markdownStyles as any}>{message_text}</Markdown>
            )}
          </View>
          {!isLoading && (
            <Text
              style={[
                styles.timestamp,
                isUser ? styles.timestampRight : styles.timestampLeft,
              ]}
            >
              {formattedTime}
            </Text>
          )}
        </View>
      </MotiView>
    );
  },
);

MessageBubble.displayName = "MessageBubble";

const LLM = () => {
  const router = useRouter();
  const [chatsOpened, setChatsOpened] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const chatIdRef = useRef<string | null>(null);
  const [chatId, _setChatId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const setCurrentChatId = useChatStore((state: any) => state.setCurrentChatId);

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
  const currentChatId = useChatStore((state: any) => state.currentChatId);

  const { mutateAsync: createChatMutate } = useMutation({
    mutationFn: async () => {
      const response = await apiFetch("/chat/", { method: "POST" });
      return await response.json();
    },
    onSuccess: (data) => {
      const id = data?.data?.id ?? data?.id ?? null;
      if (id) {
        setChatId(id);
        queryClient.invalidateQueries({ queryKey: ["chat-history", userId] });
      }
    },
  });

  const { mutate: sendMessageMutate, isPending } = useMutation({
    mutationFn: async ({
      activeId,
      text,
    }: {
      activeId: string;
      text: string;
    }) => {
      const response = await apiFetch(`/chat/${activeId}/message`, {
        method: "POST",
        body: JSON.stringify({
          message_text: text,
          firstMessage: messages.length === 0,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.message ?? `HTTP ${response.status}`);
      return data?.data ?? data;
    },
    onSuccess: (data) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === "loading-temp" ? { ...data } : msg)),
      );
    },
    onError: (error: any) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== "loading-temp"));
      Toast.show({
        type: "error",
        text1: "Message Failed",
        text2: error?.message,
      });
    },
  });

  const {
    data: chatMessages,
    isLoading: isLoadingMessages,
    isSuccess,
  } = useQuery({
    queryKey: ["messages", currentChatId, page],
    queryFn: async () => {
      console.log("NOW IM BEING DONE");
      if (!currentChatId) return null;
      const response = await apiFetch(
        `/chat/${currentChatId}/messages?page=${page}`,
        {
          method: "GET",
        },
      );
      return await response.json();
    },
    enabled: !!currentChatId,
  });

  useEffect(() => {
    if (isSuccess && chatMessages?.data) {
      const syncedMessages = [...chatMessages.data].reverse();
      setMessages(syncedMessages);
      setChatId(currentChatId);
    }
  }, [isSuccess, chatMessages, currentChatId]);

  useEffect(() => {
    if (currentChatId === null) {
      setMessages([]);
    }
  }, [currentChatId]);

  useEffect(() => {
    return () => {
      setCurrentChatId(null);
    };
  }, []);

  const handleSendMessage = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isPending) return;

    const isoNow = new Date().toISOString();
    setMessage("");

    const userMsg = {
      id: Date.now().toString(),
      sender_type: "user",
      message_text: trimmed,
      sentAt: isoNow,
    };
    const loadingMsg = {
      id: "loading-temp",
      sender_type: "bot",
      message_text: "",
      sentAt: "",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);

    let activeId = chatIdRef.current;
    if (!activeId) {
      try {
        const newChat = await createChatMutate();
        activeId = newChat?.data?.id ?? newChat?.id ?? null;
        setChatId(activeId);
      } catch (err) {
        setMessages((prev) =>
          prev.filter((m) => m.id !== "loading-temp" && m.id !== userMsg.id),
        );
        return;
      }
    }

    sendMessageMutate({ activeId: activeId!, text: trimmed });
  }, [message, isPending, createChatMutate, sendMessageMutate]);

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
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
      >
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

        {isLoadingMessages ? (
          <View style={styles.flex1Center}>
            <ActivityIndicator size="large" color={C.brand} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble
                role={item.sender_type === "bot" ? "assistant" : "user"}
                message_text={item.message_text}
                sentAt={item.sentAt}
                userInitial={userInitial}
                isLoading={item.isLoading}
              />
            )}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.inputOuter}>
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
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!message.trim() || isPending}
              style={[
                styles.sendBtn,
                !message.trim() || isPending
                  ? styles.sendBtnOff
                  : styles.sendBtnOn,
              ]}
            >
              {isPending ? (
                <ActivityIndicator size="small" color={C.white} />
              ) : (
                <Ionicons name="arrow-up" size={20} color={C.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

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
  flex1Center: { flex: 1, justifyContent: "center", alignItems: "center" },
  root: { flex: 1, backgroundColor: C.surface },
  backdrop: { zIndex: 20 },
  sidebar: {
    zIndex: 30,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "80%",
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
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
  listContent: { flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20 },
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
    maxHeight: 120,
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
  },
  sendBtnOff: { backgroundColor: C.borderStrong },
});
