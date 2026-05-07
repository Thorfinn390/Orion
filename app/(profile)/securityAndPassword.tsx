import { useAuthStore } from "@/stores/useAuthStore";
import {
  fetchSecurityStatus,
  requestAccountDeletion,
  startTwoFactorChange,
} from "@/utils/securityApi";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Lock,
  RefreshCw,
  Smartphone,
  Trash2,
} from "lucide-react-native";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SecurityCardProps = {
  icon: any;
  title: string;
  description: string;
  onPress?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
};

const SectionLabel = memo(({ children }: { children: React.ReactNode }) => (
  <Text className="text-xs font-black text-meta uppercase tracking-widest mb-md ml-1">
    {children}
  </Text>
));

SectionLabel.displayName = "SectionLabel";

const SecurityCard = memo(
  ({
    icon: Icon,
    title,
    description,
    onPress,
    children,
    disabled = false,
  }: SecurityCardProps) => (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      disabled={!onPress || disabled}
      className="bg-white rounded-[24px] p-lg mb-md border border-borderDefault shadow-card"
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-md flex-1 pr-md">
          <View className="w-12 h-12 rounded-xl bg-inputSurface items-center justify-center">
            <Icon size={23} color="#1568C4" strokeWidth={1.8} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-black text-primary">{title}</Text>
            <Text className="text-sm text-meta leading-5 mt-xs">
              {description}
            </Text>
          </View>
        </View>

        {children ? (
          children
        ) : (
          <View className="w-9 h-9 rounded-full bg-surface items-center justify-center">
            <ChevronRight size={18} color="#7B8BAA" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  ),
);

SecurityCard.displayName = "SecurityCard";

const SecurityStatePill = memo(
  ({ enabled, syncing }: { enabled: boolean; syncing: boolean }) => (
    <View className="flex-row items-center self-start bg-white border border-borderDefault rounded-full px-md py-sm shadow-sm">
      {syncing ? (
        <ActivityIndicator key="syncing" size="small" color="#1568C4" />
      ) : (
        <View
          key="status-dot"
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: enabled ? "#1A7A48" : "#7B8BAA" }}
        />
      )}
      <Text className="text-xs font-black text-primary uppercase tracking-widest ml-sm">
        2FA {enabled ? "On" : "Off"}
      </Text>
    </View>
  ),
);

SecurityStatePill.displayName = "SecurityStatePill";

