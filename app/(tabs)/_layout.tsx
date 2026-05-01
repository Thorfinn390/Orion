import { useAuthStore } from "@/stores/useAuthStore";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { Home, Map as MapIcon, Sparkles, User } from "lucide-react-native"; // Added Sparkles
import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import { OneSignal } from "react-native-onesignal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const userId = useAuthStore((state) => state.userId);
  OneSignal.login(userId!);
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
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
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
      {/* --- NEW GUIDE TAB --- */}
      <Tabs.Screen
        name="guide" 
        options={{
          title: "Guide",
          tabBarIcon: ({ color }) => <Sparkles size={22} color={color} />,
        }}
      />
      {/* --------------------- */}
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