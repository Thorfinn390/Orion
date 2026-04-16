import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock data for the chats
const chatHistory = [
  { id: "1", title: "Flight AA 2847 Status" },
  { id: "2", title: "Trip to Paris Planning" },
  { id: "3", title: "Lost Luggage Inquiry" },
  { id: "4", title: "Hotel Bookings NYC" },
  { id: "5", title: "Dinner Reservations" },
];

const ChatSideBar = ({
  changeSideBarStatus,
}: {
  changeSideBarStatus: (status: boolean) => void;
}) => {
  const insets = useSafeAreaInsets();

  const handleNewChat = () => {
    changeSideBarStatus(false);
  };

  return (
    /* Added fixed width here: w-[300px] */
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 bg-navtab border-r border-white/5 w-[300px] z-10 absolute top-0 bottom-0 left-0"
    >
      {/* --- TOP ACTION BAR --- */}
      <View className="px-md pt-xl pb-md flex-row items-center gap-sm">
        {/* BACK BUTTON */}
        <TouchableOpacity
          onPress={() => {
            changeSideBarStatus(false);
          }}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-activeflight items-center justify-center"
        >
          <Ionicons name="menu-outline" size={24} color="#fff" />
        </TouchableOpacity>

        {/* NEW CHAT BUTTON */}
        <TouchableOpacity
          onPress={handleNewChat}
          activeOpacity={0.8}
          className="flex-1 flex-row items-center justify-center bg-nova h-12 rounded-xl shadow-md"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-bold ml-xs">New Chat</Text>
        </TouchableOpacity>
      </View>

      {/* --- SEARCH INPUT --- */}
      <View className="px-md mb-lg">
        <View className="flex-row items-center bg-activeflight px-sm rounded-lg border border-white/10">
          <Ionicons name="search-outline" size={18} color="#7B8BAA" />
          <TextInput
            placeholder="Search chats..."
            placeholderTextColor="#7B8BAA"
            className="flex-1 text-white text-sm py-sm ml-xs"
          />
        </View>
      </View>

      {/* --- CHATS HEADER --- */}
      <View className="px-md mb-sm flex-row items-center justify-between">
        <Text className="text-meta text-xs font-black uppercase tracking-widest">
          Recent Chats
        </Text>
        <View className="h-[1px] flex-1 bg-white/10 ml-md" />
      </View>

      {/* --- CHAT LIST --- */}
      <ScrollView
        className="flex-1 px-sm"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {chatHistory.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-md mb-xs rounded-xl bg-activeflight/30 border border-transparent"
          >
            <View className="flex-row items-center flex-1 mr-sm">
              <Text
                className="text-white/80 text-sm ml-sm font-medium"
                numberOfLines={1}
              >
                {chat.title}
              </Text>
            </View>

            {/* DELETE BUTTON */}
            <TouchableOpacity
              onPress={() => console.log("Delete chat", chat.id)}
              className="w-8 h-8 items-center justify-center rounded-lg bg-statusUL/10"
            >
              <Ionicons name="trash-outline" size={16} color="#C84B4B" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* --- FOOTER: USER PROFILE --- */}
      <View className="p-md border-t border-white/5 bg-activeflight/20">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-nova items-center justify-center border border-white/20">
              <Text className="text-white text-xs font-black">JD</Text>
            </View>
            <View className="ml-sm">
              <Text className="text-white text-xs font-bold">John Doe</Text>
              <Text className="text-meta text-[10px] font-medium">
                Premium Member
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={20} color="#7B8BAA" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ChatSideBar;
