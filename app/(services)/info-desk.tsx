import { TerminalServiceScreen } from "@/components/TerminalServiceScreen";
import { getTerminalService } from "@/utils/journeySimulation";
import { Info } from "lucide-react-native";
import React from "react";

export default function InfoDeskScreen() {
  const service = getTerminalService("info-desk");

  if (!service) {
    return null;
  }

  return <TerminalServiceScreen service={service} Icon={Info} />;
}
