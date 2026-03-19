import { Microphone } from "lucide-react-native";
import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

const TalkingAvatar = () => {
  return (
    <View style={styles.container}>
      <Animatable.View
        animation="pulse"
        easing="ease-out"
        iterationCount="infinite"
        style={styles.avatarContainer}
      >
        <View style={styles.avatar} />
      </Animatable.View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Talk to the avatar..."
        />
        <Microphone size={20} color="#94a3b8" style={styles.micIcon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(79, 70, 229, 0.2)",
  },
  inputContainer: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  micIcon: {
    marginLeft: 10,
  },
});

export default TalkingAvatar;
