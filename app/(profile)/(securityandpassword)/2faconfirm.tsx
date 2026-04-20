import { useAuthStore } from "@/stores/useAuthStore";
import { apiFetch } from "@/utils/apiFetch";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    BackHandler,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const { contactMethod, password } = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(594);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isResending, setIsResending] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const set2FAEnabled = useAuthStore((state) => state.setIs2faEnabled);
  const [loading, setLoading] = useState(false);
  let is2FAEnabledStored = useAuthStore((state) => state.is_2fa_enabled);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace("/profile");
      return true;
    });
    return () => subscription.remove();
  }, []);

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

  const handleConfirm = async () => {
    try {
     
      setLoading(true);
      const otpString = otp.join("");

      if (otpString.length !== OTP_LENGTH) {
        Toast.show({
          type: "error",
          text1: "Invalid Code",
          text2: "Please enter the full verification code.",
        });
        return;
      }
      console.log("hehrh");
      if(!is2FAEnabledStored){ 
        const verifyRes = await apiFetch("/user/confirm-2fa", {
            method: "POST",
            body: JSON.stringify({ otp: otpString }),
          });
    
          const verifyData = await verifyRes.json();
    
          if (verifyRes.status!== 200 && verifyRes.status !== 201) {
            Toast.show({
              type: "error",
              text1: "Verification Failed",
              text2: verifyData.error || "The code you entered is incorrect.",
            });
        
          }
          Toast.show({
                      type: "success",
                      text1: "2FA Enabled",
                      visibilityTime: 4000,
                      autoHide: true,
                    });
                   
                    await set2FAEnabled(true);
      }else{
        const verifyRes = await apiFetch("/user/confirm-disable-2fa", {
            method: "POST",
            body: JSON.stringify({ otp: otpString }),
          });
    
          const verifyData = await verifyRes.json();
    
          if (verifyRes.status!== 200 && verifyRes.status !== 201) {
            Toast.show({
              type: "error",
              text1: "Verification Failed",
              text2: verifyData.error || "The code you entered is incorrect.",
            });
          }
          Toast.show({
                      type: "success",
                      text1: "2FA Disabled",
                      visibilityTime: 4000,
                      autoHide: true,
                    });
                    await set2FAEnabled(true);
      }
    router.replace("/profile");
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isComplete = otp.every((d) => d !== "");
  const canResend = true;

  return (
    <SafeAreaView className="flex-1 bg-surface">
        <View className="px-md py-sm">
  <TouchableOpacity 
    onPress={() => router.replace("/profile")}
    className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm"
  >
    <Ionicons name="arrow-back" size={24} color="#1568C4" />
  </TouchableOpacity>
</View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-md justify-center gap-xl">
          <View className="gap-sm">
            <Text className="text-primary font-bold text-3xl">
              Verify Your Email
            </Text>
            <Text className="text-secondary text-base leading-6">
              A message has been sent to{" "}
              <Text className="text-primaryBrand font-semibold">
                {contactMethod}
              </Text>
            </Text>
          </View>

          <View className="gap-lg">
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

            <View className="flex-row items-center justify-between px-xs">
              <View className="flex-row items-center gap-xs">
                <Ionicons name="time-outline" size={18} color="#7B8BAA" />
                <Text className="text-secondary text-sm font-medium">
                  {formatTime(seconds)}
                </Text>
              </View>
            </View>

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
