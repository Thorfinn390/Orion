import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Download,
  Info,
  Map as MapIcon,
  MapPin,
  RefreshCw,
  Settings,
  Ticket,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FlightCard from "../../components/FlightCard";
import { HomeTicketFlight } from "../../components/TicketCard";
import { useAuthStore } from "../../stores/useAuthStore";
import {
  RegisteredTicket,
  useJourneySimulationStore,
} from "../../stores/useJourneySimulationStore";
import { apiFetch } from "../../utils/apiFetch";
import { BackendChecklistItem } from "../../utils/journeySimulation";

type GuideChecklistItem = BackendChecklistItem & {
  backendId?: string;
  itemType?: string | null;
  isMandatory?: boolean;
};

type GuideFlight = HomeTicketFlight & {
  guideId?: string | null;
  checklistItems?: GuideChecklistItem[] | null;
  checklistTasks?: unknown[] | null;
  simulation?: {
    minutesToDeparture?: number;
    delayMinutes?: number;
    phase?: string;
    progress?: number;
    serverTime?: string;
  };
};

type GuideApiResponse = {
  status?: boolean;
  message?: string;
  data?: GuideFlight[];
};

const DEFAULT_PACKING_MINUTES = "60";
const DEFAULT_BUFFER_MINUTES = "30";
const FALLBACK_TRAVEL_MINUTES = 90;

const parseDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const coerceMinutes = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const formatClock = (date?: Date | null) =>
  date
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "TBA";

const formatClockDate = (date?: Date | null) =>
  date
    ? `${formatClock(date)}, ${date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })}`
    : "TBA";

const formatStatus = (status?: string | null) =>
  (status || "REGISTERED").replace(/_/g, " ");

const getDepartureDate = (flight?: GuideFlight | null) =>
  flight
    ? parseDate(
        flight.expected_departure_time ?? flight.scheduled_departure_time,
      )
    : null;

const getChecklistDueDate = (
  checklist: GuideChecklistRow[],
  itemId: string,
) => checklist.find((item) => item.id === itemId)?.dueDate ?? null;

type GuideChecklistRow = {
  id: string;
  taskName: string;
  dueDate: Date | null;
  dueTimestamp: number;
  due_time: string;
  is_completed: boolean;
  is_mandatory: boolean;
};

const toChecklistRows = (
  items?: GuideChecklistItem[] | null,
): GuideChecklistRow[] =>
  (items ?? []).map((item) => {
    const dueDate = parseDate(item.dueTime);
    const id = item.itemType ?? item.id;

    return {
      id,
      taskName: item.title ?? "Journey Step",
      dueDate,
      dueTimestamp: dueDate?.getTime() ?? Number.POSITIVE_INFINITY,
      due_time: dueDate ? `Due ${formatClockDate(dueDate)}` : "Due time TBA",
      is_completed: Boolean(item.isCompleted ?? item.is_completed),
      is_mandatory: Boolean(item.isMandatory),
    };
  });

const fetchRegisteredFlights = async () => {
  const response = await apiFetch("/flight", { method: "GET" });
  const result = (await response.json()) as GuideApiResponse;

  if (!response.ok || !result?.status) {
    throw new Error(result?.message ?? "Failed to load registered flights.");
  }

  return result.data ?? [];
};

