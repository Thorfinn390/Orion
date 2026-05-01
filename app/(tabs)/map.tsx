import { useJourneySimulationStore } from "@/stores/useJourneySimulationStore";
import { apiFetch } from "@/utils/apiFetch";
import {
  ARPosition,
  MapMarkerLike,
  NavigationTarget,
  TerminalServiceId,
  distanceOnFloor,
  getTerminalService,
} from "@/utils/journeySimulation";
import { ViroARScene } from "@reactvision/react-viro/dist/components/AR/ViroARScene";
import { ViroARSceneNavigator } from "@reactvision/react-viro/dist/components/AR/ViroARSceneNavigator";
import type { ViroCameraTransform } from "@reactvision/react-viro/dist/components/Types/ViroEvents";
import { Viro3DObject } from "@reactvision/react-viro/dist/components/Viro3DObject";
import { ViroAmbientLight } from "@reactvision/react-viro/dist/components/ViroAmbientLight";
import { ViroText } from "@reactvision/react-viro/dist/components/ViroText";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ModelType = "OBJ" | "VRX" | "GLTF" | "GLB";

type SceneARModel = {
  id: string;
  name: string;
  category: string;
  position: ARPosition;
  rotation: ARPosition;
  scale: [number, number, number];
  modelUri: string;
  modelType: ModelType;
};

type ARModelsApiResponse = {
  status?: boolean;
  message?: string;
  data?: unknown[];
};

type ARSceneAppProps = {
  models: SceneARModel[];
  activeTarget: NavigationTarget | null;
  onCameraTransformUpdate: (cameraTransform: ViroCameraTransform) => void;
};

type ARSceneProps = {
  sceneNavigator: {
    viroAppProps?: ARSceneAppProps;
  };
};

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

const getRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const parseModelType = (value: unknown, modelUri?: string): ModelType => {
  const normalized = asString(value)?.toUpperCase();

  if (
    normalized === "OBJ" ||
    normalized === "VRX" ||
    normalized === "GLTF" ||
    normalized === "GLB"
  ) {
    return normalized;
  }

  const cleanedUri = modelUri?.split("#")[0]?.split("?")[0] ?? "";
  const extension = cleanedUri.split(".").pop()?.toUpperCase();

  if (extension === "OBJ" || extension === "VRX" || extension === "GLTF") {
    return extension;
  }

  return "GLB";
};

const readNumberField = (
  record: Record<string, unknown> | null,
  field: string,
  fallback: number,
) => asFiniteNumber(record?.[field]) ?? fallback;

const normalizeARModel = (raw: unknown, index: number): SceneARModel | null => {
  const model = getRecord(raw);

  if (!model) {
    return null;
  }

  const asset = getRecord(model.asset);
  const transform = getRecord(model.transform);
  const position = getRecord(transform?.position);
  const rotation = getRecord(transform?.rotation);
  const rawScale = asFiniteNumber(transform?.scale) ?? 1;
  const modelUri = asString(asset?.url) ?? asString(model.asset_url);

  if (!modelUri) {
    return null;
  }

  return {
    id: asString(model.id) ?? asString(model.slug) ?? `ar-model-${index}`,
    name: asString(model.name) ?? `AR Model ${index + 1}`,
    category: asString(model.category) ?? "INFO",
    position: [
      readNumberField(position, "x", 0),
      readNumberField(position, "y", 0),
      readNumberField(position, "z", -2 - index * 0.5),
    ],
    rotation: [
      readNumberField(rotation, "x", 0),
      readNumberField(rotation, "y", 0),
      readNumberField(rotation, "z", 0),
    ],
    scale: [rawScale, rawScale, rawScale],
    modelUri,
    modelType: parseModelType(asset?.format ?? model.asset_format, modelUri),
  };
};

const toMarkerLike = (model: SceneARModel): MapMarkerLike => ({
  id: model.id,
  label: model.name,
  qrCodeId: "world-origin",
  position: model.position,
});

const readParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getCameraPosition = (
  cameraTransform: ViroCameraTransform,
): ARPosition | null => {
  const position =
    cameraTransform.position ?? cameraTransform.cameraTransform?.position;

  if (!position) {
    return null;
  }

  return [position[0], position[1], position[2]];
};

const renderARModel = (model: SceneARModel) => (
  <React.Fragment key={model.id}>
    <Viro3DObject
      source={{ uri: model.modelUri }}
      type={model.modelType}
      position={model.position}
      rotation={model.rotation}
      scale={model.scale}
    />
    <ViroText
      text={model.name}
      position={[model.position[0], model.position[1] + 0.45, model.position[2]]}
      width={0.8}
      height={0.2}
      style={styles.markerText}
    />
  </React.Fragment>
);

