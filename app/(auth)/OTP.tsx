import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(594); // 09:54
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (seconds === 0) return;
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      setOtp(Array(OTP_LENGTH).fill(""));
      setSeconds(594);
      inputs.current[0]?.focus();

      const response = await fetch(
        `http://${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to resend code");
        return;
      }
    } catch (error) {
      alert("Connection error. Please try again.");
    }
  };

  const handleConfirm = () => {
    router.replace("/(tabs)");
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-md justify-center gap-xl">
          {/* Header */}
          <View className="gap-sm">
            <Text className="text-primary font-bold text-3xl">
              Verify Your Email
            </Text>
            <Text className="text-secondary text-base leading-6">
              A message has been sent to{" "}
              <Text className="text-primaryBrand font-semibold">
                +1 (555) ••• ••89
              </Text>
            </Text>
          </View>

          {/* OTP + Timer + Button */}
          <View className="gap-lg">
            {/* OTP Inputs */}
            <View className="flex-row justify-between gap-sm">
              {Array(OTP_LENGTH)
                .fill(0)
                .map((_, i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => (inputs.current[i] = ref)}
                    value={otp[i]}
                    onChangeText={(text) => handleChange(text, i)}
                    onKeyPress={(e) => handleKeyPress(e, i)}
                    onFocus={() => setFocusedIndex(i)}
                    onBlur={() => setFocusedIndex(null)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    placeholder="0"
                    placeholderTextColor="#C9D4E8"
                    className="text-primary font-bold text-2xl text-center bg-surface rounded-lg"
                    style={{
                      flex: 1,
                      height: 64,
                      borderWidth: focusedIndex === i || otp[i] ? 1.5 : 1,
                      borderColor:
                        focusedIndex === i
                          ? "#1568C4"
                          : otp[i]
                            ? "#1568C4"
                            : "#E3E8F4",
                      shadowColor:
                        focusedIndex === i ? "#1568C4" : "transparent",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.12,
                      shadowRadius: 6,
                      elevation: focusedIndex === i ? 2 : 0,
                    }}
                  />
                ))}
            </View>

            {/* Timer & Resend */}
            <View className="flex-row items-center justify-between px-xs">
              <View className="flex-row items-center gap-xs">
                <Ionicons name="time-outline" size={18} color="#7B8BAA" />
                <Text className="text-secondary text-sm font-medium">
                  {formatTime(seconds)}
                </Text>
              </View>
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text className="text-primaryBrand text-xs font-bold uppercase tracking-wider">
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={isComplete ? 0.9 : 1}
              disabled={!isComplete}
              className="rounded-lg py-md items-center justify-center flex-row gap-sm"
              style={{
                backgroundColor: isComplete ? "#1568C4" : "#EEF2FA",
                shadowColor: isComplete ? "#1568C4" : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: isComplete ? 4 : 0,
              }}
            >
              <Text
                className="font-bold text-base"
                style={{ color: isComplete ? "#ffffff" : "#7B8BAA" }}
              >
                Confirm Selection
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={isComplete ? "#ffffff" : "#7B8BAA"}
              />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center items-center flex-wrap gap-xs">
            <Text className="text-secondary text-sm">Having trouble?</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-primaryBrand font-bold text-sm">
                Contact Orion Concierge
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