export default function JourneyControlCenter() {
  const queryClient = useQueryClient();
  const fullName = useAuthStore((state) => state.fullName) || "traveler";
  const registeredTicket = useJourneySimulationStore(
    (state) => state.registeredTicket,
  );
  const registerTicket = useJourneySimulationStore(
    (state) => state.registerTicket,
  );
  const hydrateChecklistItems = useJourneySimulationStore(
    (state) => state.hydrateChecklistItems,
  );

  const [selectedUserFlightId, setSelectedUserFlightId] = useState<
    string | null
  >(registeredTicket?.userFlightId ?? null);
  const [packingTime, setPackingTime] = useState(DEFAULT_PACKING_MINUTES);
  const [bufferTime, setBufferTime] = useState(DEFAULT_BUFFER_MINUTES);
  const [showAirportGuide, setShowAirportGuide] = useState(false);
  const [localChecklist, setLocalChecklist] = useState<GuideChecklistRow[]>([]);
  const [now, setNow] = useState(Date.now());

  const {
    data: registeredFlights = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["guideRegisteredFlights"],
    queryFn: fetchRegisteredFlights,
    refetchInterval: 30000,
  });

  const currentFlight = useMemo(() => {
    if (registeredFlights.length === 0) {
      return null;
    }

    return (
      registeredFlights.find(
        (flight) => flight.userFlightId === selectedUserFlightId,
      ) ??
      registeredFlights.find(
        (flight) => flight.userFlightId === registeredTicket?.userFlightId,
      ) ??
      registeredFlights[0]
    );
  }, [
    registeredFlights,
    registeredTicket?.userFlightId,
    selectedUserFlightId,
  ]);
  const currentUserFlightId = currentFlight?.userFlightId ?? null;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentFlight) {
      setLocalChecklist([]);
      return;
    }

    setSelectedUserFlightId(currentFlight.userFlightId);
    const ticket: RegisteredTicket = {
      userFlightId: currentFlight.userFlightId,
      flightId: currentFlight.id,
      flightNumber: currentFlight.flight_number,
      gate: currentFlight.gate,
      terminal: currentFlight.terminal,
      checklistItems: currentFlight.checklistItems,
    };

    registerTicket(ticket);
    hydrateChecklistItems(currentFlight.checklistItems);
    setLocalChecklist(toChecklistRows(currentFlight.checklistItems));
  }, [currentFlight, hydrateChecklistItems, registerTicket]);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!currentUserFlightId) {
        return;
      }

      try {
        const storedGuide = await AsyncStorage.getItem(
          `guide_prefs_${currentUserFlightId}`,
        );

        if (!storedGuide) {
          setPackingTime(DEFAULT_PACKING_MINUTES);
          setBufferTime(DEFAULT_BUFFER_MINUTES);
          return;
        }

        const parsedGuide = JSON.parse(storedGuide);
        setPackingTime(parsedGuide.packingTime ?? DEFAULT_PACKING_MINUTES);
        setBufferTime(parsedGuide.bufferTime ?? DEFAULT_BUFFER_MINUTES);
      } catch (loadError) {
        console.warn("Failed to load guide preferences:", loadError);
      }
    };

    void loadPreferences();
  }, [currentUserFlightId]);

  const departureDate = getDepartureDate(currentFlight);
  const checkInDueDate =
    getChecklistDueDate(localChecklist, "check-in") ??
    (departureDate
      ? new Date(departureDate.getTime() - 3 * 60 * 60 * 1000)
      : null);
  const boardingDueDate =
    getChecklistDueDate(localChecklist, "boarding") ??
    (departureDate
      ? new Date(departureDate.getTime() - 45 * 60 * 1000)
      : null);
  const arrivalDueDate =
    getChecklistDueDate(localChecklist, "arrival") ??
    (departureDate
      ? new Date(departureDate.getTime() + 3 * 60 * 60 * 1000)
      : null);
  const bufferMinutes = coerceMinutes(bufferTime, Number(DEFAULT_BUFFER_MINUTES));
  const packingMinutes = coerceMinutes(
    packingTime,
    Number(DEFAULT_PACKING_MINUTES),
  );
  const calculatedLeaveDate = checkInDueDate
    ? new Date(
        checkInDueDate.getTime() -
          (FALLBACK_TRAVEL_MINUTES + bufferMinutes) * 60 * 1000,
      )
    : null;
  const prepStartDate = calculatedLeaveDate
    ? new Date(calculatedLeaveDate.getTime() - packingMinutes * 60 * 1000)
    : null;
  const hasMandatoryOverdue = localChecklist.some(
    (item) =>
      !item.is_completed && item.is_mandatory && item.dueTimestamp < now,
  );
  const statusLabel = hasMandatoryOverdue
    ? "ACTION REQUIRED"
    : formatStatus(currentFlight?.status);

  const flightCardProps = currentFlight
    ? {
        id: currentFlight.userFlightId,
        airline: "Orion",
        airlineCode: currentFlight.flight_number.slice(0, 2),
        flightNumber: currentFlight.flight_number,
        status: statusLabel,
        from: currentFlight.departureAirport.iata_code,
        fromCity: currentFlight.departureAirport.city,
        to: currentFlight.arrivalAirport.iata_code,
        toCity: currentFlight.arrivalAirport.city,
        departureTime: formatClockDate(departureDate),
        arrivalTime: formatClockDate(arrivalDueDate),
        duration: "TBA",
        gate: currentFlight.gate || "--",
        terminal: currentFlight.terminal || "TBA",
        seat: "--",
        zone: "--",
        passenger: fullName,
        class: "ECONOMY" as const,
        barcode: `${currentFlight.flight_number}-${currentFlight.userFlightId.slice(
          0,
          8,
        )}`,
      }
    : null;

  const saveGuidePreferences = async () => {
    if (!currentFlight) {
      return;
    }

    try {
      await AsyncStorage.setItem(
        `guide_prefs_${currentFlight.userFlightId}`,
        JSON.stringify({ packingTime, bufferTime }),
      );
      Alert.alert("Guide Updated", "Your timing preferences were saved.");
    } catch {
      Alert.alert("Error", "Could not save guide preferences.");
    }
  };

  const toggleChecklistItem = async (id: string) => {
    if (!currentFlight) {
      return;
    }

    const updatedChecklist = localChecklist.map((item) =>
      item.id === id
        ? { ...item, is_completed: !item.is_completed }
        : item,
    );
    setLocalChecklist(updatedChecklist);
    hydrateChecklistItems(
      updatedChecklist.map((item) => ({
        id: item.id,
        title: item.taskName,
        dueTime: item.dueDate?.toISOString(),
        isCompleted: item.is_completed,
        is_completed: item.is_completed,
      })),
    );

    try {
      await apiFetch(`/flight/${currentFlight.userFlightId}/checklist`, {
        method: "PUT",
        body: JSON.stringify({
          items: updatedChecklist.map((item) => ({
            id: item.id,
            isCompleted: item.is_completed,
          })),
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["guideRegisteredFlights"] });
      queryClient.invalidateQueries({ queryKey: ["homeRegisteredFlights"] });
      queryClient.invalidateQueries({ queryKey: ["userFlights"] });
    } catch (syncError) {
      console.warn("Failed to sync guide checklist:", syncError);
    }
  };

  const exportGuideToPDF = async () => {
    if (!currentFlight) {
      return;
    }

    try {
      const checklistHtml = localChecklist
        .map((item) => {
          const isOverdue =
            !item.is_completed && item.dueTimestamp < now;
          const statusColor = item.is_completed
            ? "#10b981"
            : isOverdue
              ? "#ef4444"
              : "#64748b";
          const icon = item.is_completed ? "Done" : "Open";

          return `
            <li style="margin-bottom: 12px;">
              <strong style="color: ${statusColor};">${icon}</strong>
              <span style="font-weight: 700;">${item.taskName}</span>
              <span style="color: #64748b; font-size: 12px;">${item.due_time}</span>
            </li>`;
        })
        .join("");

      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #1e293b; padding: 40px; }
              .header { background: #312e81; color: white; padding: 32px; border-radius: 20px; }
              .flight { font-size: 48px; font-weight: 900; margin: 8px 0; }
              .section { margin-top: 28px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; }
              .title { font-size: 18px; font-weight: 900; margin-bottom: 16px; }
              li { line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>Official Voyager Guide for ${fullName}</div>
              <div class="flight">${currentFlight.flight_number}</div>
              <div>${currentFlight.departureAirport.iata_code} to ${currentFlight.arrivalAirport.iata_code}</div>
            </div>
            <div class="section">
              <div class="title">Timeline</div>
              <p>Prep starts: ${formatClockDate(prepStartDate)}</p>
              <p>Leave for airport: ${formatClockDate(calculatedLeaveDate)}</p>
              <p>Check-in target: ${formatClockDate(checkInDueDate)}</p>
              <p>Boarding target: ${formatClockDate(boardingDueDate)}</p>
              <p>Departure: ${formatClockDate(departureDate)}</p>
            </div>
            <div class="section">
              <div class="title">Checklist</div>
              <ul>${checklistHtml}</ul>
            </div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch {
      Alert.alert("Export Error", "Could not generate PDF.");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 py-4 flex-row justify-between items-center bg-slate-50 z-10">
        <View>
          <Text className="text-[10px] font-black text-indigo-600 tracking-widest uppercase mb-1">
            Flight Control
          </Text>
          <Text className="text-2xl font-black text-slate-900">
            Welcome, {fullName.split(" ")[0]}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => refetch()}
          className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 items-center justify-center relative"
        >
          {hasMandatoryOverdue && (
            <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full z-10 border border-white" />
          )}
          {isRefetching ? (
            <ActivityIndicator size="small" color="#64748b" />
          ) : (
            <RefreshCw size={18} color="#64748b" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View className="bg-white p-6 rounded-[28px] border border-red-100 shadow-sm">
            <Text className="text-lg font-black text-slate-900">
              Could not load flights
            </Text>
            <Text className="text-sm text-slate-500 mt-2 leading-5">
              {error instanceof Error
                ? error.message
                : "Please try again in a moment."}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="mt-5 bg-indigo-600 py-4 rounded-2xl items-center"
            >
              <Text className="text-white font-black uppercase tracking-widest text-xs">
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : !currentFlight || !flightCardProps ? (
          <TouchableOpacity
            onPress={() => router.push("/(flight)/RegisterFlight")}
            activeOpacity={0.85}
            className="bg-white rounded-[28px] w-full shadow-sm border border-slate-100 p-6"
          >
            <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mb-4">
              <Ticket size={24} color="#4f46e5" />
            </View>
            <Text className="text-xl font-black text-slate-900">
              No registered flight
            </Text>
            <Text className="text-sm text-slate-500 mt-2 leading-5">
              Register a ticket to unlock your live guide, checklist, and
              airport timeline.
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            {registeredFlights.length > 1 ? (
              <View className="mb-5">
                <Text className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3">
                  Registered Flights
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-3">
                    {registeredFlights.map((flight) => {
                      const isSelected =
                        flight.userFlightId === currentFlight.userFlightId;

                      return (
                        <TouchableOpacity
                          key={flight.userFlightId}
                          onPress={() =>
                            setSelectedUserFlightId(flight.userFlightId)
                          }
                          className={`px-4 py-3 rounded-2xl border ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-white border-slate-100"
                          }`}
                        >
                          <Text
                            className={`text-xs font-black uppercase tracking-widest ${
                              isSelected ? "text-white" : "text-slate-600"
                            }`}
                          >
                            {flight.flight_number}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            ) : null}

            <FlightCard flight={flightCardProps} />

            {hasMandatoryOverdue ? (
              <View className="bg-red-50 border border-red-200 p-4 rounded-[28px] shadow-sm flex-row items-start gap-4 mt-6">
                <View className="bg-red-100 p-2 rounded-xl">
                  <Bell size={18} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">
                    Nova Alert
                  </Text>
                  <Text className="text-sm text-red-800 italic leading-5 font-medium">
                    You have mandatory checklist items that are overdue for
                    this registered flight.
                  </Text>
                </View>
              </View>
            ) : null}

            <View className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 mt-6">
              <Text className="text-xl font-black text-slate-800 mb-2">
                Guide Timing
              </Text>
              <Text className="text-sm text-slate-500 mb-6 leading-5">
                Timings are based on the flight departure and backend checklist
                due times.
              </Text>

              <View className="mb-5">
                <Text className="text-xs font-extrabold text-slate-400 tracking-widest uppercase mb-3">
                  Packing Time (Mins)
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={packingTime}
                  onChangeText={setPackingTime}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-slate-800"
                />
              </View>

              <View className="mb-6">
                <Text className="text-xs font-extrabold text-slate-400 tracking-widest uppercase mb-3">
                  Contingency Buffer (Mins)
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={bufferTime}
                  onChangeText={setBufferTime}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-slate-800"
                />
              </View>

              <TouchableOpacity
                onPress={saveGuidePreferences}
                className="bg-indigo-600 py-4 rounded-2xl shadow-lg shadow-indigo-200 items-center"
              >
                <Text className="text-white font-black text-sm uppercase tracking-widest">
                  Save Timing
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between mt-6 mb-6 gap-3">
              <TouchableOpacity
                onPress={exportGuideToPDF}
                className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 items-center shadow-sm flex-row justify-center gap-2"
              >
                <Download size={18} color="#4f46e5" />
                <Text className="text-sm font-bold text-slate-700">
                  Export PDF
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-slate-900 rounded-[28px] p-6 mb-6 shadow-xl shadow-slate-300">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white/60 font-bold text-xs tracking-widest uppercase">
                  Calculated Departure
                </Text>
                <Clock size={16} color="#a5b4fc" />
              </View>
              <Text className="text-4xl font-black text-white mb-2">
                {formatClock(calculatedLeaveDate)}
              </Text>
              <Text className="text-indigo-200 text-sm mb-6 leading-5">
                Prep starts at {formatClock(prepStartDate)}. Target check-in is{" "}
                {formatClock(checkInDueDate)}, with {bufferMinutes}m buffer and
                about {FALLBACK_TRAVEL_MINUTES}m travel time.
              </Text>

              <View className="h-40 rounded-2xl bg-slate-800 border border-slate-700 mb-4 items-center justify-center relative overflow-hidden">
                <MapIcon size={32} color="#6366f1" opacity={0.5} />
                <Text className="text-indigo-300/50 text-[10px] font-bold mt-2 uppercase tracking-widest">
                  Route Visual Map
                </Text>

                <View className="absolute bottom-3 left-3 bg-white/95 px-3 py-1.5 rounded-full flex-row items-center shadow-lg">
                  <MapPin size={12} color="#4f46e5" />
                  <Text className="text-[10px] font-black text-slate-800 ml-1.5">
                    Home to {currentFlight.departureAirport.iata_code} Airport
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-center gap-2 mt-2 bg-slate-800 p-3 rounded-xl border border-slate-700">
                <Settings size={14} color="#a5b4fc" />
                <Text className="text-indigo-200 text-xs font-bold uppercase tracking-wider">
                  Departure {formatClockDate(departureDate)}
                </Text>
              </View>
            </View>

            <View className="mb-6 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-black text-slate-800">
                  Mission Checklist
                </Text>
                <View className="bg-indigo-50 px-2 py-1 rounded-md">
                  <Text className="text-[10px] font-bold text-indigo-600">
                    {localChecklist.filter((item) => item.is_completed).length}/
                    {localChecklist.length} Done
                  </Text>
                </View>
              </View>

              {localChecklist.length === 0 ? (
                <Text className="text-sm text-slate-500">
                  Checklist generation is still pending for this flight.
                </Text>
              ) : (
                localChecklist.map((item) => {
                  const isOverdue =
                    !item.is_completed && item.dueTimestamp < now;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => toggleChecklistItem(item.id)}
                      className="flex-row items-center py-4 border-b border-slate-50 last:border-0"
                    >
                      {item.is_completed ? (
                        <CheckCircle2 size={24} color="#10b981" />
                      ) : (
                        <Circle
                          size={24}
                          color={isOverdue ? "#fca5a5" : "#cbd5e1"}
                        />
                      )}
                      <View className="ml-3 flex-1">
                        <Text
                          className={`text-sm font-bold ${
                            item.is_completed
                              ? "text-slate-400 line-through"
                              : "text-slate-700"
                          }`}
                        >
                          {item.taskName}{" "}
                          {item.is_mandatory ? (
                            <Text className="text-red-400">*</Text>
                          ) : null}
                        </Text>

                        <View className="flex-row items-center mt-1">
                          <Text
                            className={`text-xs ${
                              isOverdue
                                ? "text-red-500 font-bold"
                                : "text-slate-400"
                            }`}
                          >
                            {item.due_time}
                          </Text>
                          {isOverdue ? (
                            <View className="ml-2 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                              <Text className="text-[9px] font-black text-red-600 uppercase">
                                Overdue
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            <View className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden mb-10">
              <TouchableOpacity
                onPress={() => setShowAirportGuide(!showAirportGuide)}
                className="p-6 flex-row justify-between items-center"
              >
                <View className="flex-row items-center gap-3">
                  <View className="bg-indigo-50 p-2 rounded-xl">
                    <Info size={20} color="#4f46e5" />
                  </View>
                  <View>
                    <Text className="text-lg font-black text-slate-800">
                      Internal Airport Guide
                    </Text>
                    <Text className="text-xs text-slate-400 font-medium">
                      Terminal {currentFlight.terminal || "TBA"} - Gate{" "}
                      {currentFlight.gate || "--"}
                    </Text>
                  </View>
                </View>
                {showAirportGuide ? (
                  <ChevronUp size={20} color="#64748b" />
                ) : (
                  <ChevronDown size={20} color="#64748b" />
                )}
              </TouchableOpacity>

              {showAirportGuide ? (
                <View className="px-6 pb-6 pt-2 bg-slate-50 border-t border-slate-100">
                  <View className="mb-4">
                    <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      Step 1: Check-in
                    </Text>
                    <Text className="text-sm text-slate-700 leading-5">
                      Arrive by {formatClock(checkInDueDate)} and follow signs
                      for {currentFlight.departureAirport.name ?? "check-in"}.
                    </Text>
                  </View>
                  <View className="mb-4">
                    <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      Step 2: Security
                    </Text>
                    <Text className="text-sm text-slate-700 leading-5">
                      Clear security before the boarding target at{" "}
                      {formatClock(boardingDueDate)}.
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      Step 3: Boarding
                    </Text>
                    <Text className="text-sm text-slate-700 leading-5">
                      Head to Gate {currentFlight.gate || "--"} in Terminal{" "}
                      {currentFlight.terminal || "TBA"} before departure at{" "}
                      {formatClock(departureDate)}.
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