export default function SecurityScreen() {
  const router = useRouter();
  const is2FAEnabledStored = useAuthStore((state) => state.is_2fa_enabled);
  const set2FAEnabledStored = useAuthStore((state) => state.setIs2faEnabled);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const userId = useAuthStore((state) => state.userId);
  const email = useAuthStore((state) => state.email);

  const [is2FAEnabled, setIs2FAEnabled] = useState(is2FAEnabledStored);
  const [isSyncingStatus, setIsSyncingStatus] = useState(false);
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    setIs2FAEnabled(is2FAEnabledStored);
  }, [is2FAEnabledStored]);

  const syncSecurityState = useCallback(async (showLoading = true) => {
    if (!userId) {
      if (showLoading) {
        setIsSyncingStatus(false);
      }
      setIs2FAEnabled(is2FAEnabledStored);
      return;
    }

    try {
      if (showLoading) {
        setIsSyncingStatus(true);
      }
      const status = await fetchSecurityStatus(userId);

      if (typeof status.is_2fa_enabled === "boolean") {
        setIs2FAEnabled(status.is_2fa_enabled);
        await set2FAEnabledStored(status.is_2fa_enabled);
      } else {
        setIs2FAEnabled(is2FAEnabledStored);
      }
    } catch {
      setIs2FAEnabled(is2FAEnabledStored);
    } finally {
      if (showLoading) {
        setIsSyncingStatus(false);
      }
    }
  }, [is2FAEnabledStored, set2FAEnabledStored, userId]);

  useEffect(() => {
    // TODO: Re-enable blocking startup sync when users.routes.js exposes users.controller.getUser.
    void syncSecurityState(false);
  }, [syncSecurityState]);

  const twoFactorDescription = useMemo(
    () =>
      is2FAEnabled
        ? "A verification code is required when you sign in."
        : "Add a verification code before sign-in is completed.",
    [is2FAEnabled],
  );

  const handleChangePassword = useCallback(() => {
    router.push("/(profile)/(securityandpassword)/change-password");
  }, [router]);

  const handle2FAToggle = useCallback(
    async (nextEnabled: boolean) => {
      if (isTwoFactorLoading) {
        return;
      }

      try {
        setIsTwoFactorLoading(true);
        await startTwoFactorChange(nextEnabled);

        const contactMethod = encodeURIComponent(email || "your email");
        router.push(
          `/(profile)/(securityandpassword)/2faconfirm?action=${
            nextEnabled ? "enable" : "disable"
          }&contactMethod=${contactMethod}`,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to update two-factor authentication.";

        Alert.alert("2FA Update Failed", message);
      } finally {
        setIsTwoFactorLoading(false);
      }
    },
    [email, isTwoFactorLoading, router],
  );

  const completeAccountDeletion = useCallback(async () => {
    if (isDeletingAccount) {
      return;
    }

    try {
      setIsDeletingAccount(true);
      const payload = await requestAccountDeletion();

      Alert.alert(
        "Deletion Requested",
        payload.message ||
          "Your account deletion request was sent successfully. Please check your email for confirmation.",
        [
          {
            text: "OK",
            onPress: () => {
              void clearAuth();
              router.replace("/(auth)/login");
            },
          },
        ],
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to request account deletion.";

      Alert.alert("Request Failed", message);
    } finally {
      setIsDeletingAccount(false);
    }
  }, [clearAuth, isDeletingAccount, router]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "Are you sure?",
      "This is irreversible. Your account, flight history, and preferences will be scheduled for deletion.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request Deletion",
          style: "destructive",
          onPress: () => {
            void completeAccountDeletion();
          },
        },
      ],
    );
  }, [completeAccountDeletion]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-md py-sm flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-white border border-borderDefault items-center justify-center shadow-sm"
        >
          <ChevronLeft size={24} color="#0D1A3A" />
        </TouchableOpacity>
        <Text className="text-base font-black text-primary">
          Security Center
        </Text>
        <TouchableOpacity
          onPress={() => void syncSecurityState()}
          disabled={isSyncingStatus}
          className="w-11 h-11 rounded-full bg-white border border-borderDefault items-center justify-center shadow-sm"
        >
          {isSyncingStatus ? (
            <ActivityIndicator key="syncing" size="small" color="#1568C4" />
          ) : (
            <RefreshCw
              key="refresh"
              size={18}
              color="#1568C4"
              strokeWidth={2.2}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-md pt-lg pb-2xl">
          <View className="mb-xl">
            <View className="w-16 h-16 rounded-[20px] bg-primaryBrand items-center justify-center shadow-card mb-md">
              <Lock size={28} color="#FFFFFF" strokeWidth={1.7} />
            </View>
            <Text className="text-3xl font-black text-primary tracking-tight">
              Protect your{"\n"}
              <Text className="text-primaryBrand">digital identity.</Text>
            </Text>
            <Text className="text-sm text-meta leading-6 mt-sm max-w-[320px]">
              Keep your sign-in credentials current and decide how your account
              should be protected.
            </Text>
            <View className="mt-md">
              <SecurityStatePill
                enabled={is2FAEnabled}
                syncing={isSyncingStatus}
              />
            </View>
          </View>

          <SectionLabel>Access Control</SectionLabel>

          <SecurityCard
            icon={KeyRound}
            title="Password"
            description="Update your secret key regularly to keep your account safe."
            onPress={handleChangePassword}
          />

          <SecurityCard
            icon={Smartphone}
            title="2FA Authentication"
            description={twoFactorDescription}
            disabled={isTwoFactorLoading}
          >
            <View className="min-w-14 items-end">
              {isTwoFactorLoading ? (
                <ActivityIndicator
                  key="two-factor-loading"
                  size="small"
                  color="#1568C4"
                />
              ) : (
                <Switch
                  key="two-factor-switch"
                  value={is2FAEnabled}
                  onValueChange={handle2FAToggle}
                  disabled={isTwoFactorLoading}
                  trackColor={{ false: "#E3E8F4", true: "#1568C4" }}
                  thumbColor="#FFFFFF"
                />
              )}
            </View>
          </SecurityCard>

          <SectionLabel>Privacy & Data</SectionLabel>

          <View className="mt-sm p-lg rounded-[24px] bg-white border border-statusUL/20 border-dashed shadow-card">
            <View className="flex-row items-center gap-sm mb-sm">
              <View className="w-10 h-10 rounded-xl bg-statusUL/10 items-center justify-center">
                <Trash2 size={19} color="#C84B4B" strokeWidth={2} />
              </View>
              <Text className="text-statusUL font-black text-lg">
                Danger Zone
              </Text>
            </View>
            <Text className="text-meta text-sm leading-6 mb-lg">
              Deleting your account is irreversible. Your profile, flight
              history, and preferences will be wiped from Orion after the
              backend retention period completes.
            </Text>
            <TouchableOpacity
              onPress={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="bg-statusUL/5 py-md rounded-xl border border-statusUL/20 items-center"
              style={{ opacity: isDeletingAccount ? 0.6 : 1 }}
            >
              {isDeletingAccount ? (
                <ActivityIndicator
                  key="deleting"
                  size="small"
                  color="#C84B4B"
                />
              ) : (
                <Text key="delete-label" className="text-statusUL font-black">
                  Request Account Deletion
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text className="text-center text-meta text-xs mt-xl">
            Security Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
