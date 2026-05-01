import { Plane, QrCode } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

export type HomeTicketFlight = {
  userFlightId: string;
  id?: string;
  flight_number: string;
  scheduled_departure_time?: string;
  expected_departure_time?: string | null;
  gate?: string | null;
  terminal?: string | null;
  status?: string;
  departureAirport: {
    iata_code: string;
    city: string;
    name?: string;
  };
  arrivalAirport: {
    iata_code: string;
    city: string;
    name?: string;
  };
};

type TicketCardProps = {
  flight: HomeTicketFlight;
  passengerName: string;
};

const formatFlightTime = (value?: string | null) => {
  if (!value) {
    return "TBA";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "TBA";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getAirlineCode = (flightNumber: string) => {
  const code = flightNumber.match(/[A-Z]+/i)?.[0]?.slice(0, 2).toUpperCase();
  return code || "OR";
};

const normalizeStatus = (status?: string) =>
  status ? status.replace(/_/g, " ") : "Registered";

export const TicketCard = ({ flight, passengerName }: TicketCardProps) => {
  const airlineCode = getAirlineCode(flight.flight_number);
  const departureTime = formatFlightTime(
    flight.expected_departure_time ?? flight.scheduled_departure_time,
  );
  const barcode = `${flight.flight_number}-${flight.userFlightId.slice(0, 8)}`;

  return (
    <View className="bg-white rounded-[32px] w-full shadow-xl overflow-hidden my-3 border border-slate-100">
      {/* Top Part */}
      <View className="p-6 bg-slate-50/50 relative">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center space-x-3">
            <View className="w-10 h-10 bg-indigo-600 rounded-xl justify-center items-center shadow-lg shadow-indigo-200">
              <Text className="text-white font-black text-sm">
                {airlineCode}
              </Text>
            </View>
            <View className="ml-3">
              <Text className="text-sm font-bold text-slate-800">
                ORION Boarding
              </Text>
              <Text className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">
                {flight.flight_number}
              </Text>
            </View>
          </View>
          <View className="bg-indigo-50 px-3 py-1 rounded-full">
            <Text className="text-[9px] font-black text-indigo-600 uppercase">
              {normalizeStatus(flight.status)}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-4xl font-black text-slate-800 tracking-tighter">
              {flight.departureAirport.iata_code}
            </Text>
            <Text className="text-xs text-slate-400 font-semibold">
              {flight.departureAirport.city}
            </Text>
            <Text className="text-[11px] font-bold text-slate-600 mt-2">
              {departureTime}
            </Text>
          </View>

          <View className="items-center px-4">
            <View className="bg-indigo-50 px-2 py-0.5 rounded-full mb-2">
              <Text className="text-[9px] font-black text-indigo-600">
                Terminal {flight.terminal || "TBA"}
              </Text>
            </View>
            <View className="w-16 h-[1px] bg-slate-200 flex-row justify-center items-center">
              <View className="bg-white p-1 rounded-full border border-slate-100">
                <Plane
                  size={12}
                  color="#4f46e5"
                  style={{ transform: [{ rotate: "90deg" }] }}
                />
              </View>
            </View>
          </View>

          <View className="flex-1 items-end">
            <Text className="text-4xl font-black text-slate-800 tracking-tighter">
              {flight.arrivalAirport.iata_code}
            </Text>
            <Text className="text-xs text-slate-400 font-semibold">
              {flight.arrivalAirport.city}
            </Text>
            <Text className="text-[11px] font-bold text-slate-600 mt-2">
              {normalizeStatus(flight.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Dashed Separator */}
      <View className="h-[1px] w-full border-t border-dashed border-slate-200" />

      {/* Bottom Part */}
      <View className="p-6 bg-white">
        <View className="flex-row flex-wrap mb-6">
          <View className="w-1/2 mb-4">
            <Text className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">
              Passenger
            </Text>
            <Text className="text-sm font-bold text-slate-800">
              {passengerName}
            </Text>
          </View>
          <View className="w-1/4 mb-4">
            <Text className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">
              Gate
            </Text>
            <Text className="text-sm font-bold text-slate-800">
              {flight.gate || "--"}
            </Text>
          </View>
          <View className="w-1/4 mb-4">
            <Text className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">
              Terminal
            </Text>
            <Text className="text-sm font-bold text-slate-800">
              {flight.terminal || "TBA"}
            </Text>
          </View>
          <View className="w-1/2">
            <Text className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">
              Ticket
            </Text>
            <Text className="text-sm font-bold text-slate-800">
              Registered
            </Text>
          </View>
          <View className="w-1/2">
            <Text className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">
              Journey
            </Text>
            <Text className="text-sm font-bold text-slate-800">
              Ready
            </Text>
          </View>
        </View>

        <View className="items-center">
          <View className="p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
            <QrCode size={100} color="#1e293b" />
          </View>
          <Text className="text-[10px] font-black text-slate-300 tracking-[6px] mt-6 uppercase">
            {barcode}
          </Text>
        </View>
      </View>
    </View>
  );
};
