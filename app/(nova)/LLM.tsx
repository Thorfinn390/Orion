import ChatSideBar from "@/components/AI/ChatSideBar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import {
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

// --- SUB-COMPONENT: MESSAGE BUBBLE ---
interface MessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const MessageBubble = React.memo(
  ({ role, content, timestamp }: MessageProps) => {
    const isUser = role === "user";

    return (
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        className={`mb-lg max-w-[85%] ${isUser ? "self-end" : "self-start"}`}
      >
        <View
          className={`px-md py-sm rounded-2xl shadow-sm ${
            isUser
              ? "bg-primaryBrand rounded-tr-none"
              : "bg-white border border-borderDefault rounded-tl-none"
          }`}
        >
          {!isUser && (
            <Text className="text-primaryBrand font-bold text-[10px] mb-xs uppercase">
              Nova Assistant
            </Text>
          )}
          <Text
            className={`text-base leading-6 ${
              isUser ? "text-white" : "text-primary"
            }`}
          >
            {content}
          </Text>
        </View>
        <Text
          className={`text-meta text-[10px] mt-xs font-bold uppercase ${
            isUser ? "text-right mr-1" : "text-left ml-1"
          }`}
        >
          {timestamp}
        </Text>
      </MotiView>
    );
  },
);

MessageBubble.displayName = "MessageBubble";

// --- MAIN SCREEN: LLM ---
const LLM = () => {
  const [chatsOpened, setChatsOpened] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const insets = useSafeAreaInsets();

  const fullName = useAuthStore((state) => state.fullName);

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  }, [message]);

  const renderEmptyComponent = () => (
    <View className="flex-1 items-center justify-center px-xl py-20">
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 600 }}
        className="items-center"
      >
        <Text className="text-meta text-[12px] font-black uppercase tracking-[4px] mb-xs">
          Welcome Back
        </Text>

        <Text className="text-5xl font-black text-primary text-center leading-tight">
          {fullName || "Traveler"}
        </Text>

        <View className="h-[2px] w-12 bg-primaryBrand/30 my-lg rounded-full" />

        <Text className="text-primary/60 text-center text-lg font-medium leading-7 px-sm">
          Ready to optimize your next mission?{"\n"}
          <Text className="text-primaryBrand font-bold">Nova</Text> is standing
          by.
        </Text>
      </MotiView>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-surface"
      edges={["top", "left", "right"]}
    >
      {/* Sidebar Overlay */}
      <MotiView
        animate={{ translateX: chatsOpened ? 0 : -320 }}
        transition={{ type: "timing", duration: 250 }}
        className="z-30 absolute top-0 bottom-0 left-0 w-[80%] h-full"
      >
        <ChatSideBar changeSideBarStatus={setChatsOpened} />
      </MotiView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View className="px-md py-sm flex-row items-center justify-between bg-surface border-b border-borderDefault shadow-sm">
          <TouchableOpacity
            onPress={() => setChatsOpened(true)}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="menu-outline" size={28} color="#0D1A3A" />
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-[10px] font-black text-meta uppercase tracking-[2px]">
              Orion Flight Intelligence
            </Text>
            <Text className="text-lg font-bold text-primary">Nova</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="home-outline" size={24} color="#0D1A3A" />
          </TouchableOpacity>
        </View>

        {/* Chat Area - Swapped ScrollView for FlatList */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              role={item.role}
              content={item.content}
              timestamp={item.timestamp}
            />
          )}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingVertical: 24,
          }}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />

        {/* Input Bar */}
        <View
          style={{ paddingBottom: Platform.OS === "ios" ? 0 : insets.bottom }}
          className="px-md pb-lg pt-sm bg-white border-t border-borderDefault"
        >
          <View className="flex-row items-center rounded-2xl px-md py-xs border border-borderEmphasis bg-surface shadow-sm">
            <TextInput
              placeholder="Ask about a flight..."
              placeholderTextColor="#7B8BAA"
              value={message}
              onChangeText={setMessage}
              className="flex-1 text-primary text-base py-sm"
              multiline
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!message.trim()}
              className={`ml-sm w-10 h-10 rounded-xl items-center justify-center ${
                message.trim() ? "bg-primaryBrand shadow-md" : "bg-meta/30"
              }`}
            >
              <Ionicons name="paper-plane" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Backdrop for Sidebar */}
      {chatsOpened && (
        <View style={StyleSheet.absoluteFill} className="z-20">
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
