import ChatSideBar from "@/components/AI/ChatSideBar";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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

const LLM = () => {
  const [chatsOpened, setChatsOpened] = useState(false);
  const [message, setMessage] = useState("");
  const insets = useSafeAreaInsets();

  const changeSideBarStatus = (status: boolean) => {
    setChatsOpened(status);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface relative">
      {/* --- SIDEBAR OVERLAY --- */}
      <MotiView
        animate={{ translateX: chatsOpened ? 0 : -320 }}
        transition={{ type: "timing", duration: 250 }}
        className="z-30 absolute top-0 bottom-0 left-0 w-[80%]"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <ChatSideBar changeSideBarStatus={changeSideBarStatus} />
      </MotiView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* --- HEADER --- 
            Maintained bg-surface but added border-b and shadow-sm for the "split" 
        */}
        <View className="px-md py-sm flex-row items-center justify-between bg-surface border-b border-borderDefault shadow-sm">
          <TouchableOpacity
            onPress={() => setChatsOpened(true)}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full items-center justify-center"
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
            activeOpacity={0.7}
            onPress={() => router.replace("/(tabs)")}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <Ionicons name="home-outline" size={24} color="#0D1A3A" />
          </TouchableOpacity>
        </View>

        {/* --- CHAT AREA --- */}
        <ScrollView
          className="flex-1 px-md"
          contentContainerStyle={{ paddingVertical: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Nova Welcome */}
          <View className="mb-lg max-w-[85%] flex-row">
            <View className="bg-white px-md py-sm rounded-2xl rounded-tl-none border border-borderDefault shadow-sm">
              <Text className="text-secondary font-bold text-xs mb-xs text-nova uppercase">
                Nova Assistant
              </Text>
              <Text className="text-primary text-base leading-6">
                Hello! I am Nova. I can track your flights, check terminal info,
                or update you on delays. How can I assist your journey?
              </Text>
            </View>
          </View>

          {/* User Message */}
          <View className="mb-lg max-w-[80%] self-end">
            <View className="bg-primaryBrand px-md py-sm rounded-2xl rounded-tr-none shadow-md">
              <Text className="text-white text-base leading-6">
                Status of MEA 204 from Beirut?
              </Text>
            </View>
            <Text className="text-meta text-[10px] mt-xs mr-1 text-right font-bold uppercase">
              Sent • 4:36 PM
            </Text>
          </View>

          {/* AI Response Card Style */}
          <View className="mb-lg max-w-[90%]">
            <View className="bg-white rounded-2xl border-l-4 border-nova shadow-card overflow-hidden">
              <View className="p-md">
                <View className="flex-row justify-between items-center mb-sm">
                  <Text className="text-secondary font-bold text-xs uppercase tracking-widest">
                    Flight Update
                  </Text>
                  <View className="bg-statusI px-sm py-xs rounded-full">
                    <Text className="text-primaryBrand font-bold text-[10px]">
                      REAL-TIME
                    </Text>
                  </View>
                </View>

                <Text className="text-primary text-base leading-6 mb-md">
                  I have retrieved the latest for
                  <Text className="font-bold text-primaryBrand"> MEA 204</Text>:
                </Text>

                <View className="bg-surface p-sm rounded-lg border border-borderDefault mb-sm">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xl font-bold text-primary">
                      BEY → LHR
                    </Text>
                    <Text className="text-statusD font-bold">ON TIME</Text>
                  </View>
                  <Text className="text-meta text-xs">
                    Scheduled Departure: 08:10 AM
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* --- INPUT AREA --- */}
        <View className="px-md pb-lg pt-sm bg-white border-t border-borderDefault">
          <View className="flex-row items-center bg-inputSurface rounded-2xl px-md py-xs border border-borderEmphasis">
            <TextInput
              placeholder="Ask about a flight..."
              placeholderTextColor="#7B8BAA"
              value={message}
              onChangeText={setMessage}
              className="flex-1 text-primary text-base py-sm"
              multiline
            />
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!message.trim()}
              className={`ml-sm w-10 h-10 rounded-xl items-center justify-center ${
                message.trim() ? "bg-nova" : "bg-meta/30"
              }`}
            >
              <Ionicons name="paper-plane" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-center text-[10px] text-meta mt-sm font-medium uppercase tracking-tighter">
            Nova Flight Intelligence • Orion v1.0
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* --- DRAWER OVERLAY --- */}
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
            />
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 bg-navtab/40"
            />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LLM;
