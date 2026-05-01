import { apiFetch } from "@/utils/apiFetch";
import {
  Viro3DObject,
  ViroARImageMarker,
  ViroARScene,
  ViroARSceneNavigator,
  ViroARTrackingTargets,
  ViroAmbientLight,
  ViroAnchorFoundMap,
  ViroText,
} from "@reactvision/react-viro";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MarkerType = "AVATAR" | "INFO" | "WAYPOINT";
type MarkerModelType = "OBJ" | "VRX" | "GLTF" | "GLB";

type SceneMarker = {
  id: string;
  label: string;
  qrCodeId: string;
  type: MarkerType;
  position: [number, number, number];
  modelUri?: string;
  modelType?: MarkerModelType;
  modelResources?: string[];
};

type MarkerApiResponse = {
  status?: boolean;
  message?: string;
  data?: unknown[];
};

type ARSceneAppProps = {
  markers: SceneMarker[];
  onAnchorFound: (anchor: ViroAnchorFoundMap) => void;
};

type ARSceneProps = {
  sceneNavigator: {
    viroAppProps?: ARSceneAppProps;
  };
};

const QR_TRACKING_TARGET = "orion_qr_target";
const QR_TRACKING_IMAGE = require("../../assets/images/react-logo.png");

let didRegisterTargets = false;
if (!didRegisterTargets) {
  ViroARTrackingTargets.createTargets({
    [QR_TRACKING_TARGET]: {
      source: QR_TRACKING_IMAGE,
      orientation: "Up",
      physicalWidth: 0.12,
      type: "Image",
    },
  });
  didRegisterTargets = true;
}

const asString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const asFiniteNumber = (value: unknown): number | null => {
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
};

const parseMarkerType = (value: unknown): MarkerType => {
  const normalized = asString(value)?.toUpperCase();
  if (
    normalized === "AVATAR" ||
    normalized === "INFO" ||
    normalized === "WAYPOINT"
  ) {
    return normalized;
  }
  return "INFO";
};

const parseModelType = (value: unknown): MarkerModelType | undefined => {
  const normalized = asString(value)?.toUpperCase();
  if (
    normalized === "OBJ" ||
    normalized === "VRX" ||
    normalized === "GLTF" ||
    normalized === "GLB"
  ) {
    return normalized;
  }
  return undefined;
};

const resolveModelType = (
  explicitType: unknown,
  modelUri?: string,
): MarkerModelType | undefined => {
  const fromPayload = parseModelType(explicitType);
  if (fromPayload) {
    return fromPayload;
  }
  if (!modelUri) {
    return undefined;
  }

  const cleanedUri = modelUri.split("#")[0]?.split("?")[0] ?? modelUri;
  const extension = cleanedUri.split(".").pop()?.toUpperCase();
  return parseModelType(extension);
};

const normalizeMarker = (raw: unknown, index: number): SceneMarker | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const marker = raw as Record<string, unknown>;
  const posX = asFiniteNumber(marker.posX);
  const posY = asFiniteNumber(marker.posY);
  const posZ = asFiniteNumber(marker.posZ);

  if (posX === null || posY === null || posZ === null) {
    return null;
  }

  const id = asString(marker.id) ?? `marker-${index}`;
  const label = asString(marker.label) ?? id;
  const qrCodeId = asString(marker.qrCodeId) ?? "";
  const modelUri =
    asString(marker.modelUri) ??
    asString(marker.modelURL) ??
    asString(marker.modelUrl) ??
    undefined;

  const modelResources = Array.isArray(marker.modelResources)
    ? marker.modelResources
        .map((resource) => asString(resource))
        .filter((resource): resource is string => Boolean(resource))
    : undefined;

  return {
    id,
    label,
    qrCodeId,
    type: parseMarkerType(marker.type),
    position: [posX, posY, posZ],
    modelUri,
    modelType: resolveModelType(marker.modelType, modelUri),
    modelResources,
  };
};

