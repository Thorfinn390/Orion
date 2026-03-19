import { Navigation } from "lucide-react-native";
import { cssInterop } from "nativewind";
import React from "react";
import { Text, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { Flight } from "../types";

const AnimatableView = Animatable.View;
cssInterop(AnimatableView, { className: "style" });

cssInterop(Navigation, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true, width: true, height: true },
  },
});

interface FlightCardProps {
  flight: Flight;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight }) => {
  return (
    <AnimatableView
      animation="fadeInUp"
      duration={1000}
      className="relative overflow-hidden bg-indigo-700 rounded-[40px] p-8 shadow-xl shadow-blue-200"
    >
      {/* Visual Header */}
      <View className="flex-row justify-between items-start mb-8">
        <View>
          <Text className="text-blue-200/70 text-[10px] font-bold uppercase tracking-[2px] mb-1">
            Upcoming Flight
          </Text>
          <Text className="text-3xl font-extrabold text-white tracking-tight">
            {flight.flightNumber}
          </Text>
        </View>
        <View className="px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
          <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
            {flight.status}
          </Text>
        </View>
      </View>

      {/* Origin -> Destination */}
      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-1">
          <Text className="text-4xl font-black text-white">{flight.from}</Text>
          <Text className="text-blue-100 text-xs font-medium mt-1 opacity-80">
            {flight.fromCity}
          </Text>
        </View>

        <View className="flex-[2] items-center px-4 relative">
          <View className="w-full h-[1px] bg-blue-300/30 absolute top-1/2"></View>
          <View className="bg-indigo-600 p-2 rounded-full border border-blue-400/20 shadow-lg">
            <Navigation
              strokeWidth={3}
              className="w-5 h-5 text-white rotate-90"
            />
          </View>
        </View>

        <View className="flex-1 items-end">
          <Text className="text-4xl font-black text-white text-right">
            {flight.to}
          </Text>
          <Text className="text-blue-100 text-xs font-medium mt-1 opacity-80 text-right">
            {flight.toCity}
          </Text>
        </View>
      </View>

      {/* Flight Details Grid */}
      <View className="flex-row justify-between border-t border-white/15 pt-6">
        <View>
          <Text className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest mb-1">
            Gate
          </Text>
          <Text className="text-lg font-bold text-white">{flight.gate}</Text>
        </View>
        <View className="items-center">
          <Text className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest mb-1">
            Terminal
          </Text>
          <Text className="text-lg font-bold text-white">
            {flight.terminal || "N/A"}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-blue-200/60 text-[10px] font-bold uppercase tracking-widest mb-1">
            Departs
          </Text>
          <Text className="text-lg font-bold text-white">
            {flight.departureTime.split(",")[0]}
          </Text>
        </View>
      </View>
    </AnimatableView>
  );
};

export default FlightCard;
