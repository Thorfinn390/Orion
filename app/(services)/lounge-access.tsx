import { TerminalServiceScreen } from "@/components/TerminalServiceScreen";
import { getTerminalService } from "@/utils/journeySimulation";
import { Coffee } from "lucide-react-native";
import React from "react";

export default function LoungeAccessScreen() {
  const service = getTerminalService("lounge-access");

  if (!service) {
    return null;
  }

  return <TerminalServiceScreen service={service} Icon={Coffee} />;
}
