import * as SecureStore from "expo-secure-store";
import {
  Bell,
  ChevronRight,
  LogOut,
  Settings,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleProfileEdit = () => {
    console.log("Tapped on profile edit.");
  };

  const MapsToAccountSettings = () => {
    console.log("Tapped on account settings.");
  };

  const handleLogout = () => {
    console.log("Tapped on log out.");
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: async () => {
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("refreshToken");
          },
          style: "destructive",
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-6 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-black text-slate-900 mb-8">Profile</Text>

        <TouchableOpacity
          onPress={handleProfileEdit}
          className="bg-white p-6 rounded-[30px] shadow-sm border border-slate-100 flex-row items-center gap-4 mb-8"
        >
          <View className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <User size={32} color="#4f46e5" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-slate-900">Alex Smith</Text>
            <Text className="text-slate-500 font-medium">
              alex.smith@example.com
            </Text>
          </View>
        </TouchableOpacity>

        <Text className="text-lg font-bold text-slate-900 mb-4">Settings</Text>

        <View className="bg-white rounded-[20px] shadow-sm border border-slate-100 overflow-hidden mb-6">
          <Pressable
            onPress={MapsToAccountSettings}
            className="flex-row items-center justify-between p-4 border-b border-slate-100"
          >
            <View className="flex-row items-center gap-3">
              <Settings size={20} color="#64748b" />
              <Text className="text-slate-700 font-medium">
                Account Settings
              </Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </Pressable>

          <TouchableOpacity
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center gap-3">
              <Bell size={20} color="#64748b" />
              <Text className="text-slate-700 font-medium">
                Push Notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#cbd5e1", true: "#4f46e5" }}
              ios_backgroundColor="#cbd5e1"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center gap-2 p-4 mt-4 bg-red-50 rounded-[20px]"
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-500 font-bold">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
