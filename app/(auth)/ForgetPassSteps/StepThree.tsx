import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OTP_LENGTH = 6;

export default function ForgotPasswordStep3() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

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

  const otpComplete = otp.every((d) => d !== "");
  const canSubmit =
    otpComplete && newPassword.length > 0 && confirmPassword === newPassword;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-md justify-center gap-xl py-xl">
            {/* Step Indicator */}
            <Text
              className="text-meta font-bold text-center"
              style={{
                fontSize: 10,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Step 3 of 3
            </Text>

            {/* Header */}
            <View className="gap-sm">
              <Text
                className="text-primary font-bold text-center"
                style={{ fontSize: 32, lineHeight: 40 }}
              >
                Reset Password
              </Text>
              <Text className="text-secondary text-base text-center leading-6 px-md">
                Please enter the security code sent to your device and choose a
                new secure password.
              </Text>
            </View>

            {/* OTP */}
            <View className="gap-sm">
              <Text
                className="text-meta font-bold text-center"
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Verification Code
              </Text>
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
                      className="text-primary font-bold text-2xl text-center bg-surface rounded-lg"
                      style={{
                        flex: 1,
                        height: 56,
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
            </View>

            {/* New Password */}
            <View className="gap-lg">
              <View className="gap-sm">
                <Text
                  className="text-meta font-bold text-center"
                  style={{
                    fontSize: 10,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  New Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="••••••••••••"
                    placeholderTextColor="#C9D4E8"
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="bg-surface border border-borderDefault rounded-lg px-md py-md text-primary text-base text-center pr-xl"
                  />
                  <Pressable
                    onPress={() => setShowNew(!showNew)}
                    className="absolute right-md top-0 bottom-0 justify-center"
                  >
                    <Ionicons
                      name={showNew ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#7B8BAA"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View className="gap-sm">
                <Text
                  className="text-meta font-bold text-center"
                  style={{
                    fontSize: 10,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  Confirm New Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••••••"
                    placeholderTextColor="#C9D4E8"
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="bg-surface border border-borderDefault rounded-lg px-md py-md text-primary text-base text-center pr-xl"
                    style={{
                      borderColor:
                        confirmPassword.length > 0 &&
                        confirmPassword !== newPassword
                          ? "#C84B4B"
                          : "#E3E8F4",
                    }}
                  />
                  <Pressable
                    onPress={() => setShowConfirm(!showConfirm)}
                    className="absolute right-md top-0 bottom-0 justify-center"
                  >
                    <Ionicons
                      name={showConfirm ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#7B8BAA"
                    />
                  </Pressable>
                </View>
                {confirmPassword.length > 0 &&
                  confirmPassword !== newPassword && (
                    <Text
                      className="text-xs text-center"
                      style={{ color: "#C84B4B" }}
                    >
                      Passwords do not match
                    </Text>
                  )}
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              activeOpacity={canSubmit ? 0.9 : 1}
              disabled={!canSubmit}
              className="rounded-lg py-md items-center justify-center flex-row gap-sm"
              style={{
                backgroundColor: canSubmit ? "#1568C4" : "#EEF2FA",
                shadowColor: canSubmit ? "#1568C4" : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: canSubmit ? 4 : 0,
              }}
            >
              <Text
                className="font-bold text-base"
                style={{ color: canSubmit ? "#ffffff" : "#7B8BAA" }}
              >
                Confirm Change
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={canSubmit ? "#ffffff" : "#7B8BAA"}
              />
            </TouchableOpacity>

            {/* Footer */}
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="flex-row items-center justify-center gap-xs"
            >
              <Ionicons name="arrow-back" size={16} color="#1568C4" />
              <Text className="text-primaryBrand font-bold text-sm">
                Go back to step 2
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
