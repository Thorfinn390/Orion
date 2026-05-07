import { useRouter } from "expo-router";
import {
  ChevronLeft,
  HelpCircle,
  Mail,
  MessageCircle,
  Plane,
  ShieldQuestion,
} from "lucide-react-native";
import React, { memo, useCallback } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type HelpCardProps = {
  icon: any;
  title: string;
  description: string;
  onPress?: () => void;
};

const HelpCard = memo(
  ({ icon: Icon, title, description, onPress }: HelpCardProps) => (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      disabled={!onPress}
      className="bg-white rounded-[24px] p-lg mb-md border border-borderDefault shadow-card"
    >
      <View className="flex-row items-start gap-md">
        <View className="w-12 h-12 rounded-xl bg-inputSurface items-center justify-center">
          <Icon size={23} color="#1568C4" strokeWidth={1.8} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-black text-primary">{title}</Text>
          <Text className="text-sm text-meta leading-6 mt-xs">
            {description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ),
);

HelpCard.displayName = "HelpCard";

export default function HelpCenterScreen() {
  const router = useRouter();
  const openSupportEmail = useCallback(async () => {
    const supportUrl =
      "mailto:support@orion.app?subject=Orion%20Support%20Request";

    try {
      const canOpen = await Linking.canOpenURL(supportUrl);

      if (!canOpen) {
        throw new Error("No email app is available on this device.");
      }

      await Linking.openURL(supportUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to open your email app.";

      Alert.alert("Contact Support", message);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-md py-sm flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-white border border-borderDefault items-center justify-center shadow-sm"
        >
          <ChevronLeft size={24} color="#0D1A3A" />
        </TouchableOpacity>
        <Text className="text-base font-black text-primary">Help Center</Text>
        <View className="w-11" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-md pt-lg pb-2xl">
          <View className="mb-xl">
            <View className="w-16 h-16 rounded-[20px] bg-primaryBrand items-center justify-center shadow-card mb-md">
              <HelpCircle size={30} color="#FFFFFF" strokeWidth={1.7} />
            </View>
            <Text className="text-3xl font-black text-primary tracking-tight">
              How can we{"\n"}
              <Text className="text-primaryBrand">help today?</Text>
            </Text>
            <Text className="text-sm text-meta leading-6 mt-sm max-w-[320px]">
              Find quick answers for account security, flights, and Orion
              support.
            </Text>
          </View>

          <Text className="text-xs font-black text-meta uppercase tracking-widest mb-md ml-1">
            Quick Topics
          </Text>

          <HelpCard
            icon={ShieldQuestion}
            title="Account & Security"
            description="Password updates, verification codes, and 2FA recovery questions."
          />
          <HelpCard
            icon={Plane}
            title="Flights & Guides"
            description="Registering flights, generated guides, and checklist timing."
          />
          <HelpCard
            icon={MessageCircle}
            title="Nova Assistant"
            description="Chat support, airport information, and voice navigation."
          />

          <TouchableOpacity
            onPress={openSupportEmail}
            activeOpacity={0.86}
            className="mt-lg bg-primaryBrand py-lg rounded-[20px] items-center justify-center flex-row shadow-card"
          >
            <Mail size={20} color="#FFFFFF" strokeWidth={2.2} />
            <Text className="text-white font-black text-base uppercase tracking-widest ml-sm">
              Email Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
