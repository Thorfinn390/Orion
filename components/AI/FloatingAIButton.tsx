import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { router, usePathname } from "expo-router";

import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const navAiAudio = require("../../assets/audio/AINavigation.mp3");

const FloatingAIButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const player = useAudioPlayer(navAiAudio);
  const pathname = usePathname();

  const isLibraryPage = pathname.includes("InformationZone");

  const toggleMenu = () => {
    try {
      setIsOpen(!isOpen);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      player.seekTo(0);
      player.play();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [isOpen]);

  return (
    <View className="absolute bottom-[17%] right-8 z-50 items-center justify-center">
      {/* --- LIBRARY BUTTON --- */}
      {!isLibraryPage && (
        <MotiView
          animate={{
            translateY: isOpen ? -160 : 0,
            opacity: isOpen ? 1 : 0,
            scale: isOpen ? 1 : 0,
          }}
          transition={{ type: "timing", duration: 250 }}
          pointerEvents={isOpen ? "auto" : "none"}
          className="absolute z-[-1]"
        >
          <TouchableOpacity
            onPress={() => {
              setIsOpen(false);
              router.push("/(nova)/InformationZone");
            }}
            activeOpacity={0.9}
            className="w-16 h-16 rounded-2xl items-center justify-center bg-surface border border-borderEmphasis shadow-sm"
          >
            <Ionicons name="library" size={26} color="#7B5FE8" />
          </TouchableOpacity>
        </MotiView>
      )}

      {/* --- CHAT MODE BUTTON --- */}
      <MotiView
        animate={{
          translateY: isOpen ? -80 : 0,
          opacity: isOpen ? 1 : 0,
          scale: isOpen ? 1 : 0,
        }}
        transition={{ type: "timing", duration: 250 }}
        style={styles.secondaryButtonPosition}
      >
        <TouchableOpacity
          //   onPress={onChatPress}
          activeOpacity={0.9}
          className="w-16 h-16 rounded-2xl items-center justify-center bg-surface border border-borderEmphasis"
          style={styles.secondaryShadow}
        >
          <Ionicons name="chatbubbles" size={26} color="#5BACF5" />
        </TouchableOpacity>
      </MotiView>

      {/* --- MAIN TRIGGER BUTTON --- */}
      <TouchableOpacity
        onPress={toggleMenu}
        activeOpacity={0.85}
        className="w-[72px] h-[72px] rounded-2xl items-center justify-center bg-nova"
        style={styles.mainShadow}
      >
        <MotiView
          animate={{ rotate: isOpen ? "135deg" : "0deg" }}
          transition={{ type: "spring", damping: 15 }}
        >
          <Ionicons
            name={isOpen ? "add" : "sparkles"}
            size={32}
            color="#FFFFFF"
          />
        </MotiView>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainShadow: {
    shadowColor: "#7B5FE8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  secondaryShadow: {
    shadowColor: "#0D1A3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryButtonPosition: {
    position: "absolute",
    zIndex: -1,
  },
});

export default FloatingAIButton;
