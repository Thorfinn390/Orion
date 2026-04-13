import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground } from "react-native";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
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

  if (!isLoggedIn) {
    return <Redirect href="/pages/auth/login" />;
  }

  return <Redirect href="/(tabs)/profile" />;
}
