import { useAuthStore } from "@/stores/useAuthStore";
import { apiFetch } from "@/utils/apiFetch"; // <-- ADDED IMPORT
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react-native";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PasswordKey = "currentPassword" | "newPassword" | "confirmPassword";

type PasswordFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: any;
  visible: boolean;
  onToggleVisible: () => void;
  onChangeText: (value: string) => void;
  returnKeyType?: "next" | "done";
};

const PasswordField = memo(
  ({
    label,
    value,
    placeholder,
    icon: Icon,
    visible,
    onToggleVisible,
    onChangeText,
    returnKeyType = "next",
  }: PasswordFieldProps) => (
    <View className="mb-lg">
      <Text className="text-xs font-black text-meta uppercase tracking-[2px] mb-sm ml-1">
        {label}
      </Text>
      <View className="flex-row items-center bg-white border border-borderDefault rounded-2xl px-md py-sm shadow-sm">
        <View className="w-10 h-10 rounded-xl bg-inputSurface items-center justify-center mr-md">
          <Icon size={20} color="#1568C4" strokeWidth={2} />
        </View>
        <TextInput
          className="flex-1 text-base font-bold text-primary py-sm"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#7B8BAA"
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          returnKeyType={returnKeyType}
        />
        <TouchableOpacity
          onPress={onToggleVisible}
          className="w-10 h-10 rounded-full bg-surface items-center justify-center ml-sm"
        >
          {visible ? (
            <EyeOff size={19} color="#7B8BAA" strokeWidth={2} />
          ) : (
            <Eye size={19} color="#7B8BAA" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  ),
);

PasswordField.displayName = "PasswordField";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [visibleFields, setVisibleFields] = useState<Record<PasswordKey, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const[loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    const value = passwords.newPassword;
    let score = 0;

    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score >= 4) return { label: "Strong", color: "#1A7A48" };
    if (score >= 2) return { label: "Good", color: "#E8A020" };
    return { label: "Weak", color: "#C84B4B" };
  }, [passwords.newPassword]);

  const canSubmit =
    passwords.currentPassword.trim().length > 0 &&
    passwords.newPassword.trim().length > 0 &&
    passwords.confirmPassword.trim().length > 0 &&
    !loading;

  const updatePasswordValue = useCallback((key: PasswordKey, value: string) => {
    setPasswords((current) => ({ ...current, [key]: value }));
  },[]);

  const toggleVisible = useCallback((key: PasswordKey) => {
    setVisibleFields((current) => ({ ...current, [key]: !current[key] }));
  },[]);

  const validatePasswordForm = useCallback(() => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      Alert.alert("Missing Password", "Please fill out all password fields.");
      return false;
    }

    if (passwords.newPassword.length < 8) {
      Alert.alert(
        "Password Too Short",
        "Your new password must be at least 8 characters long.",
      );
      return false;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      Alert.alert(
        "Choose a New Password",
        "Your new password must be different from your current password.",
      );
      return false;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      Alert.alert(
        "Passwords Do Not Match",
        "New password and confirmation password must match.",
      );
      return false;
    }

    return true;
  }, [passwords]);

  // ▼ ▼ ▼ UPDATED FUNCTION ▼ ▼ ▼
  const handleChangePassword = useCallback(async () => {
    if (loading || !validatePasswordForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await apiFetch("/user/change-password", {
        method: "PATCH", // Note: Using PATCH because your Express route is userRouter.patch("/change-password")
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      // Handle backend error responses (400, 401, etc.)
      if (!response.ok || payload.status === false) {
        throw new Error(payload.message || "Failed to update password.");
      }

      Alert.alert(
        "Password Updated",
        payload.message || "Your password has been updated. Please sign in again.",[
          {
            text: "Sign In",
            onPress: () => {
              void clearAuth();
              router.back(); // Navigate back to the previous screen (which should be the login screen);
            },
            
          },
        ],
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update password.";

      Alert.alert("Password Update Failed", message);
    } finally {
      setLoading(false);
    }
  },[clearAuth, loading, passwords, router, validatePasswordForm]);
  // ▲ ▲ ▲ END UPDATED FUNCTION ▲ ▲ ▲

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="px-md py-sm flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-white border border-borderDefault items-center justify-center shadow-sm"
          >
            <ChevronLeft size={24} color="#0D1A3A" />
          </TouchableOpacity>
          <Text className="text-base font-black text-primary">
            Change Password
          </Text>
          <View className="w-11" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-md pt-lg pb-2xl">
            <View className="items-center mb-2xl">
              <View className="w-24 h-24 rounded-[30px] bg-primaryBrand items-center justify-center shadow-card rotate-3">
                <View className="-rotate-3">
                  <ShieldCheck size={42} color="#FFFFFF" strokeWidth={1.6} />
                </View>
              </View>
              <Text className="mt-lg text-2xl font-black text-primary">
                Refresh Your Secret Key
              </Text>
              <Text className="text-meta text-center text-sm leading-6 mt-xs max-w-[300px]">
                Use a password you do not use anywhere else.
              </Text>
            </View>

            <PasswordField
              label="Current Password"
              value={passwords.currentPassword}
              placeholder="Enter current password"
              icon={LockKeyhole}
              visible={visibleFields.currentPassword}
              onToggleVisible={() => toggleVisible("currentPassword")}
              onChangeText={(value) => updatePasswordValue("currentPassword", value)}
            />

            <PasswordField
              label="New Password"
              value={passwords.newPassword}
              placeholder="At least 8 characters"
              icon={KeyRound}
              visible={visibleFields.newPassword}
              onToggleVisible={() => toggleVisible("newPassword")}
              onChangeText={(value) => updatePasswordValue("newPassword", value)}
            />

            <View className="bg-white border border-borderDefault rounded-2xl px-md py-md mb-lg shadow-sm">
              <View className="flex-row items-center justify-between mb-sm">
                <Text className="text-sm font-black text-primary">
                  Password Strength
                </Text>
                <Text className="text-xs font-black text-meta uppercase tracking-widest">
                  {passwordStrength.label}
                </Text>
              </View>
              <View className="h-2 bg-inputSurface rounded-full overflow-hidden">
                <View
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: passwordStrength.color,
                    width:
                      passwords.newPassword.length >= 8
                        ? "100%"
                        : passwords.newPassword.length >= 4
                          ? "50%"
                          : "25%",
                  }}
                />
              </View>
            </View>

            <PasswordField
              label="Confirm Password"
              value={passwords.confirmPassword}
              placeholder="Re-enter new password"
              icon={ShieldCheck}
              visible={visibleFields.confirmPassword}
              onToggleVisible={() => toggleVisible("confirmPassword")}
              onChangeText={(value) => updatePasswordValue("confirmPassword", value)}
              returnKeyType="done"
            />

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={!canSubmit}
              activeOpacity={0.86}
              className="rounded-[20px] py-lg items-center justify-center flex-row mt-sm shadow-card"
              style={{
                backgroundColor: canSubmit ? "#1568C4" : "#EEF2FA",
              }}
            >
              {loading ? (
                <ActivityIndicator key="loading" size="small" color="#FFFFFF" />
              ) : (
                <Text
                  key="label"
                  className="font-black text-base uppercase tracking-widest"
                  style={{ color: canSubmit ? "#FFFFFF" : "#7B8BAA" }}
                >
                  Update Password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}