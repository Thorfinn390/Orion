import * as SecureStore from "expo-secure-store";
import {
  Bell,
  ChevronRight,
  LogOut,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync("userToken");

      const response = await fetch(
        `http://${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/logout`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log(response);
      if (response.status !== 200) {
        throw new Error("Logout failed");
      }

      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("refreshToken");

      Toast.show({
        type: "success",
        text1: "Logged out successfully",
        visibilityTime: 2000,
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Error logging you out",
      });
    }
  };

  const SettingItem = ({
    icon: Icon,
    label,
    onPress,
    isLast = false,
    hasSwitch = false,
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={hasSwitch}
      className={`flex-row items-center justify-between p-md ${
        !isLast ? "border-b border-borderDefault" : ""
      }`}
    >
      <View className="flex-row items-center gap-sm">
        <View className="w-8 h-8 items-center justify-center rounded-md bg-inputSurface">
          <Icon size={18} color="#3A4863" />
        </View>
        <Text className="text-base font-medium text-primary">{label}</Text>
      </View>

      {hasSwitch ? (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: "#E3E8F4", true: "#1568C4" }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#E3E8F4"
        />
      ) : (
        <ChevronRight size={20} color="#7B8BAA" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1 px-md pt-xl"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text className="text-3xl font-black text-primary mb-lg">Profile</Text>

        {/* Profile Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          className="bg-white p-lg rounded-2xl shadow-card border border-borderDefault flex-row items-center gap-md mb-xl"
        >
          <View className="w-16 h-16 bg-nova rounded-full flex items-center justify-center shadow-md">
            <User size={32} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-primary">Alex Smith</Text>
            <Text className="text-sm font-medium text-meta">
              alex.smith@example.com
            </Text>
          </View>
          <View className="bg-statusI px-sm py-xs rounded-full">
            <Text className="text-xs font-bold text-primaryBrand uppercase">
              Edit
            </Text>
          </View>
        </TouchableOpacity>

        {/* Settings Group */}
        <Text className="text-lg font-bold text-primary mb-md">
          Account Settings
        </Text>
        <View className="bg-white rounded-xl shadow-card border border-borderDefault overflow-hidden mb-lg">
          <SettingItem
            icon={Settings}
            label="Personal Information"
            onPress={() => console.log("Settings")}
          />
          <SettingItem
            icon={ShieldCheck}
            label="Security & Password"
            onPress={() => console.log("Security")}
          />

          <SettingItem
            icon={Bell}
            label="Push Notifications"
            hasSwitch={true}
            isLast={true}
          />
        </View>

        {/* Support Section */}
        <Text className="text-lg font-bold text-primary mb-md">Support</Text>
        <View className="bg-white rounded-xl shadow-card border border-borderDefault overflow-hidden mb-xl">
          <SettingItem icon={Settings} label="Help Center" onPress={() => {}} />
          <SettingItem
            icon={Settings}
            label="Terms of Service"
            onPress={() => {}}
            isLast={true}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          className="flex-row items-center justify-center gap-sm p-md mb-3xl bg-white border border-statusUL/20 rounded-xl"
        >
          <LogOut size={20} color="#C84B4B" />
          <Text className="text-statusUL font-bold text-base">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
