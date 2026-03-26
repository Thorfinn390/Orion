// import { Car, ShoppingBag, Sofa, Utensils } from "lucide-react-native";
import { Flight, SuggestedService, TimelineStep } from "./types";
export const MOCK_FLIGHTS: Flight[] = [
  {
    id: "1",
    airline: "British Airways",
    airlineCode: "BA",
    flightNumber: "BA2024",
    status: "On Time",
    from: "JFK",
    fromCity: "New York",
    to: "LHR",
    toCity: "London",
    departureTime: "10:45 PM, Oct 24",
    arrivalTime: "09:55 AM, Oct 25",
    duration: "6h 45m",
    gate: "B12",
    terminal: "4",
    seat: "14K",
    zone: "1",
    passenger: "A. Smith",
    class: "BUSINESS",
    barcode: "2024 8839 1102",
  },
  {
    id: "2",
    airline: "American Airlines",
    airlineCode: "AA",
    flightNumber: "AA120",
    status: "Delayed",
    from: "SFO",
    fromCity: "San Francisco",
    to: "LHR",
    toCity: "London",
    departureTime: "02:35 PM, Oct 26",
    arrivalTime: "09:55 AM, Oct 27",
    duration: "11h 20m",
    gate: "A08",
    terminal: "International",
    seat: "22A",
    zone: "3",
    passenger: "A. Smith",
    class: "ECONOMY",
    barcode: "6789 2341 0098",
  },
];

export const MOCK_FLIGHT = MOCK_FLIGHTS[0];

export const MOCK_TRIP_TIMELINE: TimelineStep[] = [
  {
    id: "1",
    title: "Security Check",
    time: "08:15 PM",
    description: "Successfully cleared security at Terminal 4 West.",
    isCompleted: true,
    isActive: false,
  },
  {
    id: "2",
    title: "Lounge Access",
    time: "08:30 PM",
    description: "Relaxing at the Premium Sapphire Lounge.",
    isCompleted: true,
    isActive: false,
  },
  {
    id: "3",
    title: "Gate Open",
    time: "09:45 PM",
    description: "Proceed to Gate B12. Boarding starts shortly.",
    isCompleted: false,
    isActive: true,
  },
  {
    id: "4",
    title: "In Flight",
    time: "10:45 PM",
    description: "Estimated flying time: 6 hours 45 minutes.",
    isCompleted: false,
    isActive: false,
  },
];

export const SUGGESTED_SERVICES: SuggestedService[] = [
  {
    id: "1",
    title: "Find Shops",
    icon: ShoppingBag,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "2",
    title: "Food Options",
    icon: Utensils,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "3",
    title: "Lounge Access",
    icon: Sofa,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: "4",
    title: "Airport Parking",
    icon: Car,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

// export const SYSTEM_INSTRUCTION = `
// You are SkyPass Assistant, a travel expert. Help users with their flight details, airport information, and destination tips.
// Be professional, concise, and friendly.
// When analyzing tickets, accurately extract airline, flight number, IATA codes, gate, and seat info.
// Current Context: The user is navigating the SkyPass Pro mobile app.
// `;
