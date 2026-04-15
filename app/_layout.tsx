import FloatingAIButton from "@/components/AI/FloatingAIButton";
import { BlurView } from "expo-blur";
import { router, Stack, usePathname } from "expo-router";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "./globals.css";

export default function RootLayout() {
  const pathname = usePathname();
  const [recognizing, setRecognizing] = useState(false);
  const [canRecord, setCanRecord] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleStart = async () => {
    if (canRecord) {
      console.log("listening");

      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        continuous: false,
      });
    }
  };
  //comment
  const handleSpeechIndicator = (indicate: boolean) => {
    setRecognizing(indicate);

    if (!indicate) {
      if (transcript === "navigate to home") {
        router.push("/(tabs)");
      }
      setTranscript("");
    }
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
        setCanRecord(false);
        return;
      }

      setCanRecord(true);
    }

    audioPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />

      {!pathname.includes("(auth)") && (
        <FloatingAIButton
          handleStart={handleStart}
          startSpeechIndicator={setRecognizing}
          getNewTranscript={getNewTranscript}
        />
      )}

      <Toast />

      <MotiView
        pointerEvents={recognizing ? "auto" : "none"}
        animate={{
          opacity: recognizing ? 1 : 0,
          scale: recognizing ? 1 : 0.9,
        }}
        transition={{
          type: "timing",
          duration: 200,
        }}
        style={styles.overlayWrapper}
      >
        {recognizing && (
          <BlurView
            style={styles.blurOverlay}
            intensity={40}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
          >
            <Text style={styles.text}>{transcript}</Text>
          </BlurView>
        )}
      </MotiView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,

    // shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,

    // Android
    elevation: 15,
  },

  blurOverlay: {
    flex: 1,
    margin: 2,
    borderRadius: 24,
    overflow: "hidden",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
});
