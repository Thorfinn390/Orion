import {
  TERMINAL_SERVICES,
  TerminalServiceId,
} from "@/utils/journeySimulation";
import { router } from "expo-router";
import { Car, Coffee, Info, ShoppingBag } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const serviceIcons = {
  "lounge-access": Coffee,
  "duty-free": ShoppingBag,
  transport: Car,
  "info-desk": Info,
} satisfies Record<TerminalServiceId, React.ElementType>;

export const ServicesGrid = () => {
  return (
    <View className="mt-10 mb-24">
      <Text className="text-xl font-black text-slate-900 mb-6">
        Terminal Services
      </Text>
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {TERMINAL_SERVICES.map((service) => {
          const Icon = serviceIcons[service.id];

          return (
            <TouchableOpacity
              key={service.id}
              onPress={() => router.push(service.route as never)}
              className={`p-5 rounded-[32px] border border-slate-100 w-[48%] min-h-[140px] flex-col justify-between ${service.bgClassName}`}
            >
              <View className="bg-white p-3 rounded-2xl shadow-sm self-start border border-slate-100">
                <Icon size={24} color={service.iconColor} />
              </View>
              <Text className="text-sm font-black text-slate-800">
                {service.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
