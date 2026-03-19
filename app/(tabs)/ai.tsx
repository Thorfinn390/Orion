import { Send, Sparkles } from "lucide-react-native";
import React, { useState } from "react";
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

export default function AIScreen() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: "1",
      role: "assistant",
      text: "Hello Alex! I'm monitoring your flight EK 202. Traffic to the airport is building up, so I suggest leaving 15 minutes earlier than planned. How else can I assist you?",
    },
  ]);

  /*
   * ==========================================
   * OLLAMA LOCAL MODEL INTEGRATION GUIDE
   * ==========================================
   * To use a local Ollama model instead of a cloud API:
   *
   * 1. Start Ollama locally (e.g., `ollama run llama3`).
   * 2. Configure Ollama to accept connections from your emulator/device by setting
   *    the OLLAMA_HOST environment variable to 0.0.0.0 before starting the service.
   *    (e.g., in terminal: OLLAMA_HOST="0.0.0.0" ollama serve)
   * 3. Set the Correct Localhost IP for your environment:
   *    - Android Emulator: 10.0.2.2 maps to your computer's localhost.
   *    - iOS Simulator: 127.0.0.1 or localhost.
   *    - Physical Device: Use your computer's local Wi-Fi IP address (e.g., 192.168.x.x).
   *
   * Integration Example:
   *
   * const fetchOllamaResponse = async (prompt: string) => {
   *   const response = await fetch('http://10.0.2.2:11434/api/generate', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({
   *       model: 'llama3', // Must match the model you have downloaded locally
   *       prompt: prompt,
   *       stream: false
   *     })
   *   });
   *   const data = await response.json();
   *   return data.response;
   * };
   */

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // 1. Instantly add user message to the UI
    const newUserMsg = {
      id: Date.now().toString(),
      role: "user",
      text: message,
    };
    setChatHistory((prev) => [...prev, newUserMsg]);
    setMessage("");

    // 2. Uncomment below and insert your fetch logic to interact with Ollama
    // fetchOllamaResponse(message).then(response => {
    //   setChatHistory(prev => [...prev, { id: Date.now().toString(), role: "assistant", text: response }]);
    // }).catch(err => console.error("Ollama error:", err));
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="flex-1">
        <View className="px-6 py-4 bg-white border-b border-slate-100 flex-row items-center gap-3">
          <View className="bg-indigo-50 p-2 rounded-xl">
            <Sparkles size={20} color="#4f46e5" />
          </View>
          <View>
            <Text className="text-xl font-black text-slate-900">
              SkyGuide AI
            </Text>
            <Text className="text-slate-500 text-xs font-medium">
              Always here to help
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-4 py-6"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {chatHistory.map((chat) => (
            <View
              key={chat.id}
              className={`flex-row gap-3 mb-6 ${chat.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <View
                className={`w-8 h-8 rounded-full flex items-center justify-center ${chat.role === "user" ? "bg-slate-200" : "bg-indigo-100"}`}
              >
                {chat.role === "assistant" ? (
                  <Sparkles size={14} color="#4f46e5" />
                ) : (
                  <Text className="text-slate-600 font-bold text-xs">ME</Text>
                )}
              </View>
              <View
                className={`p-4 rounded-2xl shadow-sm border border-slate-100 flex-1 ${
                  chat.role === "user"
                    ? "bg-indigo-600 rounded-tr-none"
                    : "bg-white rounded-tl-none"
                }`}
              >
                <Text
                  className={`leading-5 ${chat.role === "user" ? "text-white" : "text-slate-700"}`}
                >
                  {chat.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <View className="p-4 bg-white border-t border-slate-100">
            <View className="flex-row items-center gap-3 bg-slate-50 p-1 pr-1 rounded-2xl border border-slate-200">
              <TextInput
                className="flex-1 p-3 text-slate-700 font-medium h-12"
                placeholder="Ask SkyGuide..."
                placeholderTextColor="#94a3b8"
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm"
              >
                <Send size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
