import { Car, Coffee, Info, ShoppingBag } from "lucide-react-native";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export const ServicesGrid = () => {
  const services = [
    {
      id: 1,
      title: "Lounge Access",
      icon: Coffee,
      color: "#ea580c",
      bgColor: "bg-orange-50",
    },
    {
      id: 2,
      title: "Duty Free",
      icon: ShoppingBag,
      color: "#059669",
      bgColor: "bg-emerald-50",
    },
    {
      id: 3,
      title: "Transport",
      icon: Car,
      color: "#4f46e5",
      bgColor: "bg-indigo-50",
    },
    {
      id: 4,
      title: "Info Desk",
      icon: Info,
      color: "#d97706",
      bgColor: "bg-amber-50",
    },
  ];

  const handleServicePress = (serviceName: string) => {
    Alert.alert("Service", `Navigating to ${serviceName}`);
  };

  return (
    <View className="mt-10 mb-24">
      <Text className="text-xl font-black text-slate-900 mb-6">
        Terminal Services
      </Text>
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            onPress={() => handleServicePress(service.title)}
            className={`p-5 rounded-[32px] border border-slate-100 w-[48%] min-h-[140px] flex-col justify-between ${service.bgColor}`}
          >
            <View className="bg-white p-3 rounded-2xl shadow-sm self-start border border-slate-100">
              <service.icon size={24} color={service.color} />
            </View>
            <Text className="text-sm font-black text-slate-800">
              {service.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
