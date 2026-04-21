import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

export interface TicketProps {
  data: {
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
  };
  onClose?: () => void;
}

const Ticket = ({ data, onClose }: TicketProps) => {
  const { flight } = data;

  return (
    <View className="my-4 self-center" style={{ width: width * 0.9 }}>
      {/* Close Button Layer */}
      <View className="absolute right-2 -top-2 z-50">
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          className="bg-textPrimary w-8 h-8 rounded-full items-center justify-center shadow-lg border-2 border-white"
        >
          <Ionicons name="close" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Top Section */}
      <View className="bg-white rounded-t-3xl p-6 border-x border-t border-black/5">
        <View className="flex-row justify-between items-center mb-6 pr-6">
          {/* Added padding right to prevent overlap with button if needed */}
          <View className="bg-nova/10 px-3 py-1 rounded-full">
            <Text className="text-nova font-black text-xs uppercase tracking-widest">
              {flight.flight_number}
            </Text>
          </View>
          <Text className="text-textMuted text-[10px] font-black uppercase tracking-widest">
            Boarding Pass
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-textPrimary text-4xl font-black leading-none">
              {flight.departureAirport.iata_code}
            </Text>
            <Text className="text-textMuted text-[10px] font-bold uppercase mt-1">
              {flight.departureAirport.city}
            </Text>
          </View>

          <View className="items-center flex-1 px-4">
            <View className="w-full h-[1px] bg-borderDefault flex-row items-center justify-center">
              <View className="bg-white px-2">
                <Ionicons name="airplane" size={20} color="#7B5FE8" />
              </View>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-textPrimary text-4xl font-black leading-none">
              {flight.arrivalAirport.iata_code}
            </Text>
            <Text className="text-textMuted text-[10px] font-bold uppercase mt-1">
              {flight.arrivalAirport.city}
            </Text>
          </View>
        </View>
      </View>

      {/* The Perforated Divider */}
      <View className="flex-row items-center bg-white border-x border-black/5">
        <View className="w-6 h-6 rounded-full bg-surface -ml-3" />
        <View className="flex-1 border-b border-dashed border-borderDefault mx-1" />
        <View className="w-6 h-6 rounded-full bg-surface -mr-3" />
      </View>

      {/* Bottom Section */}
      <View className="bg-white rounded-b-3xl p-6 pt-4 border-x border-b border-black/5">
        <View className="flex-row justify-between">
          <View>
            <Text className="text-textMuted text-[10px] font-black uppercase tracking-widest mb-1">
              Terminal
            </Text>
            <Text className="text-textPrimary text-lg font-bold">
              {flight.terminal || "TBA"}
            </Text>
          </View>

          <View className="items-center">
            <Text className="text-textMuted text-[10px] font-black uppercase tracking-widest mb-1">
              Gate
            </Text>
            <Text className="text-textPrimary text-lg font-bold">
              {flight.gate || "--"}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-textMuted text-[10px] font-black uppercase tracking-widest mb-1">
              Class
            </Text>
            <Text className="text-textPrimary text-lg font-bold uppercase">
              Economy
            </Text>
          </View>
        </View>

        <View className="mt-6 p-4 bg-surface rounded-2xl flex-row items-center justify-center border border-black/5">
          <Ionicons name="qr-code-outline" size={18} color="#0D1A3A" />
          <Text className="ml-2 text-textPrimary font-bold text-[10px] uppercase tracking-widest">
            Registration Successful
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Ticket;
