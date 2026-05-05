import { create } from "zustand";
import {
  ARPosition,
  BackendChecklistItem,
  FloorCoordinate,
  JourneyChecklistItem,
  JourneyChecklistItemId,
  MapMarkerLike,
  NavigationTarget,
  TerminalServiceId,
  createChecklistItemsFromBackend,
  createDefaultChecklistItems,
  distanceBetweenFloorCoordinates,
  findMarkerByAliases,
  getTerminalService,
  targetPositionToFloorCoordinate,
  toFloorCoordinate,
  toNavigationTargetFromJourneyItem,
  toNavigationTargetFromService,
} from "@/utils/journeySimulation";

export type RegisteredTicket = {
  userFlightId: string;
  flightId?: string;
  flightNumber?: string;
  gate?: string | null;
  terminal?: string | null;
  checklistItems?: BackendChecklistItem[] | null;
};

type CompletionSource = "manual" | "ar";

interface JourneySimulationState {
  registeredTicket: RegisteredTicket | null;
  activeTicket: RegisteredTicket | null;
  activeServiceId: TerminalServiceId | null;
  activeTarget: NavigationTarget | null;
  checklistItems: JourneyChecklistItem[];
  currentRelativePosition: ARPosition | null;
  scannedQrCodeId: string | null;
  automatedStateManagement: boolean;
  pendingManualChecklistItemId: JourneyChecklistItemId | null;
  isCheckedIn: boolean;
  registerTicket: (ticket: RegisteredTicket) => void;
  hydrateChecklistItems: (items?: BackendChecklistItem[] | null) => void;
  startTicketSimulation: (ticket?: RegisteredTicket | null) => void;
  startServiceNavigation: (
    serviceId: TerminalServiceId,
    poiCoordinates?: ARPosition,
  ) => void;
  stopNavigation: () => void;
  setScannedQrCodeId: (qrCodeId: string) => void;
  setCurrentRelativePosition: (position: ARPosition) => void;
  setAutomatedStateManagement: (enabled: boolean) => void;
  toggleChecklistItem: (itemId: JourneyChecklistItemId) => void;
  completeChecklistItem: (
    itemId: JourneyChecklistItemId,
    source: CompletionSource,
  ) => void;
  completeNearbyChecklistItems: (position: ARPosition) => JourneyChecklistItemId[];
  completeNearbyChecklistItemsFromCoordinate: (
    coordinate: FloorCoordinate,
  ) => JourneyChecklistItemId[];
  syncTargetsFromMarkers: (markers: MapMarkerLike[]) => void;
  resetChecklist: () => void;
}

const getNextIncompleteJourneyTarget = (
  items: JourneyChecklistItem[],
  userFlightId?: string,
) => {
  const nextItem =
    items.find((item) => !item.isCompleted) ?? items[items.length - 1];
  return nextItem
    ? toNavigationTargetFromJourneyItem(nextItem, userFlightId)
    : null;
};

const getChecklistItemIndex = (
  items: JourneyChecklistItem[],
  itemId: JourneyChecklistItemId,
) => items.findIndex((item) => item.id === itemId);

const canCompleteChecklistItem = (
  items: JourneyChecklistItem[],
  itemId: JourneyChecklistItemId,
) => {
  const index = getChecklistItemIndex(items, itemId);

  if (index < 0) {
    return false;
  }

  return index === 0 || items[index - 1].isCompleted;
};

const findNearbyCompletableChecklistItem = (
  items: JourneyChecklistItem[],
  coordinate: FloorCoordinate,
) => {
  const nextItem = items.find((item) => !item.isCompleted);

  if (!nextItem || !canCompleteChecklistItem(items, nextItem.id)) {
    return null;
  }

  const targetCoordinate = targetPositionToFloorCoordinate(
    nextItem.targetPosition,
  );

  return distanceBetweenFloorCoordinates(coordinate, targetCoordinate) <=
    nextItem.radius
    ? nextItem
    : null;
};

const updateJourneyTarget = (
  activeTarget: NavigationTarget | null,
  checklistItems: JourneyChecklistItem[],
  activeTicket: RegisteredTicket | null,
) =>
  activeTarget?.kind === "journey"
    ? getNextIncompleteJourneyTarget(checklistItems, activeTicket?.userFlightId)
    : activeTarget;

