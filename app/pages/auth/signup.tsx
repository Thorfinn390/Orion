import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
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

type ContactMethod = "email" | "phone";

const activeTab =
  "flex-1 flex-row items-center justify-center gap-xs py-sm rounded-md bg-surface";
const inactiveTab =
  "flex-1 flex-row items-center justify-center gap-xs py-sm rounded-md bg-inputSurface";
const activeTabText = "text-sm font-semibold text-primaryBrand";
const inactiveTabText = "text-sm font-semibold text-secondary";

export default function SignUpScreen() {
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email");
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleCreateAccount = () => {
    router.push("/pages/auth/OTP");
  };

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
          <View className="flex-1 px-md py-xl">
            {/* Header */}
            <View className="mb-xl">
              <Text className="text-primary font-bold text-3xl mb-xs">
                Create your account
              </Text>
              <Text className="text-secondary text-base">
                Start your premium travel experience today.
              </Text>
            </View>

            {/* Form */}
            <View className="gap-lg">
              {/* Full Name */}
              <View className="gap-sm">
                <Text className="text-meta text-xs font-bold uppercase tracking-wider pl-xs">
                  Full Name
                </Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Alex Sterling"
                  placeholderTextColor="#7B8BAA"
                  autoCapitalize="words"
                  autoCorrect={false}
                  className="bg-surface border border-borderDefault rounded-lg px-md py-md text-primary text-base"
                />
              </View>

              {/* Contact Information */}
              <View className="gap-sm">
                <Text className="text-meta text-xs font-bold uppercase tracking-wider pl-xs">
                  Contact Information
                </Text>

                {/* Toggle */}
                <View className="bg-inputSurface p-xs rounded-lg flex-row">
                  <TouchableOpacity
                    onPress={() => {
                      setContactMethod("email");
                      setContact("");
                    }}
                    className={
                      contactMethod === "email" ? activeTab : inactiveTab
                    }
                    style={
                      contactMethod === "email"
                        ? {
                            shadowColor: "#0D1A3A",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 8,
                            elevation: 2,
                          }
                        : undefined
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={16}
                      color={contactMethod === "email" ? "#1568C4" : "#3A4863"}
                    />
                    <Text
                      className={
                        contactMethod === "email"
                          ? activeTabText
                          : inactiveTabText
                      }
                    >
                      Email
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setContactMethod("phone");
                      setContact("");
                    }}
                    className={
                      contactMethod === "phone" ? activeTab : inactiveTab
                    }
                    style={
                      contactMethod === "phone"
                        ? {
                            shadowColor: "#0D1A3A",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 8,
                            elevation: 2,
                          }
                        : undefined
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={16}
                      color={contactMethod === "phone" ? "#1568C4" : "#3A4863"}
                    />
                    <Text
                      className={
                        contactMethod === "phone"
                          ? activeTabText
                          : inactiveTabText
                      }
                    >
                      Phone
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Contact Input */}
                <TextInput
                  value={contact}
                  onChangeText={setContact}
                  placeholder={
                    contactMethod === "email"
                      ? "alex@concierge.com"
                      : "+1 (555) 000-0000"
                  }
                  placeholderTextColor="#7B8BAA"
                  keyboardType={
                    contactMethod === "email" ? "email-address" : "phone-pad"
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-surface border border-borderDefault rounded-lg px-md py-md text-primary text-base"
                />
              </View>

              {/* Password */}
              <View className="gap-sm">
                <Text className="text-meta text-xs font-bold uppercase tracking-wider pl-xs">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#7B8BAA"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="bg-surface border border-borderDefault rounded-lg px-md py-md text-primary text-base pr-xl"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-md top-0 bottom-0 justify-center"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#7B8BAA"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View className="gap-sm">
                <Text className="text-meta text-xs font-bold uppercase tracking-wider pl-xs">
                  Confirm Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#7B8BAA"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="bg-surface border border-borderDefault rounded-lg px-md py-md text-primary text-base pr-xl"
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-md top-0 bottom-0 justify-center"
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color="#7B8BAA"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Terms */}
              <TouchableOpacity
                onPress={() => setAgreed(!agreed)}
                activeOpacity={0.7}
                className="flex-row items-start gap-sm"
              >
                <View
                  className="mt-xs rounded-md items-center justify-center"
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: agreed ? "#1568C4" : "#F4F6FB",
                    borderWidth: 1.5,
                    borderColor: agreed ? "#1568C4" : "#C9D4E8",
                  }}
                >
                  {agreed && (
                    <Ionicons name="checkmark" size={13} color="#ffffff" />
                  )}
                </View>
                <Text className="text-secondary text-xs leading-5 flex-1">
                  I agree to the{" "}
                  <Text className="text-primaryBrand font-semibold">
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text className="text-primaryBrand font-semibold">
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleCreateAccount}
              activeOpacity={0.9}
              className="bg-primaryBrand rounded-lg py-md items-center justify-center mt-xl mb-lg flex-row gap-sm"
              style={{
                shadowColor: "#1568C4",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <Text className="text-white font-bold text-base">
                Create Orion Account
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center items-center mb-lg">
              <Text className="text-secondary text-sm">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  router.replace("/pages/auth/login");
                }}
              >
                <Text className="text-primaryBrand font-bold text-sm">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
