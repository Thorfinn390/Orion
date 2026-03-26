import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

type AuthMethod = "email" | "phone";

const activeTab =
  "rounded-md items-center justify-center flex-1 py-sm px-md bg-surface flex-row gap-xs";
const inactiveTab =
  "rounded-md items-center justify-center flex-1 py-sm px-md bg-inputSurface flex-row gap-xs";
const activeText = "text-sm font-medium text-primaryBrand";
const inactiveText = "text-sm font-medium text-meta";

export default function LoginScreen() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    router.replace("/(tabs)");
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
          <View className="flex-1 justify-center px-md py-xl">
            {/* Header Section */}
            <View className="mb-xl">
              <Text className="text-primary font-bold text-3xl mb-xs">
                Welcome Back
              </Text>
              <Text className="text-secondary text-base">
                Please sign in to your account.
              </Text>
            </View>

            {/* Auth Method Toggle */}
            <View className="bg-inputSurface p-xs rounded-lg flex-row mb-lg">
              <TouchableOpacity
                onPress={() => setAuthMethod("email")}
                className={authMethod === "email" ? activeTab : inactiveTab}
                style={
                  authMethod === "email"
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
                  color={authMethod === "email" ? "#1568C4" : "#7B8BAA"}
                />
                <Text
                  className={authMethod === "email" ? activeText : inactiveText}
                >
                  Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAuthMethod("phone")}
                className={authMethod === "phone" ? activeTab : inactiveTab}
                style={
                  authMethod === "phone"
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
                  color={authMethod === "phone" ? "#1568C4" : "#7B8BAA"}
                />
                <Text
                  className={authMethod === "phone" ? activeText : inactiveText}
                >
                  Phone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Inputs */}
            <View className="gap-lg mb-lg">
              {/* Identifier Field */}
              <View>
                <Text className="text-meta text-xs font-bold uppercase tracking-wider mb-sm pl-xs">
                  {authMethod === "email" ? "Email Address" : "Phone Number"}
                </Text>
                <TextInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder={
                    authMethod === "email"
                      ? "name@example.com"
                      : "+1 (555) 000-0000"
                  }
                  placeholderTextColor="#7B8BAA"
                  keyboardType={
                    authMethod === "email" ? "email-address" : "phone-pad"
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-surface border border-borderDefault rounded-lg px-md py-md text-primary text-base"
                />
              </View>

              {/* Password Field */}
              <View>
                <View className="flex-row justify-between items-center mb-sm px-xs">
                  <Text className="text-meta text-xs font-bold uppercase tracking-wider">
                    Password
                  </Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text className="text-primaryBrand text-xs font-medium">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>
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
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              activeOpacity={0.9}
              className="bg-primaryBrand rounded-lg py-md items-center justify-center mb-xl"
            >
              <Text className="text-white font-bold text-base">Sign In</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center items-center">
              <Text className="text-secondary text-sm">
                Don&apos;t have an account?
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                className="ml-xs"
                onPress={() => {
                  router.replace("/pages/auth/signup");
                }}
              >
                <Text className="text-primaryBrand font-bold text-sm">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
