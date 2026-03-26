import { Stack } from "expo-router";
import "react-native-reanimated";
import "./globals.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. The main app interface */}
      <Stack.Screen name="(tabs)" />
      
      {/* 2. The login page (Must be named exactly like your file) */}
      <Stack.Screen name="login" />
    </Stack>
  );
}