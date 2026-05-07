import Ticket from "@/components/Flight/Ticket";
import { apiFetch } from "@/utils/apiFetch";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlanMyJourney() {
  const { id } = useLocalSearchParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["flight", id],
    queryFn: async () => {
      const response = await apiFetch(`/flight/${id}`, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch flight");
      const result = await response.json();
      return result.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#1568C4" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 bg-surface items-center justify-center p-xl">
        <Text className="text-primary font-black text-xl">
          Flight not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-md bg-primaryBrand px-lg py-sm rounded-full"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* --- CUSTOM HEADER --- */}
        <View className="bg-navtab px-xl pt-lg pb-xl rounded-b-[40px] mb-lg shadow-lg">
          <View className="flex-row items-center justify-between mb-md">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <View className="bg-nova/20 px-4 py-1 rounded-full border border-nova/30">
              <Text className="text-nova font-black text-[10px] uppercase tracking-widest">
                Journey ID: {id?.toString().slice(0, 8)}...
              </Text>
            </View>
          </View>

          <Text className="text-meta font-black text-xs uppercase tracking-[4px] mb-1">
            Flight Details
          </Text>
          <Text className="text-white text-3xl font-black tracking-tighter">
            Generate Guide.
          </Text>
        </View>

        {/* --- TICKET DISPLAY --- */}
        <View className="px-md">
          {/* 
              Mapping the API response to the TicketProps structure 
              data here contains: flight_number, terminal, gate, departureAirport, arrivalAirport 
          */}
          <Ticket data={{ flight: data }} onClose={() => router.back()} />
        </View>

        {/* Placeholder for future Guide Generation Actions */}
        <View className="p-xl">
          <Text className="text-meta text-center text-xs font-bold uppercase tracking-widest opacity-50">
            Scroll down for more insights
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
