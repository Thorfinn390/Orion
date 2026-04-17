import { apiFetch } from "@/utils/apiFetch";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ForgotPasswordStep2() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await apiFetch("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (response.status === 201) {
        Toast.show({
          type: "success",
          text1: "OTP Resent",
          text2: "Please check your email for the new code.",
          autoHide: true,
          visibilityTime: 1500,
          onHide: () => {
            router.push({
              pathname: "/(auth)/ForgetPassSteps/StepThree",
              params: { email },
            });
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Request Failed",
          text2: "Could not resend OTP. Please try again later.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Connection Error",
        text2: "Check your internet connection.",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <View className="bg-white rounded-xl p-lg items-center gap-sm border border-borderDefault shadow-card">
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
            {email}
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSendCode}
          disabled={loading}
          className={`h-[56px] rounded-xl flex-row items-center justify-center gap-sm shadow-md ${
            loading ? "bg-borderEmphasis" : "bg-primaryBrand"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              {loading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Yes, Send Code
                </Text>
              )}
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>

        {/* Footer / Back Button */}
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
