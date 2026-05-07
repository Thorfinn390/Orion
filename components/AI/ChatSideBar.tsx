import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { apiFetch } from "@/utils/apiFetch";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const ChatSideBar = ({
  changeSideBarStatus,
}: {
  changeSideBarStatus: (status: boolean) => void;
}) => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const fullName = useAuthStore((state) => state.fullName);
  const userId = useAuthStore((state) => state.userId);

  const [page, setPage] = useState(1);

  const setCurrentChatId = useChatStore((state: any) => state.setCurrentChatId);

  const { data: chatHistory_, isLoading: chatHistoryLoading } = useQuery({
    queryKey: ["chat-history", userId, page],
    queryFn: async () => {
      const response = await apiFetch(`/chat?page=${page}&limit=10`, {
        method: "GET",
      });
      return await response.json();
    },
    enabled: !!userId,
  });

  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await apiFetch(`/chat/${chatId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete chat");
      }
      return chatId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
      Toast.show({
        type: "success",
        text1: "Log Deleted",
        text2: "The conversation has been removed.",
        position: "bottom",
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Deletion Failed",
        text2: error.message || "Something went wrong.",
        position: "bottom",
      });
    },
  });

  const handleNewChat = () => {
    changeSideBarStatus(false);
    setCurrentChatId(null);
  };

  const handleDeleteChat = (id: string) => {
    deleteChatMutation.mutate(id);
    setCurrentChatId(null);
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 bg-surface border-r border-borderDefault w-[300px] shadow-2xl"
    >
      {/* --- HEADER --- */}
      <View className="px-md pt-lg pb-md border-b border-borderDefault">
        <View className="mb-md">
          <Text className="text-meta text-[10px] font-black uppercase tracking-[3px]">
            Intelligence
          </Text>
          <Text className="text-2xl font-black text-primary">Nova</Text>
        </View>

        <TouchableOpacity
          onPress={handleNewChat}
          activeOpacity={0.8}
          className="flex-row items-center justify-center bg-primaryBrand h-12 rounded-2xl shadow-md"
        >
          <Ionicons name="add" size={22} color="white" />
          <Text className="text-white font-bold ml-xs text-base">New Chat</Text>
        </TouchableOpacity>
      </View>

      {/* --- SEARCH --- */}
      <View className="px-md mt-lg mb-md">
        <View className="flex-row items-center bg-inputSurface px-md rounded-2xl border border-borderEmphasis">
          <Ionicons name="search" size={16} color="#7B8BAA" />
          <TextInput
            placeholder="Search logs..."
            placeholderTextColor="#7B8BAA"
            className="flex-1 text-primary text-sm py-sm ml-sm font-medium"
          />
        </View>
      </View>

      {/* --- CHAT LIST --- */}
      {chatHistoryLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#1568C4" />
        </View>
      ) : (
        <FlatList
          data={chatHistory_?.data || []}
          keyExtractor={(item) => item.id.toString()}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-16 h-16 bg-primaryBrand/5 rounded-3xl items-center justify-center mb-md rotate-12">
                <Ionicons name="journal-outline" size={32} color="#1568C4" />
              </View>
              <Text className="text-primary font-bold text-lg">No Chats</Text>
            </View>
          }
          renderItem={({ item: chat }) => {
            const isDeleting =
              deleteChatMutation.isPending &&
              deleteChatMutation.variables === chat.id;

            return (
              <View className="flex-row items-center mb-xs">
                <TouchableOpacity
                  onPress={() => {
                    setCurrentChatId(chat?.id);
                    changeSideBarStatus(false);
                  }}
                  activeOpacity={0.7}
                  className="flex-1 flex-row items-center p-md rounded-2xl bg-white border border-borderDefault shadow-sm"
                >
                  <View className="w-1.5 h-6 rounded-full bg-primaryBrand/20 mr-md" />
                  <View className="flex-1">
                    <Text
                      className="text-primary text-sm font-bold"
                      numberOfLines={1}
                    >
                      {chat.title || "Untitled Intelligence"}
                    </Text>
                    <Text className="text-meta text-[10px] font-bold uppercase mt-xs">
                      Nova
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeleteChat(chat.id)}
                  disabled={deleteChatMutation.isPending}
                  activeOpacity={0.5}
                  className={`w-10 h-10 items-center justify-center rounded-xl ml-xs border ${
                    isDeleting
                      ? "bg-gray-50 border-gray-200"
                      : "bg-red-50 border-red-100"
                  }`}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  )}
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* --- FOOTER --- */}
      <View className="px-md pt-md">
        <View className="p-md rounded-[24px] border border-borderEmphasis bg-inputSurface shadow-md">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-primaryBrand items-center justify-center shadow-lg">
                <Text className="text-white text-lg font-black">
                  {fullName?.charAt(0)}
                </Text>
              </View>
              <View className="ml-md">
                <Text
                  className="text-primary text-sm font-black"
                  numberOfLines={1}
                >
                  {fullName}
                </Text>
                <Text className="text-primaryBrand text-[10px] font-bold uppercase tracking-wider">
                  Verified Agent
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ChatSideBar;
