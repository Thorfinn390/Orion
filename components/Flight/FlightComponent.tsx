import { useJourneySimulationStore } from "@/stores/useJourneySimulationStore";
import { apiFetch } from "@/utils/apiFetch";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface FlightProps {
  data: any;
}

export default function FlightComponent({ data }: FlightProps) {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const registerTicket = useJourneySimulationStore(
    (state) => state.registerTicket,
  );
  const startTicketSimulation = useJourneySimulationStore(
    (state) => state.startTicketSimulation,
  );

  const mutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiFetch(`/flight/cancel/${data.userFlightId}`, {
        method: "DELETE",
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete");
      }
      return result;
    },
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Flight removed successfully" });
      setModalVisible(false);
      setPassword("");
      queryClient.invalidateQueries({ queryKey: ["userFlights"] });
      queryClient.invalidateQueries({ queryKey: ["homeRegisteredFlights"] });
    },
    onError: (error: any) => {
      Toast.show({ type: "error", text1: "Error", text2: error.message });
    },
  });

  const handleSimulation = () => {
    const registeredTicket = {
      userFlightId: data.userFlightId,
      flightId: data.id,
      flightNumber: data.flight_number,
      gate: data.gate,
      terminal: data.terminal,
      checklistItems: data.checklistItems,
    };

    registerTicket(registeredTicket);
    startTicketSimulation(registeredTicket);
    router.push({
      pathname: "/(tabs)/map",
      params: {
        mode: "journey",
        userFlightId: data.userFlightId,
        flightNumber: data.flight_number,
      },
    });
  };

  return (
    <View className="bg-white p-lg rounded-[32px] border border-borderDefault mb-lg shadow-sm">
      {/* Flight Info Header */}
      <View className="flex-row justify-between items-start mb-md">
        <View>
          <Text className="text-meta text-[10px] font-black uppercase tracking-widest">
            Flight
          </Text>
          <Text className="text-xl font-black text-navtab">
            {data.flight_number}
          </Text>
        </View>
        <View className="bg-primaryBrand/10 px-md py-xs rounded-full">
          <Text className="text-primaryBrand text-[10px] font-black uppercase">
            {data.status}
          </Text>
        </View>
      </View>

      {/* Route Display */}
      <View className="flex-row justify-between items-center py-lg border-y border-borderDefault/30 mb-md">
        <View className="flex-1">
          <Text className="text-3xl font-black text-primary">
            {data.departureAirport.iata_code}
          </Text>
          <Text className="text-xs font-bold text-meta uppercase">
            {data.departureAirport.city}
          </Text>
        </View>
        <Ionicons name="airplane" size={20} color="#1568C4" />
        <View className="flex-1 items-end">
          <Text className="text-3xl font-black text-primary">
            {data.arrivalAirport.iata_code}
          </Text>
          <Text className="text-xs font-bold text-meta uppercase">
            {data.arrivalAirport.city}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-md pt-sm">
        <TouchableOpacity
          onPress={handleSimulation}
          className="flex-1 flex-row items-center justify-center py-md bg-primaryBrand rounded-2xl"
        >
          <Ionicons name="navigate" size={16} color="white" />
          <Text className="text-white font-black text-xs uppercase tracking-widest ml-xs">
            Simulate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-1 flex-row items-center justify-center py-md bg-red-50 rounded-2xl"
        >
          <Ionicons name="trash-outline" size={16} color="#C84B4B" />
          <Text className="text-red-600 font-bold text-xs uppercase tracking-widest ml-xs">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cancellation Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center px-xl">
          {/* Blur Background */}
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod="dimezisBlurView"
          />

          {/* Modal Content */}
          <View className="bg-white w-full p-xl rounded-[40px] shadow-2xl items-center">
            <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-lg">
              <Ionicons name="alert-circle" size={32} color="#C84B4B" />
            </View>

            <Text className="text-2xl font-black text-primary mb-sm text-center">
              Confirm Action
            </Text>
            <Text className="text-meta font-medium mb-xl text-center leading-5">
              To cancel flight{" "}
              <Text className="font-bold text-primary">
                {data.flight_number}
              </Text>
              , please enter your password.
            </Text>

            <View className="w-full mb-xl">
              <TextInput
                placeholder="Account Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#7B8BAA"
                className="bg-inputSurface p-lg rounded-2xl border border-borderEmphasis font-bold text-primary"
              />
            </View>

            <View className="flex-row gap-md w-full">
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setPassword("");
                }}
                className="flex-1 py-lg items-center bg-surface rounded-2xl"
              >
                <Text className="font-black text-meta uppercase tracking-widest text-xs">
                  Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => mutation.mutate(password)}
                disabled={mutation.isPending || !password}
                className={`flex-2 py-lg rounded-2xl items-center shadow-lg ${
                  mutation.isPending || !password ? "bg-red-300" : "bg-red-600"
                }`}
              >
                {mutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white px-5 font-black uppercase tracking-widest text-xs">
                    Confirm
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
