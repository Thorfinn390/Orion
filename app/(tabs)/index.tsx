import { Bell, Search, Sparkles } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JourneyTimeline } from "../../components/JourneyTimeline";
import { ServicesGrid } from "../../components/ServicesGrid";
import { TicketCard } from "../../components/TicketCard";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);

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
    Alert.alert("Journey Details", "Opening full journey details...");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mt-8 mb-8">
          <View>
            <Text className="text-3xl font-black text-slate-900">Voyager</Text>
            <Text className="text-slate-500 text-sm font-medium">
              Welcome back, Alex!
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
          <View className="bg-indigo-50 p-2 rounded-xl">
            <Sparkles size={18} color="#4f46e5" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
              SkyGuide AI
            </Text>
            <Text className="text-sm text-slate-700 italic leading-5">
              &quot;Your flight EK 202 is on time. Terminal 3 is currently busy,
              we recommend heading to the gate 45 mins early.&quot;
            </Text>
          </View>
        </TouchableOpacity>

        <TicketCard />

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
        <JourneyTimeline />

        <ServicesGrid />
      </ScrollView>
    </SafeAreaView>
  );
}