const renderNavigationTarget = (target: NavigationTarget) => (
  <ViroText
    key={`active-target-${target.kind}-${target.id}`}
    text={`Go to ${target.label}`}
    position={target.position}
    width={0.8}
    height={0.24}
    style={styles.targetText}
  />
);

const MapARScene = (props?: ARSceneProps) => {
  const appProps = props?.sceneNavigator?.viroAppProps;
  const models = appProps?.models ?? [];
  const activeTarget = appProps?.activeTarget ?? null;

  return (
    <ViroARScene
      onCameraTransformUpdate={(cameraTransform) =>
        appProps?.onCameraTransformUpdate(cameraTransform)
      }
    >
      <ViroAmbientLight color="#ffffff" intensity={1200} />

      {models.map(renderARModel)}
      {activeTarget ? renderNavigationTarget(activeTarget) : null}
      {models.length === 0 ? (
        <ViroText
          text="Loading airport AR models..."
          position={[0, 0.25, -1.5]}
          width={0.8}
          height={0.2}
          style={styles.hintText}
        />
      ) : null}
    </ViroARScene>
  );
};

export default function MapScreen() {
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    mode?: string;
    serviceId?: string;
    userFlightId?: string;
    flightNumber?: string;
  }>();
  const [models, setModels] = useState<SceneARModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serviceReached, setServiceReached] = useState(false);
  const lastCameraUpdateAt = useRef(0);

  const registerTicket = useJourneySimulationStore(
    (state) => state.registerTicket,
  );
  const startTicketSimulation = useJourneySimulationStore(
    (state) => state.startTicketSimulation,
  );
  const startServiceNavigation = useJourneySimulationStore(
    (state) => state.startServiceNavigation,
  );
  const setCurrentRelativePosition = useJourneySimulationStore(
    (state) => state.setCurrentRelativePosition,
  );
  const completeNearbyChecklistItems = useJourneySimulationStore(
    (state) => state.completeNearbyChecklistItems,
  );
  const syncTargetsFromMarkers = useJourneySimulationStore(
    (state) => state.syncTargetsFromMarkers,
  );
  const activeTarget = useJourneySimulationStore((state) => state.activeTarget);
  const activeTicket = useJourneySimulationStore((state) => state.activeTicket);
  const activeServiceId = useJourneySimulationStore(
    (state) => state.activeServiceId,
  );
  const isCheckedIn = useJourneySimulationStore((state) => state.isCheckedIn);
  const currentRelativePosition = useJourneySimulationStore(
    (state) => state.currentRelativePosition,
  );

  const modeParam = readParam(params.mode);
  const serviceIdParam = readParam(params.serviceId);
  const userFlightIdParam = readParam(params.userFlightId);
  const flightNumberParam = readParam(params.flightNumber);

  const targetDistance = useMemo(() => {
    if (!activeTarget || !currentRelativePosition) {
      return null;
    }

    return distanceOnFloor(currentRelativePosition, activeTarget.position);
  }, [activeTarget, currentRelativePosition]);

  useEffect(() => {
    if (modeParam === "service" && serviceIdParam) {
      const service = getTerminalService(serviceIdParam);

      if (service) {
        startServiceNavigation(service.id as TerminalServiceId);
      }
    }

    if (modeParam === "journey" && userFlightIdParam) {
      const ticket = {
        userFlightId: userFlightIdParam,
        flightNumber: flightNumberParam,
      };

      registerTicket(ticket);
      startTicketSimulation(ticket);
    }
  }, [
    flightNumberParam,
    modeParam,
    registerTicket,
    serviceIdParam,
    startServiceNavigation,
    startTicketSimulation,
    userFlightIdParam,
  ]);

  useEffect(() => {
    setServiceReached(false);
  }, [activeTarget?.id, activeTarget?.kind]);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchARModels = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await apiFetch("/api/map/ar-models?limit=100", {
          method: "GET",
          signal: controller.signal,
        });
        const payload = (await response.json()) as ARModelsApiResponse;

        if (!response.ok || !payload?.status) {
          throw new Error(payload?.message ?? "Failed to load AR models");
        }

        const nextModels = (payload.data ?? [])
          .map((rawModel, index) => normalizeARModel(rawModel, index))
          .filter((model): model is SceneARModel => model !== null);

        if (!isMounted) {
          return;
        }

        setModels(nextModels);
        syncTargetsFromMarkers(nextModels.map(toMarkerLike));
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") {
          return;
        }
        if (!isMounted) {
          return;
        }

        setModels([]);
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to fetch AR models",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchARModels();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [syncTargetsFromMarkers]);

  const syncChecklistToBackend = useCallback(async () => {
    const ticket = useJourneySimulationStore.getState().activeTicket;

    if (!ticket?.userFlightId) {
      return;
    }

    const latestItems = useJourneySimulationStore.getState().checklistItems;

    try {
      await apiFetch(`/flight/${ticket.userFlightId}/checklist`, {
        method: "PUT",
        body: JSON.stringify({
          items: latestItems.map((item) => ({
            id: item.id,
            isCompleted: item.isCompleted,
          })),
        }),
      });

      queryClient.invalidateQueries({ queryKey: ["homeRegisteredFlights"] });
      queryClient.invalidateQueries({ queryKey: ["userFlights"] });
    } catch (error) {
      console.warn("Failed to sync AR checklist progress:", error);
    }
  }, [queryClient]);

  const handleCameraTransformUpdate = useCallback(
    (cameraTransform: ViroCameraTransform) => {
      const now = Date.now();
      if (now - lastCameraUpdateAt.current < 450) {
        return;
      }

      const cameraPosition = getCameraPosition(cameraTransform);
      if (!cameraPosition) {
        return;
      }

      lastCameraUpdateAt.current = now;

      setCurrentRelativePosition(cameraPosition);
      const completedIds = completeNearbyChecklistItems(cameraPosition);

      if (completedIds.length > 0) {
        void syncChecklistToBackend();
      }

      if (
        activeTarget?.kind === "service" &&
        distanceOnFloor(cameraPosition, activeTarget.position) <=
          activeTarget.radius
      ) {
        setServiceReached(true);
      }
    },
    [
      activeTarget,
      completeNearbyChecklistItems,
      setCurrentRelativePosition,
      syncChecklistToBackend,
    ],
  );

  const modelCountLabel =
    models.length === 1 ? "1 AR model loaded" : `${models.length} AR models loaded`;

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      <View className="flex-1">
        <ViroARSceneNavigator
          style={styles.scene}
          autofocus
          initialScene={{ scene: MapARScene }}
          viroAppProps={{
            models,
            activeTarget,
            onCameraTransformUpdate: handleCameraTransformUpdate,
          }}
        />

        <View className="absolute top-4 left-4 right-4 z-10">
          <View className="rounded-xl border border-white/20 bg-black/70 px-4 py-3">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
              AR Models
            </Text>
            <Text
              className="mt-1 text-base font-semibold text-white"
              numberOfLines={1}
            >
              {isLoading ? "Loading airport models" : modelCountLabel}
            </Text>
            <Text className="mt-1 text-xs text-slate-200">
              Models are generated from backend locations on scene start.
            </Text>
            {activeTarget ? (
              <View className="mt-3 rounded-lg border border-white/10 bg-white/10 px-3 py-2">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-sky-200">
                  {activeTarget.kind === "service"
                    ? "Service Navigation"
                    : "Journey Simulation"}
                </Text>
                <Text className="mt-1 text-sm font-semibold text-white">
                  {activeTarget.label}
                </Text>
                {activeTicket && activeTarget.kind === "journey" ? (
                  <Text className="mt-1 text-xs text-slate-300">
                    {activeTicket.flightNumber ?? "Registered flight"} -{" "}
                    {isCheckedIn ? "checked in" : "awaiting check-in"}
                  </Text>
                ) : null}
                {activeServiceId && activeTarget.kind === "service" ? (
                  <Text className="mt-1 text-xs text-slate-300">
                    {getTerminalService(activeServiceId)?.eyebrow ??
                      "Terminal service"}{" "}
                    - {serviceReached ? "arrived" : "guiding"}
                  </Text>
                ) : null}
                {targetDistance !== null ? (
                  <Text className="mt-1 text-xs text-slate-300">
                    {targetDistance.toFixed(2)}m from target
                  </Text>
                ) : null}
              </View>
            ) : null}
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
    fontSize: 18,
    textAlign: "center",
    textAlignVertical: "center",
  },
  hintText: {
    color: "#bfdbfe",
    fontSize: 18,
    textAlign: "center",
    textAlignVertical: "center",
  },
  targetText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    textAlignVertical: "center",
  },
});
