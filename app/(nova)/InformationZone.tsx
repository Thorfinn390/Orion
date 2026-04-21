import { apiFetch } from "@/utils/apiFetch";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, MotiView } from "moti";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FAQItem {
  id: string;
  category: string;
  question_text: string;
  answer_text: string;
}

function FAQCard({ item }: { item: FAQItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="bg-white border-b border-black/5 overflow-hidden">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
        className="p-8"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-nova mr-2" />
              <Text className="text-textMuted text-[10px] font-black tracking-widest uppercase">
                {item.category}
              </Text>
            </View>
            <Text className="text-textPrimary text-xl font-bold tracking-tight">
              {item.question_text}
            </Text>
          </View>

          <MotiView
            animate={{
              rotate: expanded ? "45deg" : "0deg",
              scale: expanded ? [1, 1.2, 1] : 1,
              backgroundColor: expanded ? "#F0F4FF" : "#FFFFFF",
            }}
            transition={{ type: "timing", duration: 200 }}
            className="w-11 h-11 rounded-2xl items-center justify-center border border-borderDefault"
          >
            <Ionicons
              name="add"
              size={24}
              color={expanded ? "#7B5FE8" : "#0D1A3A"}
            />
          </MotiView>
        </View>

        <AnimatePresence>
          {expanded && (
            <MotiView
              from={{ opacity: 0, scale: 0.9, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: "auto" }}
              exit={{ opacity: 0, scale: 0.9, height: 0 }}
              transition={{ type: "timing", duration: 200 }}
            >
              <View className="mt-6 pt-6 border-t border-black/5">
                <Text className="text-textSecondary text-base leading-7 font-medium">
                  {item.answer_text}
                </Text>
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </TouchableOpacity>
    </View>
  );
}

export default function InformationZone() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const response = await apiFetch("/users/faq");
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Failed to fetch");
      return json.data as FAQItem[];
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color="#7B5FE8" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-surface justify-center items-center p-8">
        <Text className="text-red-500 text-center font-bold">
          Error loading Knowledge Vault
        </Text>
        <TouchableOpacity onPress={() => refetch()} className="mt-4">
          <Text className="text-nova font-bold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="px-8 pt-24 pb-12">
        <Text className="text-nova text-xs font-black tracking-[4px] uppercase mb-1 opacity-60">
          Vault
        </Text>
        <Text className="text-textPrimary text-5xl font-black tracking-tighter">
          Knowledge
        </Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FAQCard item={item} />}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#7B5FE8"
          />
        }
      />
    </View>
  );
}
