import { useNovaAvatarStore } from "@/stores/useNovaAvatarStore";
import { Sparkles } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Rive from "rive-react-native";

type NovaAvatarProps = {
  size?: number;
  stateMachineName?: string;
  resourceName?: string;
  style?: StyleProp<ViewStyle>;
};

export const NovaAvatar = ({
  size = 56,
  stateMachineName = "NovaStateMachine",
  resourceName = "nova",
  style,
}: NovaAvatarProps) => {
  const riveRef = useRef<any>(null);
  const [hasRiveError, setHasRiveError] = useState(false);
  const pendingReaction = useNovaAvatarStore((state) => state.pendingReaction);
  const clearReaction = useNovaAvatarStore((state) => state.clearReaction);

  useEffect(() => {
    if (!pendingReaction || !riveRef.current) {
      return;
    }

    riveRef.current.fireState(
      stateMachineName,
      pendingReaction.inputName,
    );
    clearReaction(pendingReaction.id);
  }, [clearReaction, pendingReaction, stateMachineName]);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#eef2ff",
        },
        style,
      ]}
    >
      {hasRiveError ? (
        <Sparkles size={Math.max(18, size * 0.42)} color="#4f46e5" />
      ) : (
        <Rive
          ref={riveRef}
          resourceName={resourceName}
          stateMachineName={stateMachineName}
          autoplay
          style={{ width: size, height: size }}
          onError={() => setHasRiveError(true)}
        />
      )}
    </View>
  );
};
