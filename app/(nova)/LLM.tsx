import ChatSideBar from "@/components/AI/ChatSideBar";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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
  const insets = useSafeAreaInsets();

  const changeSideBarStatus = (status: boolean) => {
    setChatsOpened(status);
  };

  return (
    <SafeAreaView className="flex-1 bg-navtab relative">
      <MotiView
        animate={{ translateX: chatsOpened ? 0 : -300 }}
        transition={{ type: "timing", duration: 200 }}
        className="z-10 absolute top-0 bottom-0 left-0"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <ChatSideBar changeSideBarStatus={changeSideBarStatus} />
      </MotiView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        // If the input is still hidden on Android, try setting this to 60-90
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* --- HEADER --- */}
        <View className="px-md py-sm flex-row items-center justify-between border-b border-white/5">
          <TouchableOpacity
            onPress={() => {
              setChatsOpened(true);
            }}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-activeflight items-center justify-center"
          >
            <Ionicons name="menu-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <Text className="text-lg font-bold text-white tracking-tight">
            Nova
          </Text>

          {/* --- ACTION GROUP (Right) --- */}
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.replace("/(tabs)")}
              className="w-10 h-10 rounded-full bg-activeflight items-center justify-center"
            >
              <Ionicons name="home-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- CHAT AREA --- */}
        <ScrollView
          className="flex-1 px-md"
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* AI Message */}
          <View className="mb-lg max-w-[85%]">
            <View className="bg-activeflight px-md py-sm rounded-xl rounded-tl-sm border border-white/5">
              <Text className="text-white/90 text-base leading-6">
                Hello! I am Nova, your flight assistant. I can help with flight
                details, schedule changes, or airport info. How can I help you
                today?
              </Text>
            </View>
            <Text className="text-meta text-xs mt-xs ml-1 font-medium">
              Just now
            </Text>
          </View>

          {/* User Message */}
          <View className="mb-lg max-w-[85%] self-end">
            <View className="bg-primaryBrand px-md py-sm rounded-xl rounded-tr-sm shadow-sm">
              <Text className="text-white text-base leading-6">
                Can you check my flight status for tomorrow morning?
              </Text>
            </View>
            <Text className="text-meta text-xs mt-xs mr-1 text-right font-medium">
              12:45 PM
            </Text>
          </View>

          {/* AI Response */}
          <View className="mb-lg max-w-[85%]">
            <View className="bg-activeflight px-md py-sm rounded-xl rounded-tl-sm border border-white/5">
              <Text className="text-white/90 text-base leading-6">
                Of course! I found your flight:{"\n\n"}
                <Text className="font-bold text-white uppercase tracking-wider text-sm">
                  Flight AA 2847
                </Text>
                {"\n"}
                Los Angeles to New York{"\n"}
                Departure: 7:30 AM{"\n\n"}
                Status: <Text className="text-statusD font-bold">On Time</Text>
              </Text>
            </View>
            <Text className="text-meta text-xs mt-xs ml-1 font-medium">
              Just now
            </Text>
          </View>
        </ScrollView>

        {/* --- INPUT AREA --- */}
        <View className="px-md pb-sm pt-sm border-t border-white/10 bg-navtab">
          <View className="flex-row items-end bg-activeflight rounded-2xl px-md py-xs border border-white/10">
            <TextInput
              placeholder="Message Nova..."
              placeholderTextColor="#7B8BAA"
              className="flex-1 text-white text-base py-sm max-h-24"
              multiline
              textAlignVertical="center"
            />
            <TouchableOpacity
              activeOpacity={0.8}
              className="ml-sm bg-primaryBrand w-10 h-10 rounded-full items-center justify-center mb-0.5 shadow-md"
            >
              <Ionicons name="arrow-up" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {chatsOpened && (
        <BlurView
          style={styles.blurOverlay}
          intensity={40}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,

    // shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,

    // Android
    elevation: 15,
  },

  blurOverlay: {
    flex: 1,
    margin: 2,
    borderRadius: 24,
    overflow: "hidden",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },

  text: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
});

export default LLM;
