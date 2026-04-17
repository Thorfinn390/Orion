import FloatingAIButton from "@/components/AI/FloatingAIButton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

export default function RootLayout() {
  const pathname = usePathname();
  const [recognizing, setRecognizing] = useState(false);
  const [canRecord, setCanRecord] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleStart = async () => {
    if (canRecord) {
      setTranscript("");
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
      const cleanTranscript = transcript.toLowerCase().trim();

      if (cleanTranscript.includes("navigate to home")) {
        router.push("/(tabs)");
      } else if (cleanTranscript.includes("navigate to chat")) {
        router.push("/(nova)/LLM");
      } else if (cleanTranscript.includes("go back")) {
        router.back();
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
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />

        {!pathname.includes("(auth)") && (
          <FloatingAIButton
            handleStart={handleStart}
            startSpeechIndicator={handleSpeechIndicator}
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
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
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
