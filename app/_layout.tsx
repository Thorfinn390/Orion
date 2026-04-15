import FloatingAIButton from "@/components/AI/FloatingAIButton";
import { BlurView } from "expo-blur";
import { router, Stack } from "expo-router";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "./globals.css";

export default function RootLayout() {
  // useEffect(() => {});
  const [recognizing, setRecognizing] = useState(false);
  const [canRecord, setCanRecord] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleStart = async () => {
    if (canRecord) {
      console.log("listening");
      //start the speech recognition here
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        continuous: false,
      });
    }
  };

  const handleSpeechIndicator = (indicate: boolean) => {
    setRecognizing(indicate);

    if (!indicate) {
      if (transcript === "navigate to home") {
        router.push("/(tabs)");
      }
    }

    setTranscript("");
  };

  const getNewTranscript = (event: any) => {
    const text = event.results.map((r: any) => r.transcript).join("");

    setTranscript(text);
  };

  useEffect(() => {
    async function audioPermissions() {
      const result =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!result.granted) {
        console.warn("Permissions not granted", result);
        setCanRecord(false);
        return;
      }

      setCanRecord(true);
    }

    audioPermissions();
  }, []);

  useEffect(() => {
    console.log(canRecord);
  }, [canRecord]);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />

      <FloatingAIButton
        handleStart={handleStart}
        startSpeechIndicator={handleSpeechIndicator}
        getNewTranscript={getNewTranscript}
      />

      <Toast />
      {recognizing && (
        <BlurView
          style={styles.blurOverlay}
          intensity={40}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
        >
          {/* <View> */}
          <Text className="text-center m-auto text-2xl font-extrabold text-wrap text-primary">
            {transcript}
          </Text>
          {/* </View> */}
        </BlurView>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  blurOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    paddingLeft: 20,
    paddingRight: 20,
  },
});
