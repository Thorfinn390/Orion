import FlightComponent from "@/components/Flight/FlightComponent";
import { apiFetch } from "@/utils/apiFetch";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function YourFlights() {
  const fetchFlights = async () => {
    const response = await apiFetch("/flight", { method: "GET" });

    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();

    console.log(result.data);
    return result.data || [];
  };

  const {
    data: flights = [],
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["userFlights"],
    queryFn: fetchFlights,
    refetchInterval: 30000,
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const ListEmptyComponent = () => (
    <View className="items-center mt-2xl px-xl">
      <View className="w-20 h-20 bg-inputSurface rounded-full items-center justify-center mb-md">
        <Ionicons name="airplane-outline" size={40} color="#7B8BAA" />
      </View>
      <Text className="text-primary font-bold text-lg">No Flights Found</Text>
      <Text className="text-meta text-center mb-lg">
        You have not registered any flights yet.
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(flight)/RegisterFlight")}
        className="bg-navtab px-xl py-md rounded-2xl"
      >
        <Text className="text-white font-black uppercase tracking-widest text-xs">
          Register Now
        </Text>
      </TouchableOpacity>
    </View>
  );

  const ListHeaderComponent = () => (
    <View className="bg-navtab px-xl pt-md pb-xl rounded-b-[40px] shadow-lg mb-xl">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 items-center justify-center rounded-full bg-activeflight border border-white/10 mb-lg"
      >
        <Ionicons name="chevron-back" size={24} color="white" />
      </TouchableOpacity>
      <Text className="text-[12px] font-black text-meta uppercase tracking-[3px] mb-1">
        Travel History
      </Text>
      <Text className="text-4xl font-black text-white tracking-tight">
        Your Flights.
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <FlatList
        data={flights}
        keyExtractor={(item) => item.userFlightId}
        renderItem={({ item }) => (
          <View className="px-xl">
            <FlightComponent data={item} />
          </View>
        )}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={!isLoading ? ListEmptyComponent : null}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor="#1568C4"
          />
        }
        ListFooterComponent={
          isLoading && !isRefetching ? (
            <ActivityIndicator size="large" color="#1568C4" className="mt-xl" />
          ) : error ? (
            <View className="items-center mt-xl px-xl">
              <Text className="text-red-500 font-bold text-center">
                Failed to load flights.
              </Text>
              <TouchableOpacity onPress={() => refetch()} className="mt-md">
                <Text className="text-primaryBrand font-bold">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
