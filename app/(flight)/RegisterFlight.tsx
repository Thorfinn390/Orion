import Ticket from "@/components/Flight/Ticket";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  RegisteredTicket,
  useJourneySimulationStore,
} from "@/stores/useJourneySimulationStore";
import { apiFetch } from "@/utils/apiFetch";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface FlightData {
  id: string;
  flightId?: string;
  checklistItems?: RegisteredTicket["checklistItems"];
  flight: {
    flight_number: string;
    terminal: string | null;
    gate: string | null;
    departureAirport: {
      name: string;
      city: string;
      iata_code: string;
    };
    arrivalAirport: {
      name: string;
      city: string;
      iata_code: string;
    };
  };
}

const PASSCODE_PATTERN = /^[A-Z]{6}\d{3}$/;
const FLIGHT_NUMBER_PATTERN = /^[A-Z0-9]+$/;

const formatFlightNumberInput = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");

const formatPasscodeInput = (value: string) => {
  const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const letters = normalized.replace(/[^A-Z]/g, "").slice(0, 6);
  const numbers = normalized.replace(/\D/g, "").slice(0, 3);

  return `${letters}${numbers}`;
};

const RegisterFlight = () => {
  const queryClient = useQueryClient();
  const [flightNumber, setFlightNumber] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<FlightData | null>(null);

  const fullName = useAuthStore((state) => state.fullName);
  const registerTicket = useJourneySimulationStore(
    (state) => state.registerTicket,
  );

  const toRegisteredTicket = (data: FlightData): RegisteredTicket => ({
    userFlightId: data.id,
    flightId: data.flightId,
    flightNumber: data.flight.flight_number,
    gate: data.flight.gate,
    terminal: data.flight.terminal,
    checklistItems: data.checklistItems,
  });

  const handleRegistration = async () => {
    const normalizedFlightNumber = formatFlightNumberInput(flightNumber);

    if (!FLIGHT_NUMBER_PATTERN.test(normalizedFlightNumber)) {
      Toast.show({
        type: "error",
        text1: "Invalid flight number",
        text2: "Use the airline code and number, e.g. ME201.",
        autoHide: true,
        visibilityTime: 3000,
      });
      return;
    }

    if (!PASSCODE_PATTERN.test(passcode)) {
      Toast.show({
        type: "error",
        text1: "Invalid passcode",
        text2: "Use six letters followed by three numbers, e.g. ABCDEF123.",
        autoHide: true,
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const flightRegObj = {
        flight_number: normalizedFlightNumber,
        passcode,
      };

      const response = await apiFetch("/flight/associate", {
        method: "POST",
        body: JSON.stringify(flightRegObj),
      });

      if (!response.ok) {
        const result = await response.json();

        Toast.show({
          type: "error",
          text1: "Failed to Register",
          text2: result?.message,
          autoHide: true,
          visibilityTime: 3000,
        });

        return;
      }

      const result = await response.json();

      if (result?.data) {
        setTicketData(result.data);
        registerTicket(toRegisteredTicket(result.data));
        queryClient.invalidateQueries({ queryKey: ["homeRegisteredFlights"] });
        queryClient.invalidateQueries({ queryKey: ["userFlights"] });
        setShowTicket(true);
        setFlightNumber("");
        setPasscode("");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* --- INTEGRATED DARK HEADER --- */}
        <View className="bg-navtab px-xl pt-md pb-xl rounded-b-[40px] shadow-lg">
          <View className="flex-row items-center justify-between mb-lg">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-activeflight border border-white/10"
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <View className="bg-activeflight/40 px-sm py-xs rounded-full border border-white/5">
              <Text className="text-highlights text-[10px] font-black uppercase tracking-widest">
                Your Ticket
              </Text>
            </View>
          </View>

          <View className="px-1">
            <Text className="text-[12px] font-black text-meta uppercase tracking-[3px] mb-1">
              Hey {fullName},
            </Text>
            <Text className="text-4xl font-black text-white tracking-tight">
              Register.
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="px-xl -mt-8"
        >
          {/* --- FORM CARD --- */}
          <View className="bg-white p-lg rounded-[32px] shadow-card border border-borderDefault">
            <View className="flex-row items-center mb-lg">
              <View className="w-12 h-12 bg-primaryBrand rounded-2xl items-center justify-center shadow-md rotate-3">
                <Ionicons
                  name="airplane"
                  size={24}
                  color="white"
                  className="-rotate-3"
                />
              </View>
              <View className="ml-md flex-1">
                <Text className="text-primary font-bold text-base">
                  New Flight Sync
                </Text>
                <Text className="text-meta text-xs">
                  Ready for your next journey?
                </Text>
              </View>
            </View>

            {/* Flight Number Input */}
            <View className="mb-lg">
              <Text className="text-navtab text-xs font-black uppercase tracking-widest mb-sm ml-xs">
                Flight Number
              </Text>
              <View className="flex-row items-center bg-inputSurface rounded-2xl px-md border border-borderEmphasis h-14">
                <Ionicons name="barcode-outline" size={20} color="#1568C4" />
                <TextInput
                  placeholder="e.g. ME201"
                  placeholderTextColor="#7B8BAA"
                  value={flightNumber}
                  onChangeText={(value) =>
                    setFlightNumber(formatFlightNumberInput(value))
                  }
                  autoCapitalize="characters"
                  autoCorrect={false}
                  className="flex-1 text-navtab font-bold ml-sm text-base"
                />
              </View>
            </View>

            {/* Passcode Input */}
            <View className="mb-sm">
              <Text className="text-navtab text-xs font-black uppercase tracking-widest mb-sm ml-xs">
                Access Passcode
              </Text>
              <View className="flex-row items-center bg-inputSurface rounded-2xl px-md border border-borderEmphasis h-14">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#1568C4"
                />
                <TextInput
                  placeholder="ABCDEF123"
                  placeholderTextColor="#7B8BAA"
                  value={passcode}
                  onChangeText={(value) =>
                    setPasscode(formatPasscodeInput(value))
                  }
                  secureTextEntry
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={9}
                  className="flex-1 text-navtab font-bold ml-sm text-base"
                />
              </View>
            </View>
          </View>

          {/* --- SUBMIT ACTION --- */}
          <View className="mt-xl">
            <TouchableOpacity
              onPress={handleRegistration}
              activeOpacity={0.8}
              className="bg-navtab h-16 rounded-[24px] flex-row items-center justify-center shadow-lg border border-white/10"
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-lg font-black uppercase tracking-widest mr-sm">
                  Register Ticket
                </Text>
              )}
            </TouchableOpacity>

            <View className="items-center mt-lg">
              <Text className="text-meta text-[10px] font-bold uppercase tracking-widest">
                Start Your Journey Here!
              </Text>
            </View>
          </View>
        </ScrollView>

        {showTicket && (
          <Ticket
            onClose={() => {
              setShowTicket(false);
            }}
            data={ticketData as FlightData}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterFlight;
