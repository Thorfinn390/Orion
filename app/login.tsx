import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import { 
    Text, View, Dimensions, TextInput, TouchableOpacity 
} from 'react-native';

const { width } = Dimensions.get('window');
const boxWidth = width - 70;
const boxHeight = boxWidth + 40;

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", confirm: "" });

  const validate = () => {
    let valid = true;
    let newErrors = { email: "", password: "", confirm: "" };

    // Regex Definitions
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const illegalCharRegex = /[^A-Za-z\d$@#%&*!?]/;
    const strengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@#%&*!?])[A-Za-z\d$@#%&*!?]{8,}$/;

    // 1. Email Validation (Both modes)
    if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }

    // 2. Password Validation (Both modes - Injection Protection)
    if (illegalCharRegex.test(password)) {
      newErrors.password = "This symbol is illegal";
      valid = false;
    } 
    // Additional Strength Check (Signup only)
    else if (isSignUp && !strengthRegex.test(password)) {
      newErrors.password = "8+ chars, upper, lower, num, symbol required";
      valid = false;
    }

    // 3. Confirm Password (Signup only)
    if (isSignUp && password !== confirmPassword) {
      newErrors.confirm = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleAuth = () => {
    if (validate()) {
      // Logic for backend call goes here
      console.log("Input sanitized. Proceeding to Voyager system...");
    }
  };

  return (
    <LinearGradient
      colors={["#142850", '#27496D', '#0C7B93', "#00A8CC"]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 items-center justify-center"
    >
      <View style={{ width: boxWidth, height: boxHeight }} className="bg-white rounded-[40px] shadow-2xl p-8 justify-between">
        <View>
          <Text className="text-3xl font-black text-slate-900 mb-1">{isSignUp ? "Join Us" : "Welcome"}</Text>
          <Text className="text-slate-400 text-sm mb-6">Securing connection...</Text>

          <View className="gap-y-3">
            {/* Email Field */}
            <View>
              <TextInput 
                placeholder="Email"
                onChangeText={(val) => { setEmail(val); setErrors({...errors, email: ""}); }}
                autoCapitalize="none"
                className={`w-full h-12 bg-slate-50 rounded-xl px-4 border ${errors.email ? 'border-red-400' : 'border-slate-100'}`}
              />
              {errors.email ? <Text className="text-[10px] text-red-500 font-bold self-end mt-1">{errors.email}</Text> : null}
            </View>

            {/* Password Field */}
            <View>
              <TextInput 
                placeholder="Password"
                onChangeText={(val) => { setPassword(val); setErrors({...errors, password: ""}); }}
                secureTextEntry
                className={`w-full h-12 bg-slate-50 rounded-xl px-4 border ${errors.password ? 'border-red-400' : 'border-slate-100'}`}
              />
              {errors.password ? <Text className="text-[10px] text-red-500 font-bold self-end mt-1">{errors.password}</Text> : null}
            </View>

            {/* Confirm Password Field */}
            {isSignUp && (
              <View>
                <TextInput 
                  placeholder="Confirm Password"
                  onChangeText={(val) => { setConfirmPassword(val); setErrors({...errors, confirm: ""}); }}
                  secureTextEntry
                  className={`w-full h-12 bg-slate-50 rounded-xl px-4 border ${errors.confirm ? 'border-red-400' : 'border-slate-100'}`}
                />
                {errors.confirm ? <Text className="text-[10px] text-red-500 font-bold self-end mt-1">{errors.confirm}</Text> : null}
              </View>
            )}
          </View>
        </View>

        <View className="items-center gap-y-4">
          <TouchableOpacity onPress={handleAuth} className="w-full h-14 bg-[#0C7B93] rounded-2xl items-center justify-center shadow-lg">
            <Text className="text-white font-bold text-lg">{isSignUp ? "Sign Up" : "Login"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setErrors({email:"", password:"", confirm:""}); }}>
            <Text className="text-slate-500 text-xs">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <Text className="text-[#0C7B93]s font-bold">{isSignUp ? "Login" : "Sign Up"}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}