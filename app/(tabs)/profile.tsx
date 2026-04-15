import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  ChevronRight,
  FileText,
  HelpCircle,
  LogOut,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const SettingItem = React.memo(
  ({
    icon: Icon,
    label,
    onPress,
    isLast = false,
    hasSwitch = false,
    value,
    onValueChange,
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={hasSwitch}
      activeOpacity={0.6}
      className={`flex-row items-center justify-between py-lg px-md ${
        !isLast ? "border-b border-borderDefault/50" : ""
      }`}
    >
      <View className="flex-row items-center gap-md">
        <View className="w-10 h-10 items-center justify-center rounded-2xl bg-inputSurface">
          <Icon size={20} color="#1568C4" strokeWidth={2} />
        </View>
        <Text className="text-base font-bold text-primary">{label}</Text>
      </View>

      {hasSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#E3E8F4", true: "#1568C4" }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <View className="w-8 h-8 items-center justify-center rounded-full bg-surface">
          <ChevronRight size={18} color="#7B8BAA" />
        </View>
      )}
    </TouchableOpacity>
  ),
);

SettingItem.displayName = "SettingItem";

// --- MAIN SCREEN ---

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Stable navigation callbacks
  const goToSecurity = useCallback(
    () => router.push("/(profile)/securityAndPassword"),
    [],
  );
  const goToPersonal = useCallback(
    () => router.push("/(profile)/personalInformation"),
    [],
  );

  // const handleToggleNotifications = useCallback((val: boolean) => {
  //   setNotificationsEnabled(val);
  // }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
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

      if (response.status === 200) {
        await Promise.all([
          SecureStore.deleteItemAsync("userToken"),
          SecureStore.deleteItemAsync("refreshToken"),
        ]);
        Toast.show({ type: "success", text1: "Logged out successfully" });
        router.replace("/(auth)/login");
      }
    } catch (e) {
      Toast.show({ type: "error", text1: "Error logging you out" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1 px-md"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 60 }}
      >
        {/* Editorial Style Header */}
        <View className="mb-xl px-1">
          <Text className="text-[12px] font-black text-meta uppercase tracking-[3px] mb-1">
            Account
          </Text>
          <Text className="text-4xl font-black text-primary tracking-tight">
            Profile.
          </Text>
        </View>

        {/* Hero Profile Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={goToPersonal}
          className="bg-white p-lg rounded-[32px] shadow-card border border-borderDefault flex-row items-center mb-2xl"
        >
          <View className="w-20 h-20 bg-nova rounded-[24px] flex items-center justify-center shadow-lg rotate-2">
            <View className="-rotate-2">
              <User size={40} color="#FFFFFF" strokeWidth={1.5} />
            </View>
          </View>

          <View className="flex-1 ml-lg">
            <Text className="text-2xl font-black text-primary tracking-tight">
              Alex Smith
            </Text>
            <Text className="text-sm font-medium text-meta">
              alex.smith@bau.edu.lb
            </Text>
          </View>
        </TouchableOpacity>

        {/* Account Section */}
        <Text className="text-xs font-black text-meta uppercase tracking-[2px] mb-md ml-1">
          Preferences
        </Text>
        <View className="bg-white rounded-[28px] shadow-card border border-borderDefault overflow-hidden mb-xl">
          <SettingItem
            icon={Settings}
            label="Personal Information"
            onPress={goToPersonal}
          />
          <SettingItem
            icon={ShieldCheck}
            label="Security & Password"
            onPress={goToSecurity}
          />
          {/* <SettingItem
            icon={Bell}
            label="Notifications"
            hasSwitch={true}
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            isLast={true}
          /> */}
        </View>

        {/* Support Section */}
        <Text className="text-xs font-black text-meta uppercase tracking-[2px] mb-md ml-1">
          Support
        </Text>
        <View className="bg-white rounded-[28px] shadow-card border border-borderDefault overflow-hidden mb-2xl">
          <SettingItem
            icon={HelpCircle}
            label="Help Center"
            onPress={() => {}}
          />
          <SettingItem
            icon={FileText}
            label="Terms of Service"
            onPress={() => {}}
            isLast={true}
          />
        </View>

        {/* Minimalist Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={loading}
          activeOpacity={0.7}
          className="flex-row items-center justify-center py-lg bg-white border border-statusUL/10 rounded-[24px] shadow-sm"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#C84B4B" />
          ) : (
            <>
              <LogOut size={20} color="#C84B4B" strokeWidth={2.5} />
              <Text className="text-statusUL font-black text-base ml-sm uppercase tracking-wider">
                Sign Out
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text className="text-center text-meta text-[10px] mt-xl font-bold uppercase tracking-widest">
          Version 1.0.24 — Orion
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
