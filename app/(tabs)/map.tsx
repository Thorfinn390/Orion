import { Layers, Locate, Navigation } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MapScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-1 relative">
        {/* Header Overlay */}
        <View className="absolute top-4 left-6 right-6 z-10 flex-row justify-between items-start">
          <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <Text className="text-lg font-black text-slate-900">
              Terminal 3
            </Text>
            <Text className="text-slate-500 text-xs font-medium">
              Dubai International
            </Text>
          </View>
          <TouchableOpacity className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
            <Layers size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Map Placeholder Area */}
        <View className="flex-1 bg-indigo-50 items-center justify-center">
          <View className="w-64 h-64 border-2 border-indigo-100 rounded-full items-center justify-center border-dashed">
            <Navigation size={40} color="#818cf8" />
            <Text className="text-indigo-400 font-semibold mt-2">
              Interactive Map
            </Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View className="absolute bottom-6 left-6 right-6 gap-3">
          <View className="flex-row justify-end">
            <TouchableOpacity className="bg-white p-3 rounded-full shadow-sm border border-slate-100">
              <Locate size={24} color="#4f46e5" />
            </TouchableOpacity>
          </View>

          <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 bg-indigo-100 rounded-xl items-center justify-center">
                <Navigation size={24} color="#4f46e5" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-bold text-base">
                  Gate B12
                </Text>
                <Text className="text-slate-500 text-xs">
                  15 min walk • On time
                </Text>
              </View>
              <TouchableOpacity className="bg-indigo-600 px-4 py-2 rounded-lg">
                <Text className="text-white font-bold text-sm">Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
