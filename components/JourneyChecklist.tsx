import { useJourneySimulationStore } from "@/stores/useJourneySimulationStore";
import { apiFetch } from "@/utils/apiFetch";
import { JourneyChecklistItemId } from "@/utils/journeySimulation";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Circle,
  LockKeyhole,
  RotateCcw,
} from "lucide-react-native";
import React, { useCallback } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

export const JourneyChecklist = () => {
  const queryClient = useQueryClient();
  const checklistItems = useJourneySimulationStore(
    (state) => state.checklistItems,
  );
  const activeTicket = useJourneySimulationStore((state) => state.activeTicket);
  const registeredTicket = useJourneySimulationStore(
    (state) => state.registeredTicket,
  );
  const activeTarget = useJourneySimulationStore((state) => state.activeTarget);
  const isCheckedIn = useJourneySimulationStore((state) => state.isCheckedIn);
  const toggleChecklistItem = useJourneySimulationStore(
    (state) => state.toggleChecklistItem,
  );
  const resetChecklist = useJourneySimulationStore(
    (state) => state.resetChecklist,
  );

  const completedCount = checklistItems.filter((item) => item.isCompleted).length;
  const currentTicket = activeTicket ?? registeredTicket;

  const syncChecklistToBackend = useCallback(async () => {
    if (!currentTicket?.userFlightId) {
      return;
    }

    const latestItems = useJourneySimulationStore.getState().checklistItems;

    try {
      await apiFetch(`/flight/${currentTicket.userFlightId}/checklist`, {
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
      console.warn("Failed to sync checklist:", error);
    }
  }, [currentTicket?.userFlightId, queryClient]);

  const handleToggleChecklistItem = (itemId: JourneyChecklistItemId) => {
    toggleChecklistItem(itemId);
    void syncChecklistToBackend();
  };

  const handleResetChecklist = () => {
    resetChecklist();
    void syncChecklistToBackend();
  };

  return (
    <View className="mt-8">
      <View className="bg-white rounded-[28px] border border-borderDefault shadow-card p-lg mb-md">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[10px] font-black text-meta uppercase tracking-[3px]">
              Journey Sync
            </Text>
            <Text className="text-xl font-black text-primary mt-1">
              {completedCount}/{checklistItems.length} complete
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleResetChecklist}
            className="w-10 h-10 items-center justify-center rounded-2xl bg-inputSurface"
          >
            <RotateCcw size={18} color="#1568C4" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center mt-md">
          <View
            className={`w-2 h-2 rounded-full mr-sm ${
              isCheckedIn ? "bg-statusD" : "bg-statusA"
            }`}
          />
          <Text className="text-xs font-bold text-meta">
            {isCheckedIn
              ? "Checked in for this journey"
              : "Waiting for AR check-in"}
          </Text>
        </View>

      </View>

      {checklistItems.map((item, index) => {
        const isActive =
          activeTarget?.kind === "journey" && activeTarget.id === item.id;
        const isPreviousComplete =
          index === 0 || checklistItems[index - 1].isCompleted;
        const isLocked = !item.isCompleted && !isPreviousComplete;

        return (
          <Pressable
            key={item.id}
            onPress={() => handleToggleChecklistItem(item.id)}
            disabled={isLocked}
            className={`mb-md rounded-[28px] border-2 p-md ${
              item.isCompleted
                ? "bg-white border-primaryBrand/20"
                : isLocked
                  ? "bg-slate-50 border-borderDefault"
                : isActive
                  ? "bg-nova/10 border-nova/30"
                  : "bg-white border-borderDefault"
            }`}
          >
            <View className="flex-row items-start">
              <View
                className={`w-11 h-11 rounded-2xl items-center justify-center ${
                  item.isCompleted
                    ? "bg-primaryBrand"
                    : isLocked
                      ? "bg-slate-100"
                      : "bg-inputSurface"
                }`}
              >
                {item.isCompleted ? (
                  <CheckCircle2 size={22} color="white" />
                ) : isLocked ? (
                  <LockKeyhole size={18} color="#94a3b8" />
                ) : (
                  <Circle size={20} color={isActive ? "#7B5FE8" : "#7B8BAA"} />
                )}
              </View>

              <View className="flex-1 ml-md">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-black text-primary">
                    {item.title}
                  </Text>
                  <Text className="text-[10px] font-black uppercase tracking-widest text-meta">
                    {item.time}
                  </Text>
                </View>

                <Text className="text-xs leading-5 text-secondary mt-xs">
                  {item.description}
                </Text>

                <View className="flex-row items-center justify-between mt-md">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-meta">
                    Step {index + 1}
                  </Text>
                  <View
                    className={`px-sm py-xs rounded-full ${
                      item.isCompleted
                        ? "bg-primaryBrand/10"
                        : isActive
                          ? "bg-nova/10"
                          : "bg-inputSurface"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-black uppercase ${
                        item.isCompleted
                          ? "text-primaryBrand"
                          : isActive
                            ? "text-nova"
                            : "text-meta"
                      }`}
                    >
                      {item.isCompleted
                        ? item.completedBy === "ar"
                          ? "AR"
                          : "Done"
                        : isLocked
                          ? "Locked"
                        : isActive
                          ? "Active"
                          : "Open"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
