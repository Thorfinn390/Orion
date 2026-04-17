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

// Mock data (Keep this or replace with real data from your backend)
const chatHistory = [
  { id: "1", title: "Flight MEA 204 Status" },
  { id: "2", title: "Trip to Paris Planning" },
  { id: "3", title: "Lost Luggage Inquiry" },
  { id: "4", title: "Heathrow Connection Info" },
];

const ChatSideBar = ({
  changeSideBarStatus,
}: {
  changeSideBarStatus: (status: boolean) => void;
}) => {
  const insets = useSafeAreaInsets();

  const handleNewChat = () => {
    changeSideBarStatus(false);
    // Add logic here to router.push to a fresh chat ID
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 bg-navtab border-r border-white/10 w-[300px]"
    >
      {/* --- BRANDING & ACTION --- */}
      <View className="px-md pt-lg pb-md">
        <View className="flex-row items-center mb-md ml-xs">
          <View className="w-6 h-6 bg-nova rounded-md items-center justify-center mr-sm shadow-sm">
            <Ionicons name="airplane" size={14} color="white" />
          </View>
          <Text className="text-white font-black tracking-widest text-sm uppercase">
            Orion Logic
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleNewChat}
          activeOpacity={0.8}
          className="flex-row items-center justify-center bg-nova h-12 rounded-xl shadow-lg border border-white/10"
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text className="text-white font-bold ml-sm text-base">
            New Flight Chat
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- SEARCH --- */}
      <View className="px-md mb-lg">
        <View className="flex-row items-center bg-activeflight/50 px-md rounded-xl border border-white/5">
          <Ionicons name="search" size={16} color="#7B8BAA" />
          <TextInput
            placeholder="Find a conversation..."
            placeholderTextColor="#7B8BAA"
            className="flex-1 text-white text-sm py-sm ml-sm"
          />
        </View>
      </View>

      {/* --- LIST HEADER --- */}
      <View className="px-md mb-sm flex-row items-center">
        <Text className="text-meta text-[10px] font-black uppercase tracking-[2px]">
          Mission Log
        </Text>
        <View className="h-[1px] flex-1 bg-white/5 ml-md" />
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
            className="flex-row items-center justify-between p-md mb-xs rounded-xl bg-transparent border border-transparent hover:bg-activeflight/20"
          >
            <View className="flex-row items-center flex-1 mr-sm">
              <View className="w-2 h-2 rounded-full bg-meta/30 mr-md" />
              <Text
                className="text-meta text-sm font-semibold"
                numberOfLines={1}
              >
                {chat.title}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => console.log("Delete", chat.id)}
              className="w-7 h-7 items-center justify-center rounded-lg hover:bg-statusUL/20"
            >
              <Ionicons name="ellipsis-vertical" size={14} color="#3A4863" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* --- FOOTER: USER CARD --- */}
      <View className="mx-md mb-md p-md rounded-2xl bg-activeflight border border-white/5 shadow-card">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-primaryBrand items-center justify-center border-2 border-activeflight shadow-sm">
              <Text className="text-white text-xs font-black">JD</Text>
            </View>
            <View className="ml-md">
              <Text className="text-white text-xs font-bold">John Doe</Text>
              <View className="flex-row items-center">
                <View className="w-1.5 h-1.5 rounded-full bg-statusD mr-xs" />
                <Text className="text-meta text-[10px] font-bold uppercase tracking-tighter">
                  Verified Flyer
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity className="bg-white/5 p-sm rounded-lg">
            <Ionicons name="settings-sharp" size={16} color="#7B8BAA" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ChatSideBar;
