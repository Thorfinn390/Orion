import { useRouter } from "expo-router";
import {
  ChevronLeft,
  FileText,
  Info,
  Lock,
  ShieldCheck,
} from "lucide-react-native";
import React, { memo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TermSectionProps = {
  icon: any;
  title: string;
  body: string;
};

const TermSection = memo(({ icon: Icon, title, body }: TermSectionProps) => (
  <View className="bg-white rounded-[24px] p-lg mb-md border border-borderDefault shadow-card">
    <View className="flex-row items-start gap-md">
      <View className="w-12 h-12 rounded-xl bg-inputSurface items-center justify-center">
        <Icon size={22} color="#1568C4" strokeWidth={1.8} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-black text-primary">{title}</Text>
        <Text className="text-sm text-meta leading-6 mt-xs">{body}</Text>
      </View>
    </View>
  </View>
));

TermSection.displayName = "TermSection";

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-md py-sm flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-white border border-borderDefault items-center justify-center shadow-sm"
        >
          <ChevronLeft size={24} color="#0D1A3A" />
        </TouchableOpacity>
        <Text className="text-base font-black text-primary">Terms</Text>
        <View className="w-11" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-md pt-lg pb-2xl">
          <View className="mb-xl">
            <View className="w-16 h-16 rounded-[20px] bg-primaryBrand items-center justify-center shadow-card mb-md">
              <FileText size={30} color="#FFFFFF" strokeWidth={1.7} />
            </View>
            <Text className="text-3xl font-black text-primary tracking-tight">
              Terms of{"\n"}
              <Text className="text-primaryBrand">Service.</Text>
            </Text>
            <Text className="text-sm text-meta leading-6 mt-sm max-w-[320px]">
              The essentials for using Orion account, travel, and support
              features.
            </Text>
          </View>

          <Text className="text-xs font-black text-meta uppercase tracking-widest mb-md ml-1">
            Summary
          </Text>

          <TermSection
            icon={Info}
            title="Use of Orion"
            body="Orion helps organize airport journeys, flight tools, and assistant features. Information shown in the app should be checked against airport and airline updates before travel decisions."
          />
          <TermSection
            icon={Lock}
            title="Account Responsibility"
            body="You are responsible for keeping your sign-in credentials private and for notifying support if you suspect unauthorized account access."
          />
          <TermSection
            icon={ShieldCheck}
            title="Data & Safety"
            body="Security settings, verification, and deletion requests are handled through authenticated backend services. Some account actions may require email confirmation."
          />

          <View className="bg-navtab rounded-[24px] p-lg mt-lg shadow-card">
            <Text className="text-white text-lg font-black">
              Effective Date
            </Text>
            <Text className="text-white/70 text-sm leading-6 mt-xs">
              This in-app summary is intended for the current Orion mobile
              experience. Official legal text should replace this summary when
              the policy URL is finalized.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