export const useJourneySimulationStore = create<JourneySimulationState>(
  (set, get) => ({
    registeredTicket: null,
    activeTicket: null,
    activeServiceId: null,
    activeTarget: null,
    checklistItems: createDefaultChecklistItems(),
    currentRelativePosition: null,
    scannedQrCodeId: null,
    automatedStateManagement: false,
    pendingManualChecklistItemId: null,
    isCheckedIn: false,

    registerTicket: (ticket) => {
      const checklistItems = ticket.checklistItems
        ? createChecklistItemsFromBackend(ticket.checklistItems)
        : get().checklistItems;

      set({
        registeredTicket: ticket,
        checklistItems,
        pendingManualChecklistItemId: null,
        isCheckedIn:
          checklistItems.find((item) => item.id === "check-in")?.isCompleted ??
          false,
      });
    },

    hydrateChecklistItems: (items) => {
      const checklistItems = createChecklistItemsFromBackend(items);

      set((state) => ({
        checklistItems,
        pendingManualChecklistItemId: null,
        isCheckedIn:
          checklistItems.find((item) => item.id === "check-in")?.isCompleted ??
          false,
        activeTarget: updateJourneyTarget(
          state.activeTarget,
          checklistItems,
          state.activeTicket,
        ),
      }));
    },

    startTicketSimulation: (ticket) => {
      const nextTicket = ticket ?? get().registeredTicket;

      if (!nextTicket) {
        return;
      }

      const checklistItems = nextTicket.checklistItems
        ? createChecklistItemsFromBackend(nextTicket.checklistItems)
        : get().checklistItems;
      const activeTarget = getNextIncompleteJourneyTarget(
        checklistItems,
        nextTicket.userFlightId,
      );

      set({
        registeredTicket: nextTicket,
        activeTicket: nextTicket,
        activeServiceId: null,
        activeTarget,
        checklistItems,
        pendingManualChecklistItemId: null,
        isCheckedIn:
          checklistItems.find((item) => item.id === "check-in")?.isCompleted ??
          false,
      });
    },

    startServiceNavigation: (serviceId, poiCoordinates) => {
      const service = getTerminalService(serviceId);

      if (!service) {
        return;
      }

      set({
        activeServiceId: service.id,
        activeTarget: {
          ...toNavigationTargetFromService(service),
          ...(poiCoordinates ? { position: poiCoordinates } : {}),
        },
      });
    },

    stopNavigation: () => {
      set({
        activeServiceId: null,
        activeTarget: null,
      });
    },

    setScannedQrCodeId: (qrCodeId) => {
      set({ scannedQrCodeId: qrCodeId });
    },

    setCurrentRelativePosition: (position) => {
      set({ currentRelativePosition: position });
    },

    setAutomatedStateManagement: (enabled) => {
      set({
        automatedStateManagement: enabled,
        pendingManualChecklistItemId: enabled
          ? null
          : get().pendingManualChecklistItemId,
      });
    },

    toggleChecklistItem: (itemId) => {
      const state = get();
      const targetIndex = getChecklistItemIndex(state.checklistItems, itemId);

      if (targetIndex < 0) {
        return;
      }

      const targetItem = state.checklistItems[targetIndex];

      if (
        !targetItem.isCompleted &&
        !canCompleteChecklistItem(state.checklistItems, itemId)
      ) {
        return;
      }

      set((current) => {
        const checklistItems: JourneyChecklistItem[] =
          current.checklistItems.map((item, index) => {
            if (targetItem.isCompleted && index >= targetIndex) {
              return {
                ...item,
                isCompleted: false,
                completedBy: undefined,
              };
            }

            return item.id === itemId
              ? {
                  ...item,
                  isCompleted: true,
                  completedBy: "manual" as const,
                }
              : item;
          });

        const isCheckedIn =
          checklistItems.find((item) => item.id === "check-in")?.isCompleted ??
          current.isCheckedIn;

        return {
          checklistItems,
          isCheckedIn,
          pendingManualChecklistItemId:
            current.pendingManualChecklistItemId === itemId
              ? null
              : current.pendingManualChecklistItemId,
          activeTarget: updateJourneyTarget(
            current.activeTarget,
            checklistItems,
            current.activeTicket,
          ),
        };
      });
    },

    completeChecklistItem: (itemId, source) => {
      if (!canCompleteChecklistItem(get().checklistItems, itemId)) {
        return;
      }

      set((state) => {
        const checklistItems: JourneyChecklistItem[] =
          state.checklistItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  isCompleted: true,
                  completedBy: item.completedBy ?? source,
                }
              : item,
          );

        return {
          checklistItems,
          isCheckedIn: itemId === "check-in" ? true : state.isCheckedIn,
          pendingManualChecklistItemId:
            state.pendingManualChecklistItemId === itemId
              ? null
              : state.pendingManualChecklistItemId,
          activeTarget: updateJourneyTarget(
            state.activeTarget,
            checklistItems,
            state.activeTicket,
          ),
        };
      });
    },

    completeNearbyChecklistItems: (position) => {
      return get().completeNearbyChecklistItemsFromCoordinate(
        toFloorCoordinate(position),
      );
    },

    completeNearbyChecklistItemsFromCoordinate: (coordinate) => {
      const state = get();
      const position: ARPosition = [coordinate.x, 0, coordinate.y];
      const nearbyItem = findNearbyCompletableChecklistItem(
        state.checklistItems,
        coordinate,
      );

      if (!nearbyItem) {
        set({
          currentRelativePosition: position,
          pendingManualChecklistItemId: null,
        });
        return [];
      }

      if (!state.automatedStateManagement) {
        set({
          currentRelativePosition: position,
          pendingManualChecklistItemId: nearbyItem.id,
        });

        return [];
      }

      const completedIds = [nearbyItem.id];

      set((current) => {
        const checklistItems: JourneyChecklistItem[] =
          current.checklistItems.map((item) =>
            completedIds.includes(item.id)
              ? { ...item, isCompleted: true, completedBy: "ar" as const }
              : item,
          );

        return {
          checklistItems,
          currentRelativePosition: position,
          pendingManualChecklistItemId: null,
          isCheckedIn:
            current.isCheckedIn || completedIds.includes("check-in"),
          activeTarget: updateJourneyTarget(
            current.activeTarget,
            checklistItems,
            current.activeTicket,
          ),
        };
      });

      return completedIds;
    },

    syncTargetsFromMarkers: (markers) => {
      if (markers.length === 0) {
        return;
      }

      set((state) => {
        const checklistItems = state.checklistItems.map((item) => {
          const marker = findMarkerByAliases(markers, item.markerAliases);

          return marker
            ? {
                ...item,
                targetPosition: marker.position,
                qrCodeId: marker.qrCodeId || item.qrCodeId,
              }
            : item;
        });

        let activeTarget = state.activeTarget;

        if (activeTarget?.kind === "service" && state.activeServiceId) {
          const service = getTerminalService(state.activeServiceId);
          const marker = service
            ? findMarkerByAliases(markers, service.markerAliases)
            : undefined;

          if (service && marker) {
            activeTarget = {
              ...activeTarget,
              position: marker.position,
              qrCodeId: marker.qrCodeId || service.qrCodeId,
            };
          }
        }

        if (activeTarget?.kind === "journey") {
          const activeTargetId = activeTarget.id;
          const targetItem = checklistItems.find(
            (item) => item.id === activeTargetId,
          );

          if (targetItem) {
            activeTarget = toNavigationTargetFromJourneyItem(
              targetItem,
              state.activeTicket?.userFlightId,
            );
          }
        }

        return {
          checklistItems,
          activeTarget,
          pendingManualChecklistItemId: state.pendingManualChecklistItemId
            ? checklistItems.some(
                (item) =>
                  item.id === state.pendingManualChecklistItemId &&
                  !item.isCompleted,
              )
              ? state.pendingManualChecklistItemId
              : null
            : null,
        };
      });
    },

    resetChecklist: () => {
      const current = get();
      const checklistItems = createDefaultChecklistItems();

      set({
        checklistItems,
        isCheckedIn: false,
        pendingManualChecklistItemId: null,
        activeTarget:
          current.activeTarget?.kind === "journey"
            ? getNextIncompleteJourneyTarget(
                checklistItems,
                current.activeTicket?.userFlightId,
              )
            : current.activeTarget,
      });
    },
  }),
);
