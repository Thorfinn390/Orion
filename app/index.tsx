import { useAuthStore } from "@/stores/useAuthStore";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground } from "react-native";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    async function checkAuth() {
      try {
        await initializeAuth();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <ImageBackground
        source={require("@/assets/images/SplashScreen1.png")}
        resizeMode="cover"
        className="flex-1"
      />
    );
  }

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/profile" />;
}
