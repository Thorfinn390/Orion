import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

  const [fullNameError, setFullNameError] = useState("");
  const [contactError, setContactError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [isFullNameValid, setIsFullNameValid] = useState(false);
  const [isContactValid, setIsContactValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmValid, setIsConfirmValid] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    validateFullName(fullName);
  }, [fullName]);

  useEffect(() => {
    validateContact(contact);
  }, [contact, contactMethod]);

  useEffect(() => {
    validatePassword(password);
    validateConfirm(password, confirmPassword);
  }, [password, confirmPassword]);

  const validateFullName = (val: string) => {
    if (!val) {
      setFullNameError("");
      setIsFullNameValid(false);
    } else if (val.trim().length < 3) {
      setFullNameError("Name is too short");
      setIsFullNameValid(false);
    } else {
      setFullNameError("Looks good");
      setIsFullNameValid(true);
    }
  };

  const validateContact = (val: string) => {
    if (!val) {
      setContactError("");
      setIsContactValid(false);
      return;
    }

    if (contactMethod === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(val)) {
        setContactError("Email is valid");
        setIsContactValid(true);
      } else {
        setContactError("Invalid email address");
        setIsContactValid(false);
      }
    } else {
      const cleanPhone = val.replace(/\s/g, "");
      const phoneRegex = /^(76|81|03|70|01|79|71)\d{6}$/;
      if (phoneRegex.test(cleanPhone)) {
        setContactError("Phone number is valid");
        setIsContactValid(true);
      } else {
        setContactError("Start with 76, 81, 03, 70, 01, 79, or 71 (8 digits)");
        setIsContactValid(false);
      }
    }
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError("");
      setIsPasswordValid(false);
      return;
    }
    const hasUpperCase = /[A-Z]/.test(val);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(val);
    const isLongEnough = val.length >= 8;

    if (!isLongEnough) {
      setPasswordError("Min 8 characters required");
      setIsPasswordValid(false);
    } else if (!hasUpperCase) {
      setPasswordError("At least one uppercase letter required");
      setIsPasswordValid(false);
    } else if (!hasSpecialChar) {
      setPasswordError("At least one special character required");
      setIsPasswordValid(false);
    } else {
      setPasswordError("Strong password");
      setIsPasswordValid(true);
    }
  };

  const validateConfirm = (pass: string, conf: string) => {
    if (!conf) {
      setConfirmError("");
      setIsConfirmValid(false);
    } else if (pass !== conf) {
      setConfirmError("Passwords do not match");
      setIsConfirmValid(false);
    } else {
      setConfirmError("Passwords match");
      setIsConfirmValid(true);
    }
  };

  const canSubmit =
    isFullNameValid && isContactValid && isPasswordValid && isConfirmValid;
  // agreed;

  const handleCreateAccount = async () => {
    if (canSubmit) {
      setLoading(true);
      const data: {
        fullName: string;
        password: string;
        email: string | null;
        phone: string | null;
      } = {
        fullName,
        password,
        email: contactMethod === "email" ? contact : null,
        phone: contactMethod === "phone" ? contact : null,
      };

      console.log("HERE");
      try {
        const response = await fetch(
          `http://${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/signUp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
        );
        console.log("here 2");
        const result = await response.json();
        console.log("here 3");
        if (response.ok) {
          Toast.show({
            type: "success",
            text1: "Account Created",
            text2: "Welcome to Orion! 👋",
            visibilityTime: 2000,
          });
          router.push("/(auth)/OTP");
        } else {
          Toast.show({
            type: "error",
            text1: "Sign Up Failed",
            text2: result.message || "Something went wrong",
          });
        }
      } catch (error) {
        console.log(error);
        Toast.show({
          type: "error",
          text1: "Connection Error",
          text2: "Please check your internet connection.",
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
          <View className="flex-1 px-md py-xl">
            <View className="mb-xl">
              <Text className="text-primary font-bold text-3xl mb-xs">
                Create your account
              </Text>
              <Text className="text-secondary text-base">
                Start your premium travel experience today.
              </Text>
            </View>

            <View className="gap-lg">
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
                  className={`bg-surface border rounded-lg px-md py-md text-primary text-base ${
                    fullName === ""
                      ? "border-borderDefault"
                      : isFullNameValid
                        ? "border-green-500"
                        : "border-red-500"
                  }`}
                />
                {fullNameError !== "" && (
                  <Text
                    className={`text-[10px] ml-xs font-medium ${isFullNameValid ? "text-green-500" : "text-red-500"}`}
                  >
                    {fullNameError}
                  </Text>
                )}
              </View>

              <View className="gap-sm">
                <Text className="text-meta text-xs font-bold uppercase tracking-wider pl-xs">
                  Contact Information
                </Text>

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
                      contactMethod === "email" ? { elevation: 2 } : undefined
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
                      contactMethod === "phone" ? { elevation: 2 } : undefined
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

                <TextInput
                  value={contact}
                  onChangeText={setContact}
                  placeholder={
                    contactMethod === "email"
                      ? "alex@concierge.com"
                      : "+961 71000000"
                  }
                  placeholderTextColor="#7B8BAA"
                  keyboardType={
                    contactMethod === "email" ? "email-address" : "numeric"
                  }
                  maxLength={contactMethod === "phone" ? 8 : undefined}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className={`bg-surface border rounded-lg px-md py-md text-primary text-base ${
                    contact === ""
                      ? "border-borderDefault"
                      : isContactValid
                        ? "border-green-500"
                        : "border-red-500"
                  }`}
                />
                {contactError !== "" && (
                  <Text
                    className={`text-[10px] ml-xs font-medium ${isContactValid ? "text-green-500" : "text-red-500"}`}
                  >
                    {contactError}
                  </Text>
                )}
              </View>

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
                    className={`bg-surface border rounded-lg px-md py-md text-primary text-base pr-xl ${
                      password === ""
                        ? "border-borderDefault"
                        : isPasswordValid
                          ? "border-green-500"
                          : "border-red-500"
                    }`}
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
                    className={`text-[10px] ml-xs font-medium ${isPasswordValid ? "text-green-500" : "text-red-500"}`}
                  >
                    {passwordError}
                  </Text>
                )}
              </View>

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
                    className={`bg-surface border rounded-lg px-md py-md text-primary text-base pr-xl ${
                      confirmPassword === ""
                        ? "border-borderDefault"
                        : isConfirmValid
                          ? "border-green-500"
                          : "border-red-500"
                    }`}
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
                {confirmError !== "" && (
                  <Text
                    className={`text-[10px] ml-xs font-medium ${isConfirmValid ? "text-green-500" : "text-red-500"}`}
                  >
                    {confirmError}
                  </Text>
                )}
              </View>

              {/* <TouchableOpacity
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
              </TouchableOpacity> */}
            </View>

            <TouchableOpacity
              onPress={handleCreateAccount}
              disabled={!canSubmit}
              activeOpacity={0.9}
              className={`rounded-lg py-md items-center justify-center mt-xl mb-lg flex-row gap-sm ${
                canSubmit ? "bg-primaryBrand" : "bg-gray-400"
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Create Orion Account
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mb-lg">
              <Text className="text-secondary text-sm">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  router.replace("/(auth)/login");
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
