import { useAuthStore } from "@/stores/useAuthStore";
import {
  confirmTwoFactorChange,
  startTwoFactorChange,
} from "@/utils/securityApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowRight,
  ChevronLeft,
  Clock3,
  RotateCcw,
  ShieldCheck,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OTP_LENGTH = 6;
const OTP_SECONDS = 594;

type TwoFactorAction = "enable" | "disable";

const getParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function TwoFactorConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const stored2FAState = useAuthStore((state) => state.is_2fa_enabled);
  const set2FAEnabled = useAuthStore((state) => state.setIs2faEnabled);

  const actionParam = getParamValue(params.action) as TwoFactorAction | undefined;
  const contactMethod = getParamValue(params.contactMethod) || "your email";
  const action: TwoFactorAction =
    actionParam === "enable" || actionParam === "disable"
      ? actionParam
      : stored2FAState
        ? "disable"
        : "enable";
  const nextEnabled = action === "enable";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(OTP_SECONDS);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/(profile)/securityAndPassword");
      return true;
    });

    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    if (seconds === 0) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds((current) => current - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const screenCopy = useMemo(
    () => ({
      title: nextEnabled ? "Enable 2FA" : "Disable 2FA",
      subtitle: nextEnabled
        ? "Enter the verification code we sent before two-factor authentication is enabled."
        : "Enter the verification code we sent before two-factor authentication is disabled.",
      successTitle: nextEnabled ? "2FA Enabled" : "2FA Disabled",
      successMessage: nextEnabled
        ? "Two-factor authentication is now protecting your account."
        : "Two-factor authentication has been disabled for your account.",
      submitLabel: nextEnabled ? "Enable Protection" : "Disable 2FA",
    }),
    [nextEnabled],
  );

  const formatTime = useCallback((value: number) => {
    const minutes = Math.floor(value / 60);
    const remainingSeconds = value % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }, []);

  const handleChange = useCallback((text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);

    setOtp((current) => {
      const nextOtp = [...current];
      nextOtp[index] = digit;
      return nextOtp;
    });

    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback((event: any, index: number) => {
    if (event.nativeEvent.key !== "Backspace" || otp[index] || index === 0) {
      return;
    }

    setOtp((current) => {
      const nextOtp = [...current];
      nextOtp[index - 1] = "";
      return nextOtp;
    });
    inputs.current[index - 1]?.focus();
  }, [otp]);

  const handleConfirm = useCallback(async () => {
    const otpString = otp.join("");

    if (otpString.length !== OTP_LENGTH) {
      Alert.alert("Invalid Code", "Please enter the full verification code.");
      return;
    }

    try {
      setLoading(true);
      await confirmTwoFactorChange(nextEnabled, otpString);
      await set2FAEnabled(nextEnabled);

      Alert.alert(screenCopy.successTitle, screenCopy.successMessage, [
        {
          text: "Done",
          onPress: () => {
            router.replace("/(profile)/securityAndPassword");
          },
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The verification code could not be confirmed.";

      Alert.alert("Verification Failed", message);
    } finally {
      setLoading(false);
    }
  }, [nextEnabled, otp, router, screenCopy, set2FAEnabled]);

  const handleResend = useCallback(async () => {
    try {
      setIsResending(true);
      await startTwoFactorChange(nextEnabled);
      setOtp(Array(OTP_LENGTH).fill(""));
      setSeconds(OTP_SECONDS);
      inputs.current[0]?.focus();
      Alert.alert("Code Sent", `A new verification code was sent to ${contactMethod}.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send a new verification code.";

      Alert.alert("Resend Failed", message);
    } finally {
      setIsResending(false);
    }
  }, [contactMethod, nextEnabled]);

  const isComplete = otp.every((digit) => digit !== "");
  const canSubmit = isComplete && !loading;
  const canResend = seconds === 0 && !isResending && !loading;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-md py-sm">
        <TouchableOpacity
          onPress={() => router.replace("/(profile)/securityAndPassword")}
          className="w-11 h-11 items-center justify-center rounded-full bg-white border border-borderDefault shadow-sm"
        >
          <ChevronLeft size={24} color="#1568C4" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-md justify-center gap-xl">
          <View className="items-center gap-md">
            <View className="w-24 h-24 rounded-[30px] bg-primaryBrand items-center justify-center shadow-card rotate-3">
              <View className="-rotate-3">
                <ShieldCheck size={42} color="#FFFFFF" strokeWidth={1.6} />
              </View>
            </View>
            <View className="items-center gap-xs">
              <Text className="text-primary font-black text-3xl">
                {screenCopy.title}
              </Text>
              <Text className="text-secondary text-base leading-6 text-center max-w-[320px]">
                {screenCopy.subtitle}{" "}
                <Text className="text-primaryBrand font-black">
                  {contactMethod}
                </Text>
              </Text>
            </View>
          </View>

          <View className="gap-lg">
            <View className="flex-row justify-between gap-sm">
              {Array(OTP_LENGTH)
                .fill(0)
                .map((_, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputs.current[index] = ref;
                    }}
                    value={otp[index]}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(event) => handleKeyPress(event, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    placeholder="0"
                    placeholderTextColor="#C9D4E8"
                    className="flex-1 h-16 rounded-xl text-primary font-black text-2xl text-center bg-white border"
                    style={{
                      borderColor:
                        focusedIndex === index || otp[index]
                          ? "#1568C4"
                          : "#E3E8F4",
                    }}
                  />
                ))}
            </View>

            <View className="flex-row items-center justify-between px-xs">
              <View className="flex-row items-center gap-xs">
                <Clock3 size={18} color="#7B8BAA" strokeWidth={2} />
                <Text className="text-secondary text-sm font-bold">
                  {formatTime(seconds)}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleResend}
                disabled={!canResend}
                className="flex-row items-center gap-xs px-sm py-xs rounded-full"
                style={{
                  backgroundColor: canResend
                    ? "rgba(21, 104, 196, 0.1)"
                    : "#EEF2FA",
                }}
              >
                {isResending ? (
                  <ActivityIndicator
                    key="resending"
                    size="small"
                    color="#1568C4"
                  />
                ) : (
                  <RotateCcw
                    key="resend-icon"
                    size={15}
                    color={canResend ? "#1568C4" : "#7B8BAA"}
                    strokeWidth={2.3}
                  />
                )}
                <Text
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: canResend ? "#1568C4" : "#7B8BAA" }}
                >
                  Resend
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={canSubmit ? 0.9 : 1}
              disabled={!canSubmit}
              className="rounded-[20px] py-lg items-center justify-center flex-row gap-sm shadow-card"
              style={{
                backgroundColor: canSubmit ? "#1568C4" : "#EEF2FA",
              }}
            >
              {loading ? (
                <ActivityIndicator key="loading" size="small" color="#FFFFFF" />
              ) : (
                <React.Fragment key="submit-content">
                  <Text
                    className="font-black text-base uppercase tracking-widest"
                    style={{ color: canSubmit ? "#FFFFFF" : "#7B8BAA" }}
                  >
                    {screenCopy.submitLabel}
                  </Text>
                  <ArrowRight
                    size={18}
                    color={canSubmit ? "#FFFFFF" : "#7B8BAA"}
                    strokeWidth={2.4}
                  />
                </React.Fragment>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
