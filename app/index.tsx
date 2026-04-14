import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ImageBackground } from "react-native";

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        console.log(token);

        //implement refresh token api call later
        if (token) {
          setIsLoggedIn(true);
        }
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
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)/profile" />;
}
