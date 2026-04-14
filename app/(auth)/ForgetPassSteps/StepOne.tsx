import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ContactMethod = "email" | "phone";

const activeTab =
  "flex-1 py-sm rounded-md items-center justify-center bg-surface";
const inactiveTab =
  "flex-1 py-sm rounded-md items-center justify-center bg-inputSurface";
const activeTabText = "text-sm font-medium text-primaryBrand";
const inactiveTabText = "text-sm font-medium text-meta";

export default function ForgotPasswordStep1() {
  const router = useRouter();
  const [method, setMethod] = useState<ContactMethod>("email");
  const [contact, setContact] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-md justify-center gap-xl">
          {/* Step Indicator */}
          <Text
            className="text-meta font-bold text-center"
            style={{
              fontSize: 10,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Step 1 of 3
          </Text>

          {/* Header */}
          <View className="gap-sm">
            <Text
              className="text-primary font-bold text-center"
              style={{ fontSize: 32, lineHeight: 40 }}
            >
              Forgot Password?
            </Text>
            <Text className="text-secondary text-base text-center leading-6 px-md">
              Enter your email or phone number and we will send you a link to
              reset your password.
            </Text>
          </View>

          {/* Form Card */}
          <View className="gap-lg">
            {/* Toggle */}
            <View className="bg-inputSurface p-xs rounded-lg flex-row">
              <TouchableOpacity
                onPress={() => {
                  setMethod("email");
                  setContact("");
                }}
                className={method === "email" ? activeTab : inactiveTab}
                style={
                  method === "email"
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
                <Text
                  className={
                    method === "email" ? activeTabText : inactiveTabText
                  }
                >
                  Email address
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setMethod("phone");
                  setContact("");
                }}
                className={method === "phone" ? activeTab : inactiveTab}
                style={
                  method === "phone"
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
                <Text
                  className={
                    method === "phone" ? activeTabText : inactiveTabText
                  }
                >
                  Phone number
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input */}
            <View className="gap-sm">
              <Text
                className="text-meta font-bold text-center"
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {method === "email" ? "Email Address" : "Phone Number"}
              </Text>
              <View className="relative">
                <View
                  className="absolute left-md top-0 bottom-0 justify-center"
                  style={{ zIndex: 1 }}
                >
                  <Ionicons
                    name={
                      method === "email"
                        ? "mail-outline"
                        : "phone-portrait-outline"
                    }
                    size={18}
                    color="#7B8BAA"
                  />
                </View>
                <TextInput
                  value={contact}
                  onChangeText={setContact}
                  placeholder={
                    method === "email"
                      ? "name@company.com"
                      : "+1 (555) 000-0000"
                  }
                  placeholderTextColor="#7B8BAA"
                  keyboardType={
                    method === "email" ? "email-address" : "phone-pad"
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-surface border border-borderDefault rounded-lg py-md text-primary text-base"
                  style={{ paddingLeft: 44, paddingRight: 16 }}
                />
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/ForgetPassSteps/StepTwo")}
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
              <Text className="text-white font-bold text-base">
                Send Reset Link
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="flex-row items-center justify-center gap-xs"
          >
            <Ionicons name="arrow-back" size={16} color="#1568C4" />
            <Text className="text-primaryBrand font-bold text-sm">
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
