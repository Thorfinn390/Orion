import { router } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Smartphone,
  Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SecurityCard = React.memo(
  ({ icon: Icon, title, description, onPress, children }: any) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
      className="bg-white rounded-2xl p-lg mb-md border border-borderDefault shadow-card"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-md flex-1">
          <View className="w-12 h-12 rounded-xl bg-inputSurface items-center justify-center">
            <Icon size={24} color="#1568C4" strokeWidth={1.5} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-primary">{title}</Text>
            <Text className="text-sm text-meta leading-5 mt-1">
              {description}
            </Text>
          </View>
        </View>
        {children ? children : <ChevronRight size={20} color="#C9D4E8" />}
      </View>
    </TouchableOpacity>
  ),
);

SecurityCard.displayName = "SecurityCard";

export default function SecurityScreen() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => console.log("Delete"),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Custom Header */}
      <View className="px-md py-sm flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white border border-borderDefault items-center justify-center shadow-sm"
        >
          <ChevronLeft size={24} color="#0D1A3A" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-primary">
          Security Center
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        {/* Hero Section */}
        <View className="mb-xl">
          <Text className="text-3xl font-black text-primary tracking-tight">
            Protect your{"\n"}
            <Text className="text-primaryBrand">digital identity.</Text>
          </Text>
        </View>

        {/* Essential Security Section */}
        <Text className="text-xs font-black text-meta uppercase tracking-widest mb-md ml-1">
          Access Control
        </Text>

        <SecurityCard
          icon={Lock}
          title="Password"
          description="Update your secret key regularly to keep your account safe."
          onPress={() => console.log("Change Password")}
        />

        <SecurityCard
          icon={Smartphone}
          title="2FA Authentication"
          description="Add an extra layer of protection to your sign-in process."
        >
          <Switch
            value={is2FAEnabled}
            onValueChange={setIs2FAEnabled}
            trackColor={{ false: "#E3E8F4", true: "#1568C4" }}
            thumbColor="#FFFFFF"
          />
        </SecurityCard>

        {/* Account Integrity Section */}
        <Text className="text-xs font-black text-meta uppercase tracking-widest mt-lg mb-md ml-1">
          Privacy & Data
        </Text>

        {/* <SecurityCard
          icon={ShieldCheck}
          title="Login Activity"
          description="Check where and when you've been logged in."
          onPress={() => {}}
        /> */}

        {/* Dangerous Zone */}
        <View className="mt-xl p-lg rounded-2xl bg-white border border-statusUL/10 border-dashed">
          <View className="flex-row items-center gap-sm mb-sm">
            <Trash2 size={18} color="#C84B4B" />
            <Text className="text-statusUL font-bold text-lg">Danger Zone</Text>
          </View>
          <Text className="text-meta text-sm mb-lg">
            Deleting your account is irreversible. All your data, flight
            history, and preferences will be wiped from our servers.
          </Text>
          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="bg-statusUL/5 py-md rounded-xl border border-statusUL/20 items-center"
          >
            <Text className="text-statusUL font-bold">
              Request Account Deletion
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-meta text-xs mt-xl">
          Security Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
