export type ARPosition = [number, number, number];

export type JourneyChecklistItemId =
  | "check-in"
  | "security"
  | "boarding"
  | "arrival";

export type TerminalServiceId =
  | "lounge-access"
  | "duty-free"
  | "transport"
  | "info-desk";

export type NavigationTargetKind = "journey" | "service";

export type JourneyChecklistItem = {
  id: JourneyChecklistItemId;
  title: string;
  time: string;
  description: string;
  targetPosition: ARPosition;
  radius: number;
  qrCodeId: string;
  markerAliases: string[];
  isCompleted: boolean;
  completedBy?: "manual" | "ar";
};

export type BackendChecklistItem = {
  id: string;
  title?: string;
  dueTime?: string;
  isCompleted?: boolean;
  is_completed?: boolean;
};

export type TerminalService = {
  id: TerminalServiceId;
  title: string;
  eyebrow: string;
  route: string;
  description: string;
  details: string[];
  accentColor: string;
  iconColor: string;
  bgClassName: string;
  qrCodeId: string;
  targetPosition: ARPosition;
  radius: number;
  markerAliases: string[];
};

export type NavigationTarget = {
  id: string;
  kind: NavigationTargetKind;
  label: string;
  subtitle: string;
  qrCodeId: string;
  position: ARPosition;
  radius: number;
  userFlightId?: string;
};

export type MapMarkerLike = {
  id: string;
  label: string;
  qrCodeId: string;
  position: ARPosition;
};

export const QR_ANCHOR_ID = "orion_qr_target";

export const DEFAULT_JOURNEY_CHECKLIST_ITEMS: JourneyChecklistItem[] = [
  {
    id: "check-in",
    title: "Ticket Check-in",
    time: "Now",
    description: "Ticket registered and ready for AR guidance.",
    targetPosition: [-0.2, 0, -0.25],
    radius: 0.35,
    qrCodeId: QR_ANCHOR_ID,
    markerAliases: ["check in", "check-in", "ticket", "counter"],
    isCompleted: false,
  },
  {
    id: "security",
    title: "Security",
    time: "Next",
    description: "Clear security before moving airside.",
    targetPosition: [0.2, 0, -0.45],
    radius: 0.35,
    qrCodeId: QR_ANCHOR_ID,
    markerAliases: ["security", "screening", "passport"],
    isCompleted: false,
  },
  {
    id: "boarding",
    title: "Boarding",
    time: "Gate",
    description: "Reach the active gate zone for boarding.",
    targetPosition: [0.62, 0, -0.78],
    radius: 0.4,
    qrCodeId: QR_ANCHOR_ID,
    markerAliases: ["boarding", "gate", "bridge"],
    isCompleted: false,
  },
  {
    id: "arrival",
    title: "Arrival",
    time: "Done",
    description: "Journey simulation complete.",
    targetPosition: [0.88, 0, -1.02],
    radius: 0.45,
    qrCodeId: QR_ANCHOR_ID,
    markerAliases: ["arrival", "arrivals", "exit"],
    isCompleted: false,
  },
];

