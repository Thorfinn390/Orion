import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
    Bell,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Circle,
    Clock,
    Coffee,
    Download,
    Info,
    Map as MapIcon,
    MapPin,
    MessageSquare,
    Plane,
    QrCode,
    RefreshCw,
    Search,
    ShoppingBag,
    Sparkles
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Assuming you have these stores and components at these paths
import { useAuthStore } from "@/stores/useAuthStore";
import { TicketCard } from "../../components/TicketCard";

// --- Static Mock Data based on your Prisma Schema ---
const MOCK_CHECKLIST =[
  { id: "1", taskName: "Check-in online", due_time: "24h before", is_completed: true, is_mandatory: true },
  { id: "2", taskName: "Pack carry-on essentials", due_time: "12h before", is_completed: false, is_mandatory: true },
  { id: "3", taskName: "Charge all devices", due_time: "4h before", is_completed: false, is_mandatory: false },
  { id: "4", taskName: "Book airport transfer", due_time: "3h before", is_completed: false, is_mandatory: false },
];

const MOCK_POIS =[
  { id: "1", name: "Starbucks Drive-Thru", type: "Coffee", distance: "15 mins away" },
  { id: "2", name: "Duty Free Express", type: "Shopping", distance: "At Terminal 3" },
];

export default function JourneyControlCenter() {
  const fullName = useAuthStore((state) => state.fullName) || "Alex";
  
  const[loading, setLoading] = useState(true);
  
  // App States: 'SEARCH' -> 'GENERATE' -> 'ACTIVE'
  const[appState, setAppState] = useState<'SEARCH' | 'GENERATE' | 'ACTIVE'>('SEARCH');
  
  // Generation configuration
  const [flightNumber, setFlightNumber] = useState("");
  const[packingTime, setPackingTime] = useState("60"); // minutes
  const [bufferTime, setBufferTime] = useState("30"); // minutes
  
  // Active Guide State
  const [checklist, setChecklist] = useState(MOCK_CHECKLIST);
  const[showAirportGuide, setShowAirportGuide] = useState(false);
  const[calculatedLeaveTime, setCalculatedLeaveTime] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => { setLoading(false); }, 1500);
    return () => clearTimeout(timer);
  },[]);

  const handleScanQR = () => {
    Alert.alert("QR Scanner", "Opening camera to scan boarding pass...",[
      { text: "Simulate Scan", onPress: () => {
          setFlightNumber("EK 202");
          setAppState('GENERATE');
      }}
    ]);
  };

  const calculateDepartureTime = () => {
    setCalculatedLeaveTime("04:30 AM");
    Alert.alert(
      "Notifications Scheduled", 
      "Nova has scheduled alerts for your departure and checklist items!"
    );
    setAppState('ACTIVE');
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, is_completed: !item.is_completed } : item
    ));
  };

  const exportGuideToPDF = async () => {
    try {
      const html = `<h1>Flight Guide for ${fullName}</h1><p>Flight: EK 202</p><p>Leave Home At: ${calculatedLeaveTime}</p>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Export Error", "Could not generate PDF.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-slate-50 z-10">
        <View>
          <Text className="text-[10px] font-black text-indigo-600 tracking-widest uppercase mb-1">
            Voyager Control
          </Text>
          <Text className="text-2xl font-black text-slate-900">
            Welcome, {fullName.split(' ')[0]}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={() => setAppState('SEARCH')} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 items-center justify-center">
            <Search size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 items-center justify-center relative">
            <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full z-10 border border-white" />
            <Bell size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* ================= STEP 1: SEARCH ================= */}
        {appState === 'SEARCH' && (
          <View className="flex-1 justify-center mt-10">
            <View className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
              <Text className="text-xl font-black text-slate-800 mb-2">Find Your Flight</Text>
              <Text className="text-sm text-slate-500 mb-6 leading-5">
                Scan your boarding pass or enter your flight number to generate a customized door-to-gate journey guide.
              </Text>
              
              <View className="flex-row gap-3 mb-6">
                <View className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 flex-row items-center px-4 h-14">
                  <Plane size={20} color="#94a3b8" />
                  <TextInput 
                    placeholder="e.g., EK 202"
                    value={flightNumber}
                    onChangeText={setFlightNumber}
                    className="flex-1 ml-3 font-bold text-slate-800"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <TouchableOpacity 
                  onPress={() => flightNumber ? setAppState('GENERATE') : Alert.alert("Error", "Enter a flight number")}
                  className="bg-indigo-600 px-6 rounded-2xl justify-center items-center h-14 shadow-md shadow-indigo-200"
                >
                  <Text className="text-white font-black">Go</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-slate-100" />
                <Text className="mx-4 text-xs font-bold text-slate-400 uppercase tracking-wider">OR</Text>
                <View className="flex-1 h-[1px] bg-slate-100" />
              </View>

              <TouchableOpacity onPress={handleScanQR} className="bg-slate-900 flex-row justify-center items-center py-4 rounded-2xl shadow-lg shadow-slate-200">
                <QrCode size={20} color="white" />
                <Text className="text-white font-black ml-2">Scan QR Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= STEP 2: GENERATE ================= */}
        {appState === 'GENERATE' && (
          <View className="mt-4">
            <TicketCard />
            
            <View className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mt-6">
              <Text className="text-xl font-black text-slate-800 mb-2">Customize Your Guide</Text>
              <Text className="text-sm text-slate-500 mb-6">Let's calculate your optimal departure time. How much time do you need?</Text>
              
              <View className="mb-5">
                <Text className="text-xs font-extrabold text-slate-400 tracking-widest uppercase mb-3">Packing Time (Mins)</Text>
                <TextInput 
                  keyboardType="numeric"
                  value={packingTime}
                  onChangeText={setPackingTime}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-slate-800"
                />
              </View>

              <View className="mb-8">
                <Text className="text-xs font-extrabold text-slate-400 tracking-widest uppercase mb-3">Buffer / Extra Time (Mins)</Text>
                <TextInput 
                  keyboardType="numeric"
                  value={bufferTime}
                  onChangeText={setBufferTime}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-slate-800"
                />
              </View>

              <TouchableOpacity onPress={calculateDepartureTime} className="bg-indigo-600 py-4 rounded-2xl shadow-lg shadow-indigo-200 items-center">
                <Text className="text-white font-black text-lg">Generate & Finish Guide</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= STEP 3: ACTIVE ================= */}
        {appState === 'ACTIVE' && (
          <View>
            <TouchableOpacity onPress={() => Alert.alert("SkyGuide AI", "Terminal 3 is busy.")} className="bg-white border border-indigo-50 p-4 rounded-[30px] shadow-sm flex-row items-start gap-4 mb-6">
              <View className="bg-indigo-50 p-2 rounded-xl">
                <Sparkles size={18} color="#4f46e5" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">SkyGuide AI</Text>
                <Text className="text-sm text-slate-700 italic leading-5">
                  "Your flight EK 202 is on time. Terminal 3 is currently busy, we recommend heading to the gate 45 mins early."
                </Text>
              </View>
            </TouchableOpacity>

            <TicketCard />

            <View className="flex-row justify-between mt-6 mb-6 gap-3">
              <TouchableOpacity onPress={exportGuideToPDF} className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 items-center shadow-sm flex-row justify-center gap-2">
                <Download size={16} color="#4f46e5" />
                <Text className="text-xs font-bold text-slate-700">Export PDF</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => Alert.alert("Flight Chat", "Joining anonymous passenger chat...")} className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 items-center shadow-sm flex-row justify-center gap-2">
                <MessageSquare size={16} color="#4f46e5" />
                <Text className="text-xs font-bold text-slate-700">Group Chat</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-slate-900 rounded-[32px] p-6 mb-6 shadow-xl shadow-slate-300">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white/60 font-bold text-xs tracking-widest uppercase">Optimal Leave Time</Text>
                <Clock size={16} color="#a5b4fc" />
              </View>
              <Text className="text-4xl font-black text-white mb-2">{calculatedLeaveTime}</Text>
              <Text className="text-indigo-200 text-sm mb-6">Includes {packingTime}m packing & {bufferTime}m buffer.</Text>
              
              {/* STATIC MAP PLACEHOLDER */}
              <View className="h-40 rounded-2xl bg-slate-800 border border-slate-700 mb-4 items-center justify-center relative overflow-hidden">
                <View className="absolute inset-0 opacity-10 bg-indigo-500" style={{ 
                  backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', 
                  backgroundSize: '10px 10px' 
                }} />
                
                <MapIcon size={32} color="#6366f1" opacity={0.5} />
                <Text className="text-indigo-300/50 text-[10px] font-bold mt-2 uppercase tracking-widest">Map View Area</Text>
                
                <View className="absolute bottom-3 left-3 bg-white/95 px-3 py-1.5 rounded-full flex-row items-center shadow-lg">
                  <MapPin size={12} color="#4f46e5" />
                  <Text className="text-[10px] font-black text-slate-800 ml-1.5">Home to DXB Airport</Text>
                </View>
              </View>
              
              <TouchableOpacity onPress={() => setAppState('GENERATE')} className="flex-row items-center justify-center gap-2 mt-2">
                <RefreshCw size={12} color="#a5b4fc" />
                <Text className="text-indigo-200 text-xs font-bold">Regenerate Route</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-black text-slate-800">Pre-Flight Checklist</Text>
                <View className="bg-indigo-50 px-2 py-1 rounded-md">
                  <Text className="text-[10px] font-bold text-indigo-600">
                    {checklist.filter(i => i.is_completed).length}/{checklist.length} Done
                  </Text>
                </View>
              </View>
              
              {checklist.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => toggleChecklistItem(item.id)}
                  className="flex-row items-center py-3 border-b border-slate-50 last:border-0"
                >
                  {item.is_completed ? (
                    <CheckCircle2 size={24} color="#10b981" />
                  ) : (
                    <Circle size={24} color="#cbd5e1" />
                  )}
                  <View className="ml-3 flex-1">
                    <Text className={`text-sm font-bold ${item.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {item.taskName} {item.is_mandatory && <Text className="text-red-400">*</Text>}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">Due: {item.due_time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mb-6">
              <Text className="text-sm font-black text-slate-800 mb-3 px-2">Along Your Route</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                {MOCK_POIS.map((poi) => (
                  <View key={poi.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mr-3 w-40">
                    <View className="w-8 h-8 bg-indigo-50 rounded-full items-center justify-center mb-2">
                      {poi.type === "Coffee" ? <Coffee size={14} color="#4f46e5"/> : <ShoppingBag size={14} color="#4f46e5"/>}
                    </View>
                    <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>{poi.name}</Text>
                    <Text className="text-[10px] text-slate-400 font-semibold mt-1">{poi.distance}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-10">
              <TouchableOpacity 
                onPress={() => setShowAirportGuide(!showAirportGuide)}
                className="p-6 flex-row justify-between items-center"
              >
                <View className="flex-row items-center gap-3">
                  <View className="bg-indigo-50 p-2 rounded-xl">
                    <Info size={20} color="#4f46e5" />
                  </View>
                  <View>
                    <Text className="text-lg font-black text-slate-800">Airport Guide</Text>
                    <Text className="text-xs text-slate-400 font-medium">Terminal 3 • Gate B12</Text>
                  </View>
                </View>
                {showAirportGuide ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
              </TouchableOpacity>
              
              {showAirportGuide && (
                <View className="px-6 pb-6 pt-2 bg-slate-50 border-t border-slate-100">
                  <Text className="text-sm text-slate-600 leading-5 mb-4">
                    Upon arrival at Terminal 3, head directly to Zone 2 for bag drop. 
                    Security clearance is estimated at 15 minutes. 
                    Gate B12 is a 10-minute walk from security.
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    <View className="bg-white px-3 py-2 rounded-lg border border-slate-200">
                      <Text className="text-xs font-bold text-slate-700">Lounge Access: Yes</Text>
                    </View>
                    <View className="bg-white px-3 py-2 rounded-lg border border-slate-200">
                      <Text className="text-xs font-bold text-slate-700">Fast Track: Available</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}