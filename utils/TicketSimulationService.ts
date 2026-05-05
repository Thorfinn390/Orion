import { router } from "expo-router";
import { apiFetch } from "./apiFetch";
import {
  ARPosition,
  FloorCoordinate,
  TerminalServiceId,
  getTerminalService,
} from "./journeySimulation";
import {
  RegisteredTicket,
  useJourneySimulationStore,
} from "@/stores/useJourneySimulationStore";

type FlightRegistrationPayload = {
  flight_number: string;
  passcode: string;
};

type RegisteredFlightResponse = {
  id: string;
  userFlightId?: string;
  flightId?: string;
  flight_number?: string;
  gate?: string | null;
  terminal?: string | null;
  checklistItems?: RegisteredTicket["checklistItems"];
  flight?: {
    id?: string;
    flight_number?: string;
    terminal?: string | null;
    gate?: string | null;
    checklistItems?: RegisteredTicket["checklistItems"];
  };
};

type RegisterFlightResult = {
  raw: RegisteredFlightResponse;
  ticket: RegisteredTicket;
};

const toNumberParam = (value: number) => value.toFixed(4);

export const toRegisteredTicket = (
  data: RegisteredFlightResponse,
): RegisteredTicket => {
  const flight = data.flight ?? data;

  return {
    userFlightId: data.userFlightId ?? data.id,
    flightId: data.flightId ?? flight.id,
    flightNumber: data.flight_number ?? flight.flight_number,
    gate: data.gate ?? flight.gate,
    terminal: data.terminal ?? flight.terminal,
    checklistItems: data.checklistItems ?? flight.checklistItems,
  };
};

export const TicketSimulationService = {
  async registerFlight(
    payload: FlightRegistrationPayload,
  ): Promise<RegisterFlightResult> {
    const response = await apiFetch("/flight/associate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok || result?.status === false || !result?.data) {
      throw new Error(result?.message ?? "Failed to register flight");
    }

    const raw = result.data as RegisteredFlightResponse;
    const ticket = toRegisteredTicket(raw);

    useJourneySimulationStore.getState().registerTicket(ticket);

    return { raw, ticket };
  },

  startJourney(ticket?: RegisteredTicket | null) {
    const store = useJourneySimulationStore.getState();
    const activeTicket = ticket ?? store.registeredTicket;

    if (!activeTicket) {
      router.push("/(flight)/RegisterFlight");
      return;
    }

    store.registerTicket(activeTicket);
    store.startTicketSimulation(activeTicket);

    router.push({
      pathname: "/(tabs)/map",
      params: {
        mode: "journey",
        ar: "1",
        userFlightId: activeTicket.userFlightId,
        flightNumber: activeTicket.flightNumber ?? "",
      },
    });
  },

  startServiceAR(serviceId: TerminalServiceId) {
    const service = getTerminalService(serviceId);

    if (!service) {
      return;
    }

    const poiCoordinates = service.targetPosition;
    useJourneySimulationStore
      .getState()
      .startServiceNavigation(service.id, poiCoordinates);

    router.push({
      pathname: "/(tabs)/map",
      params: {
        mode: "service",
        ar: "1",
        serviceId: service.id,
        poiX: toNumberParam(poiCoordinates[0]),
        poiY: toNumberParam(poiCoordinates[1]),
        poiZ: toNumberParam(poiCoordinates[2]),
      },
    });
  },

  handleViroPosition(position: ARPosition) {
    return useJourneySimulationStore
      .getState()
      .completeNearbyChecklistItems(position);
  },

  handleFloorCoordinate(coordinate: FloorCoordinate) {
    return useJourneySimulationStore
      .getState()
      .completeNearbyChecklistItemsFromCoordinate(coordinate);
  },

  handleBackgroundGeofenceEvent(event: FloorCoordinate) {
    return useJourneySimulationStore
      .getState()
      .completeNearbyChecklistItemsFromCoordinate(event);
  },

  async syncChecklistToBackend(userFlightId?: string | null) {
    if (!userFlightId) {
      return;
    }

    const latestItems = useJourneySimulationStore.getState().checklistItems;

    await apiFetch(`/flight/${userFlightId}/checklist`, {
      method: "PUT",
      body: JSON.stringify({
        items: latestItems.map((item) => ({
          id: item.id,
          isCompleted: item.isCompleted,
        })),
      }),
    });
  },
};
