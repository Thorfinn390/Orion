import { ViroARScene } from "@reactvision/react-viro/dist/components/AR/ViroARScene";
import { ViroARSceneNavigator } from "@reactvision/react-viro/dist/components/AR/ViroARSceneNavigator";
import { ViroAmbientLight } from "@reactvision/react-viro/dist/components/ViroAmbientLight";
import { ViroText } from "@reactvision/react-viro/dist/components/ViroText";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HelloWorldSceneAR = () => {
  return (
    <ViroARScene>
      {/* Ambient Light ensures the text is visible regardless of environment lighting */}
      <ViroAmbientLight color="#ffffff" />

      <ViroText
        text="Welcome to Orion"
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -2]} // 2 meters in front of the camera
        style={styles.helloWorldTextStyle}
      />
    </ViroARScene>
  );
};

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <ViroARSceneNavigator
          autofocus={true}
          initialScene={{
            scene: HelloWorldSceneAR,
          }}
          style={styles.f1}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  f1: {
    flex: 1,
  },
  helloWorldTextStyle: {
    fontFamily: "Arial",
    fontSize: 30,
    color: "#ffffff",
    textAlignVertical: "center",
    textAlign: "center",
  },
});
