import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordStep2() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 px-md justify-center gap-xl">
        {/* Step Indicator */}
        <Text
          className="text-meta font-bold text-center"
          style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase" }}
        >
          Step 2 of 3
        </Text>

        {/* Header */}
        <View className="gap-sm">
          <Text
            className="text-primary font-bold text-center"
            style={{ fontSize: 32, lineHeight: 40 }}
          >
            Is this correct?
          </Text>
          <Text className="text-secondary text-base text-center leading-6 px-md">
            We will send a secure verification code to the contact detail listed
            below to ensure your account remains safe.
          </Text>
        </View>

        {/* Info Card */}
        <View
          className="bg-surface rounded-xl p-lg items-center gap-sm border border-borderDefault"
          style={{
            shadowColor: "#0D1A3A",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <Text
            className="text-meta font-bold text-center"
            style={{
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Primary Email Address
          </Text>
          <Text className="text-primary font-semibold text-lg text-center">
            alex.j.weaver@traveler.com
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/ForgetPassSteps/StepThree")}
          activeOpacity={0.9}
          className="bg-primaryBrand rounded-lg py-md items-center justify-center flex-row gap-sm"
          style={{
            shadowColor: "#1568C4",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <Text className="text-white font-bold text-base">Yes, Send Code</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>

        {/* Footer */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="flex-row items-center justify-center gap-xs"
        >
          <Ionicons name="arrow-back" size={16} color="#1568C4" />
          <Text className="text-primaryBrand font-bold text-sm">
            Go back to step 1
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
