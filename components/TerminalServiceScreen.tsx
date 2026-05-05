import { TicketSimulationService } from "@/utils/TicketSimulationService";
import { TerminalService } from "@/utils/journeySimulation";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  BadgeCheck,
  Clock3,
  MapPinned,
  Navigation,
  Sparkles,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type TerminalServiceScreenProps = {
  service: TerminalService;
  Icon: IconComponent;
};

export const TerminalServiceScreen = ({
  service,
  Icon,
}: TerminalServiceScreenProps) => {
  const handleFindOnMap = () => {
    TicketSimulationService.startServiceAR(service.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView
        className="flex-1 px-md"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 96 }}
      >
        <View className="bg-navtab rounded-b-[40px] -mx-md -mt-5 px-xl pt-md pb-xl mb-xl">
          <View className="flex-row items-center justify-between mb-xl">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-activeflight border border-white/10"
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <View className="bg-activeflight/40 px-sm py-xs rounded-full border border-white/5">
              <Text className="text-highlights text-[10px] font-black uppercase tracking-widest">
                Terminal
              </Text>
            </View>
          </View>

          <View className="flex-row items-end justify-between">
            <View className="flex-1 pr-md">
              <Text className="text-[12px] font-black text-meta uppercase tracking-[3px] mb-1">
                {service.eyebrow}
              </Text>
              <Text className="text-4xl font-black text-white tracking-tight">
                {service.title}.
              </Text>
            </View>

            <View
              className={`w-16 h-16 rounded-[24px] items-center justify-center rotate-3 ${service.bgClassName}`}
            >
              <View className="-rotate-3">
                <Icon size={30} color={service.iconColor} strokeWidth={2.2} />
              </View>
            </View>
          </View>
        </View>

        <View className="bg-white p-lg rounded-[32px] border border-borderDefault shadow-card mb-lg">
          <View className="flex-row items-start">
            <View
              className={`w-11 h-11 rounded-2xl items-center justify-center mr-md ${service.bgClassName}`}
            >
              <Sparkles size={20} color={service.iconColor} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-black text-meta uppercase tracking-[3px] mb-sm">
                Overview
              </Text>
              <Text className="text-lg font-bold text-primary leading-7">
                {service.description}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-sm mb-lg">
          <View className="flex-1 bg-white rounded-[24px] border border-borderDefault p-md">
            <MapPinned size={22} color="#1568C4" />
            <Text className="text-[10px] font-black text-meta uppercase tracking-widest mt-md">
              Route
            </Text>
            <Text className="text-sm font-black text-primary mt-xs">
              AR Guided
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-[24px] border border-borderDefault p-md">
            <Clock3 size={22} color="#7B5FE8" />
            <Text className="text-[10px] font-black text-meta uppercase tracking-widest mt-md">
              Timing
            </Text>
            <Text className="text-sm font-black text-primary mt-xs">
              Nearby
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-[24px] border border-borderDefault p-md">
            <BadgeCheck size={22} color="#1A7A48" />
            <Text className="text-[10px] font-black text-meta uppercase tracking-widest mt-md">
              Status
            </Text>
            <Text className="text-sm font-black text-primary mt-xs">
              Ready
            </Text>
          </View>
        </View>

        <Text className="text-xs font-black text-meta uppercase tracking-[2px] mb-md ml-1">
          {"What You'll Find"}
        </Text>
        <View className="bg-white rounded-[32px] border border-borderDefault shadow-card overflow-hidden mb-xl">
          {service.details.map((detail, index) => (
            <View
              key={detail}
              className={`flex-row items-center px-lg py-md ${
                index !== service.details.length - 1
                  ? "border-b border-borderDefault/60"
                  : ""
              }`}
            >
              <View
                className={`w-8 h-8 rounded-2xl items-center justify-center mr-md ${service.bgClassName}`}
              >
                <Text className="text-[10px] font-black text-primary">
                  {index + 1}
                </Text>
              </View>
              <Text className="text-base font-bold text-secondary">
                {detail}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleFindOnMap}
          activeOpacity={0.85}
          className="bg-navtab h-16 rounded-[24px] flex-row items-center justify-center shadow-lg"
        >
            <Navigation size={20} color="white" />
          <Text className="text-white text-sm font-black uppercase tracking-widest ml-sm">
            Show in AR
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
