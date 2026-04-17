import { useAuthStore } from "@/stores/useAuthStore";
import { apiFetch } from "@/utils/apiFetch";
import { router } from "expo-router";
import { ChevronLeft, Mail, MapPin, User } from "lucide-react-native";
import React, { memo, useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const InfoField = memo(
  ({ label, value, icon: Icon, isEditable = true, onChangeText }: any) => {
    return (
      <View className="mb-lg">
        <Text className="text-xs font-black text-meta uppercase tracking-[2px] mb-sm ml-1">
          {label}
        </Text>
        <View
          className={`flex-row items-center bg-white border ${
            isEditable
              ? "border-borderDefault"
              : "border-inputSurface bg-inputSurface/30"
          } rounded-2xl px-md py-md shadow-sm`}
        >
          <View className="w-10 h-10 rounded-xl bg-inputSurface items-center justify-center mr-md">
            <Icon
              size={20}
              color={isEditable ? "#1568C4" : "#7B8BAA"}
              strokeWidth={2}
            />
          </View>
          <TextInput
            className="flex-1 text-base font-bold text-primary"
            value={value}
            editable={isEditable}
            onChangeText={onChangeText}
            placeholderTextColor="#7B8BAA"
            spellCheck={false}
            autoCorrect={false}
          />
          {!isEditable && (
            <View className="bg-borderEmphasis/20 px-sm py-1 rounded-full">
              <Text className="text-[10px] font-bold text-meta uppercase">
                Locked
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  },
);

InfoField.displayName = "InfoField";

export default function PersonalInformationScreen() {
  const storeFullName = useAuthStore((state) => state.fullName);
  const storeEmail = useAuthStore((state) => state.email);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setFullName = useAuthStore((state) => state.setFullName);

  const [formData, setFormData] = useState({
    fullName: storeFullName || "",
    email: storeEmail || "",
    location: "Beirut, Lebanon",
  });

  const [loading, setLoading] = useState(false);

  const handleUpdate = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    if (loading) return;

    if (!formData.fullName.trim()) {
      Toast.show({
        type: "error",
        text1: "Required Field",
        text2: "Name cannot be empty.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch("/user/change-name", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: formData.fullName,
        }),
      });

      const result = await response.json();

      if (response.status === 200 || response.status === 201) {
        await setFullName(formData.fullName);

        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your information was saved successfully.",
          autoHide: true,
          visibilityTime: 2000,
        });

        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Update Failed",
          text2: result.message || "Something went wrong",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Could not connect to the server.",
      });
    } finally {
      setLoading(false);
    }
  };

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

          <TouchableOpacity
            className={`bg-primaryBrand px-lg py-sm rounded-full shadow-lg ${
              loading || formData.fullName === storeFullName
                ? "opacity-50"
                : "active:opacity-80"
            }`}
            onPress={handleSave}
            disabled={loading || formData.fullName === storeFullName}
          >
            <Text className="text-white font-black text-sm uppercase tracking-wider">
              {loading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 40,
          }}
        >
          <View className="items-center mb-2xl">
            <View className="relative">
              <View className="w-32 h-32 rounded-[40px] bg-primaryBrand items-center justify-center shadow-2xl rotate-3">
                <View className="-rotate-3 flex items-center justify-center">
                  <User size={50} color="#FFFFFF" strokeWidth={1.5} />
                </View>
              </View>
            </View>
            <Text className="mt-lg text-2xl font-black text-primary">
              Personal Information
            </Text>
            <Text className="text-meta font-medium">
              Manage how you appear on the platform
            </Text>
          </View>

          <InfoField
            label="Full Name"
            value={formData.fullName}
            icon={User}
            onChangeText={(t: string) => handleUpdate("fullName", t)}
          />

          <InfoField
            label="Email Address"
            value={formData.email}
            icon={Mail}
            isEditable={false}
          />

          <InfoField
            label="Location"
            value={formData.location}
            icon={MapPin}
            onChangeText={(t: string) => handleUpdate("location", t)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
