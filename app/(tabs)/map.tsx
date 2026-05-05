import { useJourneySimulationStore } from "@/stores/useJourneySimulationStore";
import { TicketSimulationService } from "@/utils/TicketSimulationService";
import { apiFetch } from "@/utils/apiFetch";
import {
  AIRPORT_ZONE_POLYGON,
  ARPosition,
  DEFAULT_AIRPORT_COORDINATE,
  DEFAULT_JOURNEY_CHECKLIST_ITEMS,
  GeoCoordinate,
  MapMarkerLike,
  NavigationTarget,
  QR_ANCHOR_ID,
  TERMINAL_SERVICES,
  TerminalServiceId,
  distanceOnFloor,
  getTerminalService,
  isGeoCoordinateInPolygon,
} from "@/utils/journeySimulation";
import { ViroARImageMarker } from "@reactvision/react-viro/dist/components/AR/ViroARImageMarker";
import { ViroARScene } from "@reactvision/react-viro/dist/components/AR/ViroARScene";
import { ViroARSceneNavigator } from "@reactvision/react-viro/dist/components/AR/ViroARSceneNavigator";
import { ViroARTrackingTargets } from "@reactvision/react-viro/dist/components/AR/ViroARTrackingTargets";
import type {
  ViroAnchor,
  ViroCameraTransform,
} from "@reactvision/react-viro/dist/components/Types/ViroEvents";
import { Viro3DObject } from "@reactvision/react-viro/dist/components/Viro3DObject";
import { ViroAmbientLight } from "@reactvision/react-viro/dist/components/ViroAmbientLight";
import { ViroText } from "@reactvision/react-viro/dist/components/ViroText";
import { useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, {
  Marker,
  Polygon,
  Polyline,
  Region,
  UserLocationChangeEvent,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

type ModelType = "OBJ" | "VRX" | "GLTF" | "GLB";
type MapMode = "gps" | "ar";

type SceneARModel = {
  id: string;
  name: string;
  category: string;
  position: ARPosition;
  rotation: ARPosition;
  scale: [number, number, number];
  modelUri?: string;
  modelType?: ModelType;
};

type ARModelsApiResponse = {
  status?: boolean;
  message?: string;
  data?: unknown[];
};

type ARSceneAppProps = {
  models: SceneARModel[];
  activeTarget: NavigationTarget | null;
  isWorldOriginReady: boolean;
  onQrAnchorFound: (anchor: ViroAnchor) => void;
  onQrAnchorRemoved: () => void;
  onCameraTransformUpdate: (cameraTransform: ViroCameraTransform) => void;
};

type ARSceneProps = {
  sceneNavigator: {
    viroAppProps?: ARSceneAppProps;
  };
};

const QR_TRACKING_TARGET_NAME = "orion_qr_anchor";
const QR_TRACKING_TARGET_SOURCE = require("@/assets/images/icon.png");
const USE_BACKEND_AR_MODELS =
  process.env.EXPO_PUBLIC_USE_BACKEND_AR_MODELS === "true";
const DEFAULT_ROUTE_START: GeoCoordinate = {
  latitude: DEFAULT_AIRPORT_COORDINATE.latitude - 0.08,
  longitude: DEFAULT_AIRPORT_COORDINATE.longitude - 0.08,
};

try {
  ViroARTrackingTargets.createTargets({
    [QR_TRACKING_TARGET_NAME]: {
      source: QR_TRACKING_TARGET_SOURCE,
      orientation: "Up",
      physicalWidth: 0.16,
    },
  });
} catch (error) {
  console.warn("Unable to register ORION QR tracking target:", error);
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
  qrCodeId: QR_ANCHOR_ID,
  position: model.position,
});

const createLocalARModels = (): SceneARModel[] => [
  ...DEFAULT_JOURNEY_CHECKLIST_ITEMS.map((item) => ({
    id: item.id,
    name: item.title,
    category: "JOURNEY",
    position: [...item.targetPosition] as ARPosition,
    rotation: [0, 0, 0] as ARPosition,
    scale: [0.18, 0.18, 0.18] as [number, number, number],
  })),
  ...TERMINAL_SERVICES.map((service) => ({
    id: service.id,
    name: service.title,
    category: "SERVICE",
    position: [...service.targetPosition] as ARPosition,
    rotation: [0, 0, 0] as ARPosition,
    scale: [0.18, 0.18, 0.18] as [number, number, number],
  })),
];

const readParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const readNumberParam = (value: string | string[] | undefined) => {
  const raw = readParam(value);
  const next = Number(raw);

  return Number.isFinite(next) ? next : null;
};

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

const getRelativePositionFromOrigin = (
  position: ARPosition,
  origin: ARPosition,
): ARPosition => [
  position[0] - origin[0],
  position[1] - origin[1],
  position[2] - origin[2],
];

const createRouteRegion = (
  from: GeoCoordinate,
  to: GeoCoordinate,
): Region => {
  const latitudeDelta = Math.max(Math.abs(from.latitude - to.latitude) * 1.7, 0.04);
  const longitudeDelta = Math.max(
    Math.abs(from.longitude - to.longitude) * 1.7,
    0.04,
  );

  return {
    latitude: (from.latitude + to.latitude) / 2,
    longitude: (from.longitude + to.longitude) / 2,
    latitudeDelta,
    longitudeDelta,
  };
};

const renderARModel = (model: SceneARModel) => (
  <React.Fragment key={model.id}>
    {model.modelUri ? (
      <Viro3DObject
        source={{ uri: model.modelUri }}
        type={model.modelType ?? "GLB"}
        position={model.position}
        rotation={model.rotation}
        scale={model.scale}
      />
    ) : null}
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
  const isWorldOriginReady = appProps?.isWorldOriginReady ?? false;

  const anchoredContent = (
    <>
      {models.map(renderARModel)}
      {activeTarget ? renderNavigationTarget(activeTarget) : null}
      {models.length === 0 ? (
        <ViroText
          text="Loading airport AR markers..."
          position={[0, 0.25, -1.5]}
          width={0.8}
          height={0.2}
          style={styles.hintText}
        />
      ) : null}
    </>
  );

  return (
    <ViroARScene
      onCameraTransformUpdate={(cameraTransform) =>
        appProps?.onCameraTransformUpdate(cameraTransform)
      }
    >
      <ViroAmbientLight color="#ffffff" intensity={1200} />

      <ViroARImageMarker
        target={QR_TRACKING_TARGET_NAME}
        onAnchorFound={(anchor) => appProps?.onQrAnchorFound(anchor)}
        onAnchorUpdated={(anchor) => appProps?.onQrAnchorFound(anchor)}
        onAnchorRemoved={() => appProps?.onQrAnchorRemoved()}
      >
        {anchoredContent}
      </ViroARImageMarker>

      {!isWorldOriginReady ? (
        <ViroText
          text="Scan the ORION QR marker to set AR origin"
          position={[0, 0.1, -1.3]}
          width={1.2}
          height={0.3}
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
    ar?: string;
    serviceId?: string;
    userFlightId?: string;
    flightNumber?: string;
    poiX?: string;
    poiY?: string;
    poiZ?: string;
  }>();
  const [models, setModels] = useState<SceneARModel[]>(() =>
    createLocalARModels(),
  );
  const [mapMode, setMapMode] = useState<MapMode>("gps");
  const [userLocation, setUserLocation] = useState<GeoCoordinate | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [originAnchor, setOriginAnchor] = useState<ViroAnchor | null>(null);
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
  const setScannedQrCodeId = useJourneySimulationStore(
    (state) => state.setScannedQrCodeId,
  );
  const setCurrentRelativePosition = useJourneySimulationStore(
    (state) => state.setCurrentRelativePosition,
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
  const arParam = readParam(params.ar);
  const serviceIdParam = readParam(params.serviceId);
  const userFlightIdParam = readParam(params.userFlightId);
  const flightNumberParam = readParam(params.flightNumber);

  const poiPositionParam = useMemo<ARPosition | null>(() => {
    const poiX = readNumberParam(params.poiX);
    const poiY = readNumberParam(params.poiY);
    const poiZ = readNumberParam(params.poiZ);

    if (poiX === null || poiY === null || poiZ === null) {
      return null;
    }

    return [poiX, poiY, poiZ];
  }, [params.poiX, params.poiY, params.poiZ]);

  const routeStart = userLocation ?? DEFAULT_ROUTE_START;
  const routeRegion = useMemo(
    () => createRouteRegion(routeStart, DEFAULT_AIRPORT_COORDINATE),
    [routeStart],
  );
  const targetDistance = useMemo(() => {
    if (!activeTarget || !currentRelativePosition) {
      return null;
    }

    return distanceOnFloor(currentRelativePosition, activeTarget.position);
  }, [activeTarget, currentRelativePosition]);

  const updateGeoLocation = useCallback((coordinate: GeoCoordinate) => {
    setUserLocation(coordinate);

    if (isGeoCoordinateInPolygon(coordinate, AIRPORT_ZONE_POLYGON)) {
      setMapMode("ar");
    }
  }, []);

  useEffect(() => {
    if (arParam === "1") {
      setMapMode("ar");
    }
  }, [arParam]);

  useEffect(() => {
    if (modeParam === "service" && serviceIdParam) {
      const service = getTerminalService(serviceIdParam);

      if (service) {
        startServiceNavigation(
          service.id as TerminalServiceId,
          poiPositionParam ?? service.targetPosition,
        );
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
    poiPositionParam,
    registerTicket,
    serviceIdParam,
    startServiceNavigation,
    startTicketSimulation,
    userFlightIdParam,
  ]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let isMounted = true;

    const startLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (permission.status !== "granted") {
          setLocationError("Location permission is required for GPS routing.");
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          updateGeoLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 20,
          },
          (location) => {
            updateGeoLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          },
        );
      } catch (error) {
        if (isMounted) {
          setLocationError(
            error instanceof Error ? error.message : "Unable to read location.",
          );
        }
      }
    };

    void startLocation();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [updateGeoLocation]);

  useEffect(() => {
    setServiceReached(false);
  }, [activeTarget?.id, activeTarget?.kind]);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const localModels = createLocalARModels();

    setModels(localModels);
    setErrorMessage(null);
    syncTargetsFromMarkers(localModels.map(toMarkerLike));

    if (!USE_BACKEND_AR_MODELS) {
      setIsLoading(false);

      return () => {
        isMounted = false;
        controller.abort();
      };
    }

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
        const resolvedModels =
          nextModels.length > 0 ? nextModels : createLocalARModels();

        if (!isMounted) {
          return;
        }

        setModels(resolvedModels);
        syncTargetsFromMarkers(resolvedModels.map(toMarkerLike));
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") {
          return;
        }
        if (!isMounted) {
          return;
        }

        console.warn(
          "Using local AR markers because backend AR models are unavailable:",
          error,
        );
        setModels(localModels);
        setErrorMessage(null);
        syncTargetsFromMarkers(localModels.map(toMarkerLike));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchARModels();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [syncTargetsFromMarkers]);

  const syncChecklistToBackend = useCallback(async () => {
    const ticket = useJourneySimulationStore.getState().activeTicket;

    try {
      await TicketSimulationService.syncChecklistToBackend(
        ticket?.userFlightId,
      );

      queryClient.invalidateQueries({ queryKey: ["homeRegisteredFlights"] });
      queryClient.invalidateQueries({ queryKey: ["userFlights"] });
    } catch (error) {
      console.warn("Failed to sync AR checklist progress:", error);
    }
  }, [queryClient]);

  const handleQrAnchorFound = useCallback(
    (anchor: ViroAnchor) => {
      setOriginAnchor(anchor);
      setScannedQrCodeId(QR_ANCHOR_ID);
    },
    [setScannedQrCodeId],
  );

  const handleQrAnchorRemoved = useCallback(() => {
    setOriginAnchor(null);
  }, []);

  const handleCameraTransformUpdate = useCallback(
    (cameraTransform: ViroCameraTransform) => {
      const now = Date.now();
      if (now - lastCameraUpdateAt.current < 450) {
        return;
      }

      const cameraPosition = getCameraPosition(cameraTransform);
      const originPosition = originAnchor?.position;

      if (!cameraPosition || !originPosition) {
        return;
      }

      const relativePosition = getRelativePositionFromOrigin(
        cameraPosition,
        originPosition,
      );

      lastCameraUpdateAt.current = now;

      setCurrentRelativePosition(relativePosition);
      const completedIds =
        TicketSimulationService.handleViroPosition(relativePosition);

      if (completedIds.length > 0) {
        void syncChecklistToBackend();
      }

      if (
        activeTarget?.kind === "service" &&
        distanceOnFloor(relativePosition, activeTarget.position) <=
          activeTarget.radius
      ) {
        setServiceReached(true);
      }
    },
    [
      activeTarget,
      originAnchor?.position,
      setCurrentRelativePosition,
      syncChecklistToBackend,
    ],
  );

  const handleUserLocationChange = (event: UserLocationChangeEvent) => {
    const coordinate = event.nativeEvent.coordinate;

    if (!coordinate) {
      return;
    }

    updateGeoLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
  };

  const modelCountLabel =
    models.length === 1 ? "1 AR marker loaded" : `${models.length} AR markers loaded`;
  const isWorldOriginReady = Boolean(originAnchor);

  if (mapMode === "gps") {
    return (
      <SafeAreaView className="flex-1 bg-slate-950" edges={["top"]}>
        <View className="flex-1">
          <MapView
            style={styles.scene}
            initialRegion={routeRegion}
            showsUserLocation
            followsUserLocation
            onUserLocationChange={handleUserLocationChange}
          >
            <Polygon
              coordinates={AIRPORT_ZONE_POLYGON}
              strokeColor="#1568C4"
              fillColor="rgba(21, 104, 196, 0.16)"
              strokeWidth={2}
            />
            <Polyline
              coordinates={[routeStart, DEFAULT_AIRPORT_COORDINATE]}
              strokeColor="#4f46e5"
              strokeWidth={4}
            />
            <Marker
              coordinate={DEFAULT_AIRPORT_COORDINATE}
              title="Airport Zone"
              description="Entering this polygon switches ORION to AR mode."
            />
            {!userLocation ? (
              <Marker
                coordinate={DEFAULT_ROUTE_START}
                title="Simulated current location"
                description="Waiting for live GPS."
              />
            ) : null}
          </MapView>

          <View className="absolute top-4 left-4 right-4">
            <View className="rounded-xl border border-white/20 bg-black/70 px-4 py-3">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                GPS Navigation
              </Text>
              <Text className="mt-1 text-base font-semibold text-white">
                Route to airport
              </Text>
              <Text className="mt-1 text-xs text-slate-200">
                ORION switches to AR when your GPS enters the airport zone.
              </Text>
              {locationError ? (
                <Text className="mt-2 text-xs text-amber-200">
                  {locationError}
                </Text>
              ) : null}
              <TouchableOpacity
                onPress={() => setMapMode("ar")}
                activeOpacity={0.85}
                className="mt-3 h-11 items-center justify-center rounded-xl bg-sky-500"
              >
                <Text className="text-xs font-black uppercase tracking-widest text-white">
                  Open AR Scanner
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
            isWorldOriginReady,
            onQrAnchorFound: handleQrAnchorFound,
            onQrAnchorRemoved: handleQrAnchorRemoved,
            onCameraTransformUpdate: handleCameraTransformUpdate,
          }}
        />

        <View className="absolute top-4 left-4 right-4 z-10">
          <View className="rounded-xl border border-white/20 bg-black/70 px-4 py-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                  AR Navigation
                </Text>
                <Text
                  className="mt-1 text-base font-semibold text-white"
                  numberOfLines={1}
                >
                  {isLoading ? "Loading airport markers" : modelCountLabel}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setMapMode("gps")}
                activeOpacity={0.85}
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-2"
              >
                <Text className="text-[10px] font-black uppercase tracking-widest text-white">
                  GPS
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="mt-1 text-xs text-slate-200">
              {isWorldOriginReady
                ? "QR origin locked. Markers are relative to the scanned code."
                : "Scan the ORION QR code to set world origin at (0, 0, 0)."}
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
