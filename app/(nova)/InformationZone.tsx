import { Ionicons } from "@expo/vector-icons";
import { AnimatePresence, MotiView } from "moti";
import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface FAQItem {
  id: string;
  category: string;
  question_text: string;
  answer_text: string;
}

const DATA: FAQItem[] = [
  {
    id: "31227f71-616c-4876-8041-3b7e753443a5",
    category: "Airline Travel & Policies",
    question_text:
      "What is the standard check-in time for international flights?",
    answer_text:
      "For most international flights, it is recommended to arrive at the airport at least 3 hours before departure. Online check-in usually opens 24 to 48 hours before the flight.",
  },
  {
    id: "e9c1d044-8d96-4a55-873b-17983652611a",
    category: "Airline Travel & Policies",
    question_text: "What are the common restrictions for carry-on liquids?",
    answer_text:
      "Liquids, gels, and aerosols must be in containers of 100ml (3.4 oz) or less. All containers must fit into a single, transparent, resealable plastic bag.",
  },
  {
    id: "7f8b9e12-c204-4d83-965a-0d1726a2c3b8",
    category: "Airline Travel & Policies",
    question_text: "Can I change my flight after booking?",
    answer_text:
      "Yes, but fees depend on your ticket type. 'Flexible' or 'Business' fares often allow free changes, while 'Basic Economy' may be non-changeable or require a significant fee plus the fare difference.",
  },
  {
    id: "14d7a315-9c88-4e92-bc22-38d569103f67",
    category: "Airline Travel & Policies",
    question_text: "What happens if my flight is delayed or canceled?",
    answer_text:
      "Airlines are generally required to rebook you on the next available flight. Depending on the jurisdiction (like EU261 regulations) and the cause of delay, you may be entitled to food vouchers, hotel stays, or monetary compensation.",
  },
  {
    id: "52b66718-f682-4a11-bc9d-8d5421945a2e",
    category: "Airline Travel & Policies",
    question_text: "Are there weight limits for checked baggage?",
    answer_text:
      "Standard weight limits are typically 23kg (50lbs) for Economy and 32kg (70lbs) for Business/First Class. Exceeding these limits usually results in overweight baggage fees.",
  },
  {
    id: "9a93c834-2e3d-4c33-8a0a-04b78c9d2f44",
    category: "Airline Travel & Policies",
    question_text: "Can I travel with a pet?",
    answer_text:
      "Most airlines allow small pets in the cabin for a fee, provided they are in an approved carrier. Larger animals must travel in the cargo hold. Policy varies strictly by airline and destination.",
  },
  {
    id: "bd50283c-1345-4e78-8381-0a6e812d1b11",
    category: "Airline Travel & Policies",
    question_text: "What is a 'no-show' policy?",
    answer_text:
      "If you miss the first leg of a round-trip journey without notifying the airline, the 'no-show' policy typically results in the automatic cancellation of all remaining flights on that itinerary with no refund.",
  },
  {
    id: "a1b2c3d4-e5f6-4g7h-8i9j-k0l1m2n3o4p5",
    category: "Documentation & Visas",
    question_text: "How much validity do I need on my passport?",
    answer_text:
      "Most countries require your passport to be valid for at least 6 months beyond your date of entry. Some airlines may deny boarding if you do not meet this requirement.",
  },
  {
    id: "b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7",
    category: "Safety & Health",
    question_text: "Do I need travel insurance?",
    answer_text:
      "While not always mandatory, it is highly recommended. It covers unexpected costs like medical emergencies, trip cancellations, or lost luggage.",
  },
  {
    id: "c3d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8",
    category: "Loyalty Programs",
    question_text: "How do I claim missing frequent flyer miles?",
    answer_text:
      "You can usually claim missing miles via the airline's website by providing your ticket number and flight details. This must typically be done within 6 months of the flight.",
  },
  {
    id: "d4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9",
    category: "In-Flight Services",
    question_text: "How can I request a special meal?",
    answer_text:
      "Special meals must be requested at least 24 to 48 hours before departure through the 'Manage Booking' section of the airline's website.",
  },
];

function FAQCard({ item }: { item: FAQItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="bg-white border-b border-black/5 overflow-hidden">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
        className="p-8"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-nova mr-2" />
              <Text className="text-textMuted text-[10px] font-black tracking-widest uppercase">
                {item.category}
              </Text>
            </View>
            <Text className="text-textPrimary text-xl font-bold tracking-tight">
              {item.question_text}
            </Text>
          </View>

          <MotiView
            animate={{
              rotate: expanded ? "45deg" : "0deg",
              scale: expanded ? [1, 1.2, 1] : 1,
              backgroundColor: expanded ? "#F0F4FF" : "#FFFFFF",
            }}
            transition={{ type: "timing", duration: 200 }}
            className="w-11 h-11 rounded-2xl items-center justify-center border border-borderDefault"
          >
            <Ionicons
              name="add"
              size={24}
              color={expanded ? "#7B5FE8" : "#0D1A3A"}
            />
          </MotiView>
        </View>

        <AnimatePresence>
          {expanded && (
            <MotiView
              from={{ opacity: 0, scale: 0.9, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: "auto" }}
              exit={{ opacity: 0, scale: 0.9, height: 0 }}
              transition={{ type: "timing", duration: 200 }}
            >
              <View className="mt-6 pt-6 border-t border-black/5">
                <Text className="text-textSecondary text-base leading-7 font-medium">
                  {item.answer_text}
                </Text>
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </TouchableOpacity>
    </View>
  );
}

export default function InformationZone() {
  return (
    <View className="flex-1 bg-surface">
      <View className="px-8 pt-24 pb-12">
        <Text className="text-nova text-xs font-black tracking-[4px] uppercase mb-1 opacity-60">
          Vault
        </Text>
        <Text className="text-textPrimary text-5xl font-black tracking-tighter">
          Knowledge
        </Text>
      </View>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FAQCard item={item} />}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
