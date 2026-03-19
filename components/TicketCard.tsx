import { Plane, QrCode } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

export const TicketCard = () => {
  const flight = {
    airline: "Emirates",
    airlineCode: "EK",
    flightNumber: "EK 202",
    from: "DXB",
    fromCity: "Dubai",
    to: "LHR",
    toCity: "London",
    departureTime: "08:30 AM",
    arrivalTime: "12:15 PM",
    duration: "7h 45m",
    passenger: "Alex Thompson",
    gate: "B12",
    seat: "14A",
    class: "Business",
    zone: "2",
    barcode: "EK202-LHR-2024",
  };

  return (
    <View className="bg-white rounded-[32px] w-full shadow-xl overflow-hidden my-3 border border-slate-100">
      {/* Top Part */}
      <View className="p-6 bg-slate-50/50 relative">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center space-x-3">
            <View className="w-10 h-10 bg-indigo-600 rounded-xl justify-center items-center shadow-lg shadow-indigo-200">
              <Text className="text-white font-black text-sm">
                {flight.airlineCode}
              </Text>
            </View>
            <View className="ml-3">
              <Text className="text-sm font-bold text-slate-800">
                {flight.airline}
              </Text>
              <Text className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">
                {flight.flightNumber}
              </Text>
            </View>
          </View>
          <View className="bg-indigo-50 px-3 py-1 rounded-full">
            <Text className="text-[9px] font-black text-indigo-600 uppercase">
              {flight.class}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-4xl font-black text-slate-800 tracking-tighter">
              {flight.from}
            </Text>
            <Text className="text-xs text-slate-400 font-semibold">
              {flight.fromCity}
            </Text>
            <Text className="text-[11px] font-bold text-slate-600 mt-2">
              {flight.departureTime}
            </Text>
          </View>

          <View className="items-center px-4">
            <View className="bg-indigo-50 px-2 py-0.5 rounded-full mb-2">
              <Text className="text-[9px] font-black text-indigo-600">
                {flight.duration}
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
              {flight.to}
            </Text>
            <Text className="text-xs text-slate-400 font-semibold">
              {flight.toCity}
            </Text>
            <Text className="text-[11px] font-bold text-slate-600 mt-2">
              {flight.arrivalTime}
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
              {flight.passenger}
            </Text>
          </View>
          <View className="w-1/4 mb-4">
            <Text className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">
              Gate
            </Text>
            <Text className="text-sm font-bold text-slate-800">
              {flight.gate}
            </Text>
          </View>
          <View className="w-1/4 mb-4">
            <Text className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">
              Seat
            </Text>
            <Text className="text-sm font-bold text-slate-800">
              {flight.seat}
            </Text>
          </View>
          <View className="w-1/2">
            <Text className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">
              Flight Class
            </Text>
            <Text className="text-sm font-bold text-slate-800">
              {flight.class}
            </Text>
          </View>
          <View className="w-1/2">
            <Text className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">
              Zone
            </Text>
            <Text className="text-sm font-bold text-slate-800">
              {flight.zone}
            </Text>
          </View>
        </View>

        <View className="items-center">
          <View className="p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
            <QrCode size={100} color="#1e293b" />
          </View>
          <Text className="text-[10px] font-black text-slate-300 tracking-[6px] mt-6 uppercase">
            {flight.barcode}
          </Text>
        </View>
      </View>
    </View>
  );
};