const renderMarker = (marker: SceneMarker) => {
  if (marker.type === "AVATAR" && marker.modelUri && marker.modelType) {
    return (
      <Viro3DObject
        key={marker.id}
        source={{ uri: marker.modelUri }}
        resources={marker.modelResources?.map((resource) => ({
          uri: resource,
        }))}
        type={marker.modelType}
        position={marker.position}
        scale={[0.12, 0.12, 0.12]}
      />
    );
  }

  return (
    <ViroText
      key={marker.id}
      text={marker.label}
      position={marker.position}
      width={0.5}
      height={0.2}
      style={styles.markerText}
    />
  );
};

const MapARScene = (props?: ARSceneProps) => {
  const appProps = props?.sceneNavigator?.viroAppProps;
  const markers = appProps?.markers ?? [];

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={1200} />

      <ViroARImageMarker
        target={QR_TRACKING_TARGET}
        onAnchorFound={(anchor) => appProps?.onAnchorFound(anchor)}
      >
        {markers.length > 0 ? (
          markers.map(renderMarker)
        ) : (
          <ViroText
            text="QR detected. Fetching markers..."
            position={[0, 0.1, 0]}
            width={0.6}
            height={0.2}
            style={styles.hintText}
          />
        )}
      </ViroARImageMarker>
    </ViroARScene>
  );
};

export default function MapScreen() {
  const [scannedAnchorId, setScannedAnchorId] = useState<string | null>(null);
  const [scannedQrName, setScannedQrName] = useState("Waiting for scan");
  const [markers, setMarkers] = useState<SceneMarker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnchorFound = useCallback((anchor: ViroAnchorFoundMap) => {
    const nextAnchorId = asString(anchor?.anchorId);
    if (!nextAnchorId) {
      return;
    }

    setScannedAnchorId((current) =>
      current === nextAnchorId ? current : nextAnchorId,
    );
    setScannedQrName(nextAnchorId);
  }, []);

  useEffect(() => {
    if (!scannedAnchorId) {
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const fetchMarkers = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await apiFetch(
          `/api/map/markers?qrCodeId=${encodeURIComponent(scannedAnchorId)}`,
          {
            method: "GET",
            signal: controller.signal,
          },
        );

        const payload = (await response.json()) as MarkerApiResponse;

        if (!response.ok || !payload?.status) {
          throw new Error(payload?.message ?? "Failed to load markers");
        }

        const nextMarkers = (payload.data ?? [])
          .map((rawMarker, index) => normalizeMarker(rawMarker, index))
          .filter((marker): marker is SceneMarker => marker !== null);

        if (!isMounted) {
          return;
        }

        setMarkers(nextMarkers);
        setScannedQrName(nextMarkers[0]?.qrCodeId || scannedAnchorId);
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") {
          return;
        }
        if (!isMounted) {
          return;
        }
        setMarkers([]);
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to fetch markers",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMarkers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [scannedAnchorId]);

  const markerCountLabel =
    markers.length === 1
      ? "1 marker loaded"
      : `${markers.length} markers loaded`;

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      <View className="flex-1">
        <ViroARSceneNavigator
          style={styles.scene}
          autofocus
          initialScene={{ scene: MapARScene }}
          viroAppProps={{
            markers,
            onAnchorFound: handleAnchorFound,
          }}
        />

        <View className="absolute top-4 left-4 right-4 z-10">
          <View className="rounded-xl border border-white/20 bg-black/70 px-4 py-3">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
              Scanned QR Code
            </Text>
            <Text
              className="mt-1 text-base font-semibold text-white"
              numberOfLines={1}
            >
              {scannedQrName}
            </Text>
            <Text className="mt-1 text-xs text-slate-200">
              {isLoading
                ? "Fetching markers from backend..."
                : scannedAnchorId
                  ? markerCountLabel
                  : "Point camera at the registered QR image target."}
            </Text>
            {errorMessage ? (
              <Text className="mt-1 text-xs text-rose-300">{errorMessage}</Text>
            ) : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
  },
  markerText: {
    color: "#f8fafc",
    fontSize: 22,
    textAlign: "center",
    textAlignVertical: "center",
  },
  hintText: {
    color: "#bfdbfe",
    fontSize: 18,
    textAlign: "center",
    textAlignVertical: "center",
  },
});
