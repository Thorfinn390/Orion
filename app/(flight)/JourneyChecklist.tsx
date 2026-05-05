import { JourneyChecklist } from "@/components/JourneyChecklist";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JourneyChecklistScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        className="flex-1 px-xl"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
      >
        <View className="bg-navtab rounded-b-[40px] -mx-xl px-xl pt-md pb-xl">
          <View className="flex-row items-center justify-between mb-xl">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-activeflight border border-white/10"
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-[12px] font-black text-meta uppercase tracking-[3px] mb-1">
            Flight Guide
          </Text>
          <Text className="text-4xl font-black text-white tracking-tight">
            Journey Checklist.
          </Text>
        </View>

        <JourneyChecklist />
      </ScrollView>
    </SafeAreaView>
  );
}
