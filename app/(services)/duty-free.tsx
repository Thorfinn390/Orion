import { TerminalServiceScreen } from "@/components/TerminalServiceScreen";
import { getTerminalService } from "@/utils/journeySimulation";
import { ShoppingBag } from "lucide-react-native";
import React from "react";

export default function DutyFreeScreen() {
  const service = getTerminalService("duty-free");

  if (!service) {
    return null;
  }

  return <TerminalServiceScreen service={service} Icon={ShoppingBag} />;
}
