import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";

// SplashScreen.setOptions({
//   duration: 1000,
//   fade: true,
// });
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [splashScreenReady, setSplashScreenReady] = useState(false);

  useEffect(() => {
    async function checkLogIn() {
      try {
        //try code
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setSplashScreenReady(true);
      }
    }

    checkLogIn();
  }, []);

  useEffect(() => {
    if (splashScreenReady) {
      SplashScreen.hide();
    }
  }, [splashScreenReady]);

  if (!splashScreenReady) {
    return null;
  }

  if (!isLoggedIn) {
    return <Redirect href="/pages/auth/login" />;
  }

  return (
    <SafeAreaProvider>
      <Stack
        initialRouteName="(tabs)"
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      />
    </SafeAreaProvider>
  );
}
