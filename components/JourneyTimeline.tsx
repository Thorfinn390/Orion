import { CheckCircle2, Clock } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, Text, View } from "react-native";

export const JourneyTimeline = () => {
  const steps = [
    {
      id: 1,
      title: "Check-in",
      time: "05:30 AM",
      description: "Baggage dropped at Counter 42. Boarding pass issued.",
      isCompleted: true,
      isActive: false,
    },
    {
      id: 2,
      title: "Security Check",
      time: "06:15 AM",
      description: "Fast track security cleared in 8 minutes.",
      isCompleted: true,
      isActive: false,
    },
    {
      id: 3,
      title: "Boarding",
      time: "07:45 AM",
      description: "Gate B12 is now boarding Zone 1 & 2.",
      isCompleted: false,
      isActive: true,
    },
    {
      id: 4,
      title: "Takeoff",
      time: "08:30 AM",
      description: "Estimated departure on time.",
      isCompleted: false,
      isActive: false,
    },
  ];

  const handleTimelineStep = (stepName: string) => {
    Alert.alert("Timeline Action", `Tapped on ${stepName}`);
  };

  return (
    <View className="mt-8">
      {steps.map((step, index) => (
        <View key={step.id} className="flex-row gap-6">
          <View className="items-center">
            <View
              className={`w-4 h-4 rounded-full items-center justify-center z-10 ${
                step.isCompleted
                  ? "bg-indigo-600"
                  : step.isActive
                  ? "bg-white border-4 border-indigo-600"
                  : "bg-white border-2 border-slate-300"
              }`}
            >
              {step.isCompleted && (
                <CheckCircle2 size={10} color="white" strokeWidth={4} />
              )}
            </View>
            {index !== steps.length - 1 && (
              <View
                className={`w-[2px] flex-1 my-1 ${
                  step.isCompleted ? "bg-indigo-600" : "bg-slate-200"
                }`}
              />
            )}
          </View>

          <Pressable
            onPress={() => handleTimelineStep(step.title)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : 1,
            })}
            className="flex-1 pb-8"
          >
            <View
              className={`p-5 rounded-[30px] border-2 ${
                step.isActive
                  ? "bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-50"
                  : "bg-white border-slate-100"
              }`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text
                  className={`text-sm font-black tracking-tight ${
                    step.isActive ? "text-indigo-900" : "text-slate-700"
                  }`}
                >
                  {step.title}
                </Text>
                <View className="flex-row items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                  <Clock size={12} color="#94a3b8" />
                  <Text className="text-[10px] font-bold text-slate-500">
                    {step.time}
                  </Text>
                </View>
              </View>
              <Text
                className={`text-xs leading-5 ${
                  step.isActive ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {step.description}
              </Text>
            </View>
          </Pressable>
        </View>
      ))}
    </View>
  );
};
