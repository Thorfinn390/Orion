import { useAuthStore } from "@/stores/useAuthStore";
import { apiFetch } from "@/utils/apiFetch";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ChatSideBar = ({
  changeSideBarStatus,
}: {
  changeSideBarStatus: (status: boolean) => void;
}) => {
  const insets = useSafeAreaInsets();
  const fullName = useAuthStore((state) => state.fullName);
  const email = useAuthStore((state) => state.email);
  const userId = useAuthStore((state) => state.userId);

  const [page, setPage] = useState(1);

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

  const handleNewChat = () => {
    changeSideBarStatus(false);
  };

  const handleDeleteChat = (id: string) => {
    Alert.alert(
      "Delete Mission Log",
      "Are you sure you want to permanently delete this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => console.log("Deleting chat:", id),
        },
      ],
    );
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 bg-surface border-r border-borderDefault w-full shadow-2xl"
    >
      {/* --- BRANDING & HEADER --- */}
      <View className="px-md pt-lg pb-md border-b border-borderDefault">
        <View className="mb-md">
          <Text className="text-meta text-[10px] font-black uppercase tracking-[3px]">
            Intelligence
          </Text>
          <Text className="text-2xl font-black text-primary">Mission Log</Text>
        </View>

        <TouchableOpacity
          onPress={handleNewChat}
          activeOpacity={0.8}
          className="flex-row items-center justify-center bg-primaryBrand h-12 rounded-2xl shadow-md"
        >
          <Ionicons name="add" size={22} color="white" />
          <Text className="text-white font-bold ml-xs text-base">
            New Mission
          </Text>
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
              <Text className="text-meta/70 text-center px-lg mt-xs text-xs">
                Your past flight data and queries will appear here.
              </Text>
            </View>
          }
          renderItem={({ item: chat }) => (
            <View className="flex-row items-center mb-xs">
              <TouchableOpacity
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
                activeOpacity={0.5}
                className="w-10 h-10 items-center justify-center rounded-xl ml-xs bg-red-50 border border-red-100"
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* --- FOOTER: USER CARD --- */}
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

            <TouchableOpacity className="bg-surface p-sm rounded-xl border border-borderDefault">
              <Ionicons name="settings-outline" size={18} color="#0D1A3A" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ChatSideBar;
