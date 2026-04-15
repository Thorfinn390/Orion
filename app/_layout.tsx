import FloatingAIButton from "@/components/AI/FloatingAIButton";
import { Stack } from "expo-router";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "./globals.css";

export default function RootLayout() {
  // useEffect(() => {});

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <FloatingAIButton />
      <Toast />
    </SafeAreaProvider>
  );
}
