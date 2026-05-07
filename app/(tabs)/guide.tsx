import { apiFetch } from "@/utils/apiFetch";
import { useQuery } from "@tanstack/react-query";
import { PlaneTakeoff } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GuideFlightCard = ({ item }: { item: any }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    // onPress={() => router.push(`/(guide)/${item.userFlightId}`)}
    className="bg-white rounded-[32px] p-lg mb-md border border-borderDefault shadow-card"
  >
    <View className="flex-row justify-between items-center mb-md">
      <View className="bg-inputSurface px-md py-xs rounded-full">
        <Text className="text-primaryBrand font-black text-[10px] uppercase tracking-widest">
          {item.flight_number}
        </Text>
      </View>
    </View>

    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-[28px] font-black text-primary leading-tight">
          {item.departureAirport.iata_code}
        </Text>
        <Text className="text-xs font-bold text-meta uppercase tracking-tighter">
          {item.departureAirport.city}
        </Text>
      </View>

      <View className="px-lg items-center">
        <View className="w-10 h-[1px] bg-borderEmphasis mb-1" />
        <PlaneTakeoff size={16} color="#1568C4" />
        <View className="w-10 h-[1px] bg-borderEmphasis mt-1" />
      </View>

      <View className="flex-1 items-end">
        <Text className="text-[28px] font-black text-primary leading-tight">
          {item.arrivalAirport.iata_code}
        </Text>
        <Text className="text-xs font-bold text-meta uppercase tracking-tighter">
          {item.arrivalAirport.city}
        </Text>
      </View>
    </View>

    <View className="mt-lg pt-md border-t border-borderDefault/50 flex-row items-center">
      <Text className="text-[11px] font-black text-nova uppercase tracking-[2px]">
        AI Guide Ready
      </Text>
    </View>
  </TouchableOpacity>
);

export default function GuideScreen() {
  const fetchFlightsWithGuides = async () => {
    const response = await apiFetch("/flight/with-guides", { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch guides");
    const result = await response.json();
    return result.data || [];
  };

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["flightsWithGuides"],
    queryFn: fetchFlightsWithGuides,
  });

  const ListHeader = () => (
    <View className="bg-navtab px-xl pt-xl pb-[60px] rounded-b-[50px] mb-xl shadow-lg">
      <View className="mb-lg">
        <Text className="text-meta font-black text-xs uppercase tracking-[4px] mb-1">
          Intelligence
        </Text>
        <Text className="text-white text-4xl font-black tracking-tighter">
          Travel Guides.
        </Text>
      </View>

      <View className="bg-white/10 p-md rounded-2xl border border-white/5">
        <Text className="text-white/60 text-xs font-medium leading-5">
          Access your personalized, AI-generated itineraries and local insights
          for your upcoming journeys.
        </Text>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-2xl mt-xl">
      <Text className="text-2xl font-black text-primary text-center mb-sm">
        No Guides Found
      </Text>
      <Text className="text-meta text-center text-base mb-xl leading-6">
        You haven't generated any AI guides for your flights yet. Start
        exploring now.
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        className="bg-primaryBrand w-full py-lg rounded-[24px] shadow-lg shadow-primaryBrand/30 flex-row items-center justify-center"
      >
        <Text className="text-white font-black text-base uppercase tracking-widest mr-sm">
          Generate Guide
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#1568C4" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.userFlightId}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="px-xl">
            <GuideFlightCard item={item} />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#0D1A3A"
          />
        }
      />
    </SafeAreaView>
  );
}
