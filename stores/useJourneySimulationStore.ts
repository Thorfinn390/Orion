import { create } from "zustand";
import {
  ARPosition,
  BackendChecklistItem,
  JourneyChecklistItem,
  JourneyChecklistItemId,
  MapMarkerLike,
  NavigationTarget,
  TerminalServiceId,
  createChecklistItemsFromBackend,
  createDefaultChecklistItems,
  distanceOnFloor,
  findMarkerByAliases,
  getTerminalService,
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
  isCheckedIn: boolean;
  registerTicket: (ticket: RegisteredTicket) => void;
  hydrateChecklistItems: (items?: BackendChecklistItem[] | null) => void;
  startTicketSimulation: (ticket?: RegisteredTicket | null) => void;
  startServiceNavigation: (serviceId: TerminalServiceId) => void;
  stopNavigation: () => void;
  setScannedQrCodeId: (qrCodeId: string) => void;
  setCurrentRelativePosition: (position: ARPosition) => void;
  toggleChecklistItem: (itemId: JourneyChecklistItemId) => void;
  completeChecklistItem: (
    itemId: JourneyChecklistItemId,
    source: CompletionSource,
  ) => void;
  completeNearbyChecklistItems: (position: ARPosition) => JourneyChecklistItemId[];
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
    isCheckedIn: false,

    registerTicket: (ticket) => {
      const checklistItems = ticket.checklistItems
        ? createChecklistItemsFromBackend(ticket.checklistItems)
        : get().checklistItems;

      set({
        registeredTicket: ticket,
        checklistItems,
        isCheckedIn:
          checklistItems.find((item) => item.id === "check-in")?.isCompleted ??
          false,
      });
    },

    hydrateChecklistItems: (items) => {
      const checklistItems = createChecklistItemsFromBackend(items);

      set((state) => ({
        checklistItems,
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
        isCheckedIn:
          checklistItems.find((item) => item.id === "check-in")?.isCompleted ??
          false,
      });
    },

    startServiceNavigation: (serviceId) => {
      const service = getTerminalService(serviceId);

      if (!service) {
        return;
      }

      set({
        activeServiceId: service.id,
        activeTarget: toNavigationTargetFromService(service),
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

    toggleChecklistItem: (itemId) => {
      const state = get();
      const targetIndex = getChecklistItemIndex(state.checklistItems, itemId);

      if (targetIndex < 0) {
        return;
      }

      const targetItem = state.checklistItems[targetIndex];

      if (!targetItem.isCompleted && !canCompleteChecklistItem(state.checklistItems, itemId)) {
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
          activeTarget: updateJourneyTarget(
            state.activeTarget,
            checklistItems,
            state.activeTicket,
          ),
        };
      });
    },

    completeNearbyChecklistItems: (position) => {
      const state = get();
      const nextItem = state.checklistItems.find((item) => !item.isCompleted);
      const completedIds =
        nextItem &&
        canCompleteChecklistItem(state.checklistItems, nextItem.id) &&
        distanceOnFloor(position, nextItem.targetPosition) <= nextItem.radius
          ? [nextItem.id]
          : [];

      if (completedIds.length === 0) {
        set({ currentRelativePosition: position });
        return completedIds;
      }

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
        };
      });
    },

    resetChecklist: () => {
      const current = get();
      const checklistItems = createDefaultChecklistItems();

      set({
        checklistItems,
        isCheckedIn: false,
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
