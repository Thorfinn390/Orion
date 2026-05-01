import { TerminalServiceScreen } from "@/components/TerminalServiceScreen";
import { getTerminalService } from "@/utils/journeySimulation";
import { Car } from "lucide-react-native";
import React from "react";

export default function TransportScreen() {
  const service = getTerminalService("transport");

  if (!service) {
    return null;
  }

  return <TerminalServiceScreen service={service} Icon={Car} />;
}
