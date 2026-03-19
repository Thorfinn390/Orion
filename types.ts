import "react-native";

export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  status: "On Time" | "Delayed" | "Boarding" | "Departed";
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  gate: string;
  terminal?: string;
  seat: string;
  zone: string;
  passenger: string;
  class: "ECONOMY" | "BUSINESS" | "FIRST";
  barcode: string;
}

export interface TimelineStep {
  id: string;
  title: string;
  time: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface SuggestedService {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}
