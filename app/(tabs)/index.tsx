import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../stores/useAuthStore";

export default function HomeScreen() {
  const fullName = useAuthStore((state) => state.fullName);
  const email = useAuthStore((state) => state.email);
  const accessToken = useAuthStore((state) => state.accessToken);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Text>Hello {fullName}</Text>
    </SafeAreaView>
  );
}
