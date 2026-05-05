import {
  RegisteredTicket,
  useJourneySimulationStore,
} from "@/stores/useJourneySimulationStore";
import { TicketSimulationService } from "@/utils/TicketSimulationService";
import { apiFetch } from "@/utils/apiFetch";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Bell, Search, Ticket } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JourneyChecklist } from "../../components/JourneyChecklist";
import { NovaAvatar } from "../../components/NovaAvatar";
import { ServicesGrid } from "../../components/ServicesGrid";
import { HomeTicketFlight, TicketCard } from "../../components/TicketCard";
import {
  getAuthIdentityFromJwt,
  useAuthStore,
} from "../../stores/useAuthStore";

type FlightApiResponse = {
  status?: boolean;
  data?: (HomeTicketFlight & {
    checklistItems?: RegisteredTicket["checklistItems"];
  })[];
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);

  const fullName = useAuthStore((state) => state.fullName);
  const email = useAuthStore((state) => state.email);
  const accessToken = useAuthStore((state) => state.accessToken);
  const registeredTicket = useJourneySimulationStore(
    (state) => state.registeredTicket,
  );
  const registerTicket = useJourneySimulationStore(
    (state) => state.registerTicket,
  );
  const welcomeName = useMemo(() => {
    const jwtIdentity = getAuthIdentityFromJwt(accessToken);
    const trimmedName = fullName?.trim();
    if (trimmedName) {
      return trimmedName;
    }

    if (jwtIdentity.fullName) {
      return jwtIdentity.fullName;
    }

    const emailName = email?.split("@")[0]?.trim();
    const jwtEmailName = jwtIdentity.email?.split("@")[0]?.trim();
    return emailName || jwtEmailName || "traveler";
  }, [accessToken, email, fullName]);

  const fetchFlights = async () => {
    const response = await apiFetch("/flight", { method: "GET" });
    const result = (await response.json()) as FlightApiResponse;

    if (!response.ok || !result?.status) {
      throw new Error("Failed to load registered tickets");
    }

    return result.data ?? [];
  };

  const { data: registeredFlights = [], isLoading: isTicketLoading } = useQuery({
    queryKey: ["homeRegisteredFlights"],
    queryFn: fetchFlights,
    refetchInterval: 30000,
  });

  const currentTicket = useMemo(() => {
    if (registeredFlights.length === 0) {
      return null;
    }

    return (
      registeredFlights.find(
        (flight) => flight.userFlightId === registeredTicket?.userFlightId,
      ) ?? registeredFlights[0]
    );
  }, [registeredFlights, registeredTicket?.userFlightId]);

  useEffect(() => {
    if (!currentTicket) {
      return;
    }

    const ticket = {
      userFlightId: currentTicket.userFlightId,
      flightId: currentTicket.id,
      flightNumber: currentTicket.flight_number,
      gate: currentTicket.gate,
      terminal: currentTicket.terminal,
      checklistItems: currentTicket.checklistItems,
    };

    registerTicket(ticket);
  }, [currentTicket, registerTicket]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  const openFullDetails = () => {
    router.push({
      pathname: "/(flight)/JourneyChecklist",
    } as never);
  };

  const handleStartJourney = () => {
    if (!currentTicket) {
      router.push("/(flight)/RegisterFlight");
      return;
    }

    TicketSimulationService.startJourney({
      userFlightId: currentTicket.userFlightId,
      flightId: currentTicket.id,
      flightNumber: currentTicket.flight_number,
      gate: currentTicket.gate,
      terminal: currentTicket.terminal,
      checklistItems: currentTicket.checklistItems,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mt-8 mb-8">
          <View>
            <Text className="text-3xl font-black text-slate-900">Voyager</Text>
            <Text className="text-slate-500 text-sm font-medium">
              Welcome back, {welcomeName}!
            </Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => Alert.alert("Search", "Opening search...")}
              className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center"
            >
              <Search size={20} color="#475569" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Notifications", "You have 1 new alert.")
              }
              className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center relative"
            >
              <Bell size={20} color="#475569" />
              <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Insight Box */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "SkyGuide AI",
              "Terminal 3 is busy. Opening navigation map...",
            )
          }
          className="bg-white border border-indigo-50 p-4 rounded-[30px] shadow-sm flex-row items-start gap-4 mb-8"
        >
          <NovaAvatar size={42} />
          <View className="flex-1">
            <Text className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
              SkyGuide AI
            </Text>
            <Text className="text-sm text-slate-700 italic leading-5">
              {currentTicket
                ? `Your flight ${currentTicket.flight_number} is ${currentTicket.status?.toLowerCase() ?? "registered"}. Keep the checklist in order and head to ${currentTicket.gate ? `Gate ${currentTicket.gate}` : "your gate"} when prompted.`
                : "Register a ticket to unlock live journey guidance and AR check-in."}
            </Text>
          </View>
        </TouchableOpacity>

        {isTicketLoading ? (
          <View className="bg-white rounded-[32px] w-full shadow-xl my-3 border border-slate-100 p-8 items-center">
            <ActivityIndicator size="small" color="#4f46e5" />
            <Text className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-widest">
              Loading ticket
            </Text>
          </View>
        ) : currentTicket ? (
          <TicketCard
            flight={currentTicket}
            passengerName={welcomeName}
            onStartJourney={handleStartJourney}
          />
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/(flight)/RegisterFlight")}
            activeOpacity={0.85}
            className="bg-white rounded-[32px] w-full shadow-xl my-3 border border-slate-100 p-6"
          >
            <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mb-4">
              <Ticket size={24} color="#4f46e5" />
            </View>
            <Text className="text-xl font-black text-slate-900">
              No registered ticket
            </Text>
            <Text className="text-sm text-slate-500 mt-2 leading-5">
              Register your flight to generate your boarding card and journey
              checklist.
            </Text>
          </TouchableOpacity>
        )}

        {currentTicket ? (
          <>
            <View className="mt-10 mb-6 flex-row justify-between items-end">
              <Text className="text-2xl font-black text-slate-900">
                Your Journey
              </Text>
              <TouchableOpacity onPress={openFullDetails}>
                <Text className="text-xs font-bold text-indigo-600">
                  Full Details
                </Text>
              </TouchableOpacity>
            </View>
            <JourneyChecklist />
          </>
        ) : null}

        <ServicesGrid />
      </ScrollView>
    </SafeAreaView>
  );
}