export const TERMINAL_SERVICES: TerminalService[] = [
  {
    id: "lounge-access",
    title: "Lounge Access",
    eyebrow: "Premium Rest",
    route: "/(services)/lounge-access",
    description: "Quiet seating, buffet dining, work pods, and shower access.",
    details: ["Business lounge", "Quiet work pods", "Refresh bar"],
    accentColor: "bg-orange-500",
    iconColor: "#ea580c",
    bgClassName: "bg-orange-50",
    qrCodeId: QR_ANCHOR_ID,
    targetPosition: [0.72, 0, -0.82],
    radius: 0.4,
    markerAliases: ["lounge", "amber", "business class"],
  },
  {
    id: "duty-free",
    title: "Duty Free",
    eyebrow: "Terminal Retail",
    route: "/(services)/duty-free",
    description: "Tax-free cosmetics, gifting, confectionery, and travel gear.",
    details: ["Luxury gifts", "Fragrance wall", "Quick checkout"],
    accentColor: "bg-emerald-500",
    iconColor: "#059669",
    bgClassName: "bg-emerald-50",
    qrCodeId: QR_ANCHOR_ID,
    targetPosition: [0.34, 0, -0.62],
    radius: 0.35,
    markerAliases: ["duty free", "retail", "world duty"],
  },
  {
    id: "transport",
    title: "Transport",
    eyebrow: "Ground Links",
    route: "/(services)/transport",
    description: "Taxi, ride pickup, valet, and rental desk connections.",
    details: ["Taxi pickup", "Car rental", "Valet route"],
    accentColor: "bg-indigo-500",
    iconColor: "#4f46e5",
    bgClassName: "bg-indigo-50",
    qrCodeId: QR_ANCHOR_ID,
    targetPosition: [-0.42, 0, -0.38],
    radius: 0.35,
    markerAliases: ["transport", "parking", "rental", "valet", "taxi"],
  },
  {
    id: "info-desk",
    title: "Info Desk",
    eyebrow: "Passenger Help",
    route: "/(services)/info-desk",
    description: "Wayfinding, airport support, lost items, and service help.",
    details: ["Wayfinding", "Lost items", "Help desk"],
    accentColor: "bg-sky-500",
    iconColor: "#0284c7",
    bgClassName: "bg-sky-50",
    qrCodeId: QR_ANCHOR_ID,
    targetPosition: [-0.58, 0, -0.24],
    radius: 0.35,
    markerAliases: ["info", "information", "help desk", "customer service"],
  },
];

export const createDefaultChecklistItems = () =>
  DEFAULT_JOURNEY_CHECKLIST_ITEMS.map((item) => ({ ...item }));

const formatChecklistTime = (value?: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const createChecklistItemsFromBackend = (
  backendItems?: BackendChecklistItem[] | null,
) => {
  const stateById = new Map(
    (backendItems ?? []).map((item) => [item.id, item]),
  );

  return createDefaultChecklistItems().map((item) => {
    const persisted = stateById.get(item.id);
    const completed = Boolean(
      persisted?.isCompleted ?? persisted?.is_completed ?? item.isCompleted,
    );
    const time = formatChecklistTime(persisted?.dueTime);

    return {
      ...item,
      ...(persisted?.title ? { title: persisted.title } : {}),
      ...(time ? { time } : {}),
      isCompleted: completed,
      completedBy: completed ? ("manual" as const) : undefined,
    };
  });
};

export const getTerminalService = (id?: string | null) =>
  TERMINAL_SERVICES.find((service) => service.id === id);

export const distanceOnFloor = (a: ARPosition, b: ARPosition) => {
  const x = a[0] - b[0];
  const z = a[2] - b[2];
  return Math.sqrt(x * x + z * z);
};

export const formatARPosition = (position: ARPosition) =>
  `x ${position[0].toFixed(2)} / y ${position[2].toFixed(2)}`;

const normalizeLabel = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const markerText = (marker: MapMarkerLike) =>
  normalizeLabel(`${marker.id} ${marker.label}`);

export const findMarkerByAliases = (
  markers: MapMarkerLike[],
  aliases: string[],
) =>
  markers.find((marker) => {
    const text = markerText(marker);
    return aliases.some((alias) => text.includes(normalizeLabel(alias)));
  });

export const toNavigationTargetFromJourneyItem = (
  item: JourneyChecklistItem,
  userFlightId?: string,
): NavigationTarget => ({
  id: item.id,
  kind: "journey",
  label: item.title,
  subtitle: item.description,
  qrCodeId: item.qrCodeId,
  position: item.targetPosition,
  radius: item.radius,
  userFlightId,
});

export const toNavigationTargetFromService = (
  service: TerminalService,
): NavigationTarget => ({
  id: service.id,
  kind: "service",
  label: service.title,
  subtitle: service.description,
  qrCodeId: service.qrCodeId,
  position: service.targetPosition,
  radius: service.radius,
});
