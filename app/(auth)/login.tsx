import { useAuthStore } from "@/stores/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import Toast from "react-native-toast-message";
import { apiFetch } from "../../utils/apiFetch";

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

  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isIdentifierValid, setIsIdentifierValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [loading, setLoading] = useState(false);

  // Extract the bulk setter from our store
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    validateIdentifier(identifier);
  }, [identifier, authMethod]);

  useEffect(() => {
    validatePassword(password);
  }, [password]);

  const validateIdentifier = (value: string) => {
    if (!value) {
      setIdentifierError("");
      setIsIdentifierValid(false);
      return;
    }

    if (authMethod === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        setIdentifierError("Email format is valid");
        setIsIdentifierValid(true);
      } else {
        setIdentifierError("Invalid email format");
        setIsIdentifierValid(false);
      }
    } else {
      const cleanPhone = value.replace(/\s/g, "");
      const phoneRegex = /^(76|81|03|70|01|79|71)\d{6}$/;

      if (phoneRegex.test(cleanPhone)) {
        setIdentifierError("Phone number is valid");
        setIsIdentifierValid(true);
      } else {
        setIdentifierError(
          "Must be 8 digits starting with 76, 81, 03, 70, 01, 79, or 71",
        );
        setIsIdentifierValid(false);
      }
    }
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("");
      setIsPasswordValid(false);
      return;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLongEnough = value.length >= 8;

    if (!isLongEnough) {
      setPasswordError("Min 8 characters required");
      setIsPasswordValid(false);
    } else if (!hasUpperCase) {
      setPasswordError("Must contain at least one uppercase letter");
      setIsPasswordValid(false);
    } else if (!hasSpecialChar) {
      setPasswordError("Must contain at least one special character");
      setIsPasswordValid(false);
    } else {
      setPasswordError("Password meets all requirements");
      setIsPasswordValid(true);
    }
  };

  const handleSignIn = async () => {
    if (isIdentifierValid && isPasswordValid) {
      setLoading(true);
      const userObject = {
        password,
        email: authMethod === "email" ? identifier : null,
        phone: authMethod === "phone" ? identifier : null,
      };

      try {
        const response = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify(userObject),
        });

        const result = await response.json();

        if (response.status === 201) {
          // Use the bulk setter to update Zustand and SecureStore
          await setAuth(result);

          Toast.show({
            type: "success",
            text1: `Hey ${result.fullName || "there"}👋`,
            visibilityTime: 2000,
            autoHide: true,
          });

          router.replace("/(tabs)/profile");
        } else {
          Toast.show({
            type: "error",
            text1: "Login Failed",
            text2: result.message || "Something went wrong",
          });
        }
      } catch (e) {
        console.warn(e);
        Toast.show({
          text1: "Error signing in",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }
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
            <View className="mb-xl">
              <Text className="text-primary font-bold text-3xl mb-xs">
                Welcome Back
              </Text>
              <Text className="text-secondary text-base">
                Please sign in to your account.
              </Text>
            </View>

            <View className="bg-inputSurface p-xs rounded-lg flex-row mb-lg">
              <TouchableOpacity
                onPress={() => {
                  setAuthMethod("email");
                  setIdentifier("");
                }}
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
                onPress={() => {
                  setAuthMethod("phone");
                  setIdentifier("");
                }}
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

            <View className="gap-lg mb-lg">
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
                      : "+961 71000000"
                  }
                  placeholderTextColor="#7B8BAA"
                  keyboardType={
                    authMethod === "email" ? "email-address" : "numeric"
                  }
                  maxLength={authMethod === "phone" ? 8 : undefined}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className={`bg-surface border ${
                    identifier === ""
                      ? "border-borderDefault"
                      : isIdentifierValid
                        ? "border-green-500"
                        : "border-red-500"
                  } rounded-lg px-md py-md text-primary text-base`}
                />
                {identifierError !== "" && (
                  <Text
                    className={`text-[10px] mt-1 ml-xs font-medium ${isIdentifierValid ? "text-green-500" : "text-red-500"}`}
                  >
                    {identifierError}
                  </Text>
                )}
              </View>

              <View>
                <View className="flex-row justify-between items-center mb-sm px-xs">
                  <Text className="text-meta text-xs font-bold uppercase tracking-wider">
                    Password
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      router.push("/(auth)/ForgetPassSteps/StepOne");
                    }}
                  >
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
                    className={`bg-surface border ${
                      password === ""
                        ? "border-borderDefault"
                        : isPasswordValid
                          ? "border-green-500"
                          : "border-red-500"
                    } rounded-lg px-md py-md text-primary text-base pr-xl`}
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
                {passwordError !== "" && (
                  <Text
                    className={`text-[10px] mt-1 ml-xs font-medium ${isPasswordValid ? "text-green-500" : "text-red-500"}`}
                  >
                    {passwordError}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSignIn}
              disabled={!isIdentifierValid || !isPasswordValid || loading}
              activeOpacity={0.9}
              className={`rounded-lg py-md items-center justify-center mb-xl ${
                isIdentifierValid && isPasswordValid
                  ? "bg-primaryBrand"
                  : "bg-gray-400"
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-base">Sign In</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center">
              <Text className="text-secondary text-sm">
                Don&apos;t have an account?
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                className="ml-xs"
                onPress={() => {
                  router.replace("/(auth)/signup");
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
