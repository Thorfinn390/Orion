import { useAuthStore } from "@/stores/useAuthStore";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { Home, Map as MapIcon, User } from "lucide-react-native";
import React, { useEffect } from "react";
import { Platform, TouchableOpacity } from "react-native";
import { LogLevel,OneSignal } from "react-native-onesignal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
OneSignal.Debug.setLogLevel(LogLevel.Verbose);


        // Replace with your OneSignal App ID from Dashboard > Settings > Keys & IDs
    
        OneSignal.initialize('9b5533a6-6db4-42f5-a55e-d4d89b2e062d');
export default function TabLayout() {
  const userId = useAuthStore((state) => state.userId);
  useEffect(() => {
    if (userId) {
      console.log("Syncing OneSignal with userId:", userId);
      
      // 1. Prompt permission
      OneSignal.Notifications.requestPermission(true).then((success) => {
        console.log("Permission granted:", success);
        OneSignal.User.pushSubscription.optIn(); // Force the opt-in flag
        
        // Log this to see what OneSignal thinks your status is
        console.log("Subscription ID:", OneSignal.User.pushSubscription.id);
        console.log("Opted In:", OneSignal.User.pushSubscription.optedIn);
      });
      
      // 2. Identify the user
      OneSignal.login(userId);
  
      // 3. Setup foreground display
      const foregroundHandler = (event) => {
        console.log("Notification received in foreground");
        event.getNotification().display();
      };
  
      OneSignal.Notifications.addEventListener('foregroundWillDisplay', foregroundHandler);
  
      return () => {
         OneSignal.Notifications.removeEventListener('foregroundWillDisplay', foregroundHandler);
      };
    }
  }, [userId]);
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1568C4",
        tabBarInactiveTintColor: "#7B8BAA",
        tabBarStyle: {
          backgroundColor: "#0D1A3A",
          borderTopWidth: 0,
          paddingTop: 8,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 4,
        },
        tabBarButton: (props) => {
          const { children, style } = props;
          return (
            <TouchableOpacity
              {...props}
              activeOpacity={0.7}
              style={style}
              onPress={(e) => {
                // Trigger the haptic
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                // Call the original navigation event
                props.onPress?.(e);
              }}
            >
              {children}
            </TouchableOpacity>
          );
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <MapIcon size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
