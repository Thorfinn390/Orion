import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Download,
  Info,
  Map as MapIcon,
  MapPin,
  Settings
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

import { useAuthStore } from "@/stores/useAuthStore";
import FlightCard from "../../components/FlightCard";

// Mock templates (Offsets in hours before flight)
const CHECKLIST_TEMPLATES =[
  { id: "1", taskName: "Check-in online", hoursBefore: 24, is_mandatory: true },
  { id: "2", taskName: "Pack carry-on essentials", hoursBefore: 12, is_mandatory: true },
  { id: "3", taskName: "Charge all devices", hoursBefore: 4, is_mandatory: false },
  { id: "4", taskName: "Book airport transfer", hoursBefore: 3, is_mandatory: false },
];

export default function JourneyControlCenter() {
  const fullName = useAuthStore((state) => state.fullName) || "Alex";
  
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState<'GENERATE' | 'ACTIVE'>('GENERATE');
  
  const [packingTime, setPackingTime] = useState("60"); 
  const [bufferTime, setBufferTime] = useState("30"); 
  
  const[checklist, setChecklist] = useState<any[]>([]);
  const [showAirportGuide, setShowAirportGuide] = useState(false);
  const [calculatedLeaveTime, setCalculatedLeaveTime] = useState("");

  // Live Timer for Overdue Calculations
  const [now, setNow] = useState(Date.now());

  // Dynamic Flight State
  const [flightBaseData, setFlightBaseData] = useState({
    flightNumber: "EK 202",
    from: "DXB",
    fromCity: "Dubai",
    to: "LHR",
    toCity: "London",
    gate: "B12",
    terminal: "Terminal 3",
    // Mocking departure 18 hours from current time so we can see overdue vs future tasks
    departureDate: new Date(Date.now() + 18 * 60 * 60 * 1000) 
  });

  // Keep 'now' updated every 60 seconds for live overdue evaluation
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  },[]);

  // Initialize Dates and AsyncStorage
  useEffect(() => {
    // 1. Generate dynamic exact times from the templates based on Departure Time
    const initialChecklist = CHECKLIST_TEMPLATES.map(t => {
      const dueObj = new Date(flightBaseData.departureDate.getTime() - t.hoursBefore * 3600 * 1000);
      const timeStr = dueObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = dueObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      return {
        id: t.id,
        taskName: t.taskName,
        is_mandatory: t.is_mandatory,
        dueTimestamp: dueObj.getTime(),
        due_time: `Due at ${timeStr}, ${dateStr}`,
        is_completed: false
      };
    });

    setChecklist(initialChecklist);
    loadExistingGuide(initialChecklist);
  },[flightBaseData.departureDate]);

  const loadExistingGuide = async (baseChecklist: any[]) => {
    try {
      const storedGuide = await AsyncStorage.getItem(`guide_${flightBaseData.flightNumber}`);
      if (storedGuide) {
        const parsedGuide = JSON.parse(storedGuide);
        setCalculatedLeaveTime(parsedGuide.leaveTime);
        setPackingTime(parsedGuide.packingTime);
        setBufferTime(parsedGuide.bufferTime);
        
        // Merge completed statuses from storage with our newly calculated dynamic dates
        const mergedChecklist = baseChecklist.map(item => {
          const savedItem = parsedGuide.checklist.find((i: any) => i.id === item.id);
          return { ...item, is_completed: savedItem ? savedItem.is_completed : false };
        });
        
        setChecklist(mergedChecklist);
        setAppState('ACTIVE');
      } else {
        setAppState('GENERATE');
      }
    } catch (error) {
      console.error("Failed to load guide from storage", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAndSaveGuide = async () => {
    const leaveTime = "04:30 AM"; // Standard mocked offset math
    setCalculatedLeaveTime(leaveTime);
    
    const newGuideData = {
      leaveTime,
      packingTime,
      bufferTime,
      checklist: checklist.map(c => ({ id: c.id, is_completed: c.is_completed }))
    };

    try {
      await AsyncStorage.setItem(`guide_${flightBaseData.flightNumber}`, JSON.stringify(newGuideData));
      Alert.alert(
        "Guide Generated", 
        "Nova has scheduled alerts for your departure and checklist items!"
      );
      setAppState('ACTIVE');
    } catch (error) {
      Alert.alert("Error", "Could not save flight guide.");
    }
  };

  const regenerateGuide = async () => {
    Alert.alert("Regenerate Guide?", "This will reset your checklist and recalculate your timeline.",[
      { text: "Cancel", style: "cancel" },
      { 
        text: "Regenerate", 
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem(`guide_${flightBaseData.flightNumber}`);
          // Reset completion statuses
          setChecklist(checklist.map(c => ({ ...c, is_completed: false })));
          setAppState('GENERATE');
        }
      }
    ]);
  };

  const toggleChecklistItem = async (id: string) => {
    const updatedChecklist = checklist.map(item => 
      item.id === id ? { ...item, is_completed: !item.is_completed } : item
    );
    setChecklist(updatedChecklist);
    
    // Update simple completion status array in storage
    try {
      const currentGuideStr = await AsyncStorage.getItem(`guide_${flightBaseData.flightNumber}`);
      if (currentGuideStr) {
        const currentGuide = JSON.parse(currentGuideStr);
        currentGuide.checklist = updatedChecklist.map(c => ({ id: c.id, is_completed: c.is_completed }));
        await AsyncStorage.setItem(`guide_${flightBaseData.flightNumber}`, JSON.stringify(currentGuide));
      }
    } catch (error) {
      console.error("Failed to update checklist in storage");
    }
  };

  // const exportGuideToPDF = async () => {
  //   try {
  //     const checklistHtml = checklist.map(item => {
  //       const isOverdue = !item.is_completed && item.dueTimestamp < now;
  //       const color = item.is_completed ? '#10b981' : (isOverdue ? '#ef4444' : '#64748b');
  //       return `
  //       <li style="margin-bottom: 10px;">
  //         <span style="color: ${color}; font-size: 18px;">
  //           ${item.is_completed ? '☑' : '☐'}
  //         </span> 
  //         <strong>${item.taskName}</strong> 
  //         <span style="color: ${isOverdue ? '#ef4444' : '#94a3b8'}; font-size: 12px; margin-left: 10px;">
  //           (${item.due_time} ${isOverdue ? '— OVERDUE' : ''})
  //         </span>
  //       </li>`
  //     }).join('');

  //     const html = `
  //       <html>
  //         <head>
  //           <style>
  //             body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; background-color: #f8fafc; }
  //             .header { background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); color: white; padding: 40px; border-radius: 24px; text-align: center; }
  //             .header h1 { margin: 0; font-size: 24px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; }
  //             .flight-num { font-size: 64px; font-weight: 900; margin: 10px 0; }
  //             .section { background: white; padding: 30px; border-radius: 24px; margin-top: 30px; border: 1px solid #f1f5f9; }
  //             .section-title { font-size: 20px; font-weight: 900; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 20px;}
  //             .checklist { list-style: none; padding: 0; }
  //           </style>
  //         </head>
  //         <body>
  //           <div class="header">
  //             <h1>Official Voyager Guide</h1>
  //             <div class="flight-num">${flightBaseData.flightNumber}</div>
  //           </div>
  //           <div class="section">
  //             <h2 class="section-title">📋 Pre-Flight Checklist Status</h2>
  //             <ul class="checklist">
  //               ${checklistHtml}
  //             </ul>
  //           </div>
  //         </body>
  //       </html>
  //     `;
  //     const { uri } = await Print.printToFileAsync({ html });
  //     await Sharing.shareAsync(uri);
  //   } catch (error) {
  //     Alert.alert("Export Error", "Could not generate PDF.");
  //   }
  // };
  const exportGuideToPDF = async () => {
    try {
      // Generates detailed checklist items with dynamic "OVERDUE" status and colors
      const checklistHtml = checklist.map(item => {
        const isOverdue = !item.is_completed && item.dueTimestamp < now;
        const statusColor = item.is_completed ? '#10b981' : (isOverdue ? '#ef4444' : '#64748b');
        const icon = item.is_completed ? '☑' : '☐';

        return `
          <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
            <span style="color: ${statusColor}; font-size: 20px; margin-right: 12px; margin-top: -2px;">${icon}</span>
            <div>
              <strong style="font-size: 15px; color: ${item.is_completed ? '#9ca3af' : '#1e293b'}; text-decoration: ${item.is_completed ? 'line-through' : 'none'};">
                ${item.taskName} ${item.is_mandatory ? '<span style="color: #ef4444;">*</span>' : ''}
              </strong>
              <div style="font-size: 12px; margin-top: 4px; color: ${isOverdue ? '#ef4444' : '#94a3b8'}; font-weight: ${isOverdue ? 'bold' : 'normal'};">
                ${item.due_time} ${isOverdue ? ' &mdash; ACTION REQUIRED' : ''}
              </div>
            </div>
          </li>`;
      }).join('');

      // The main HTML document for the PDF
      const html = `
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; background-color: #f8fafc; }
              .header { background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); color: white; padding: 40px; border-radius: 24px; text-align: center; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.2); }
              .header h1 { margin: 0; font-size: 24px; opacity: 0.9; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; }
              .flight-num { font-size: 64px; font-weight: 900; margin: 10px 0; letter-spacing: -2px; }
              .route { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; font-size: 24px; font-weight: bold; }
              
              .section, .section2 { background: white; padding: 30px; border-radius: 24px; margin-top: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border: 1px solid #e2e8f0; }
              .section { margin-bottom : 340px;}
              
              .section-title { font-size: 20px; font-weight: 900; color: #0f172a; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; display: flex; align-items: center;}
              
              .timeline { position: relative; padding-left: 30px; border-left: 3px dashed #cbd5e1; margin-left: 20px; }
              .timeline-item { position: relative; margin-bottom: 30px; }
              .timeline-item::before { content: ''; position: absolute; left: -40px; top: 0; width: 16px; height: 16px; background: #4f46e5; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 0 2px #4f46e5; }
              .time { font-size: 18px; font-weight: 900; color: #4f46e5; margin-bottom: 5px; }
              .desc { color: #475569; font-size: 14px; line-height: 1.6; margin: 0; }
              
              .checklist { list-style: none; padding: 0; }
              .info-box { background: #eef2ff; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 0 8px 8px 0; margin-top: 20px; font-size: 14px; color: #374151; line-height: 1.6; }
              .step { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9; }
              .step:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
              .step strong { color: #312e81; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Official Voyager Guide for ${fullName}</h1>
              <div class="flight-num">${activeFlightProps.flightNumber}</div>
              <div class="route">
                <span>${activeFlightProps.from} (${activeFlightProps.fromCity})</span>
                <span>✈️</span>
                <span>${activeFlightProps.to} (${activeFlightProps.toCity})</span>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">⏱️ Master Timeline</h2>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="time">Right Now</div>
                  <p class="desc">Complete your pre-flight checklist. Your schedule allows for <strong>${packingTime} minutes</strong> of packing time.</p>
                </div>
                <div class="timeline-item">
                  <div class="time">${calculatedLeaveTime}</div>
                  <p class="desc"><strong>Depart for the Airport.</strong> This is your optimal leave time, which includes a safety buffer of <strong>${bufferTime} minutes</strong> for traffic or unexpected delays.</p>
                </div>
                <div class="timeline-item">
                  <div class="time">06:00 AM (Estimated Arrival)</div>
                  <p class="desc">Arrive at <strong>${activeFlightProps.terminal}</strong>. Proceed directly to the baggage drop zone related to your flight.</p>
                </div>
                <div class="timeline-item">
                  <div class="time">${activeFlightProps.departureTime}</div>
                  <p class="desc"><strong>Flight Departs</strong> from Gate ${activeFlightProps.gate}. Please be at the gate at least 30 minutes prior. Have a safe flight!</p>
                </div>
              </div>
            </div>

            <div class="section2">
              <h2 class="section-title">🗺️ Airport Navigation: ${activeFlightProps.terminal}</h2>
              <div class="step">
                <strong>Step 1: Bag Drop (Zone C)</strong><br/>
                <p class="desc">After entering the terminal, follow the overhead signs for "Emirates Check-in". Your dedicated area is Zone C. Standard wait times are currently 15 minutes.</p>
              </div>
              <div class="step">
                <strong>Step 2: Security & Immigration</strong><br/>
                <p class="desc">Once bags are checked, proceed to Level 2 for security screening. As a Business class passenger, you are eligible to use the "Fast Track" lane on the far left to expedite this process.</p>
              </div>
              <div class="step">
                <strong>Step 3: Path to Gate ${activeFlightProps.gate}</strong><br/>
                <p class="desc">After security, turn right and follow signs for "Concourse B Gates". It is approximately a 10-minute walk. Your gate is B12.</p>
              </div>
              <div class="info-box">
                💡 <strong>Nova AI Tip:</strong> The Emirates Business Lounge is located near Gate B16. You can relax there before boarding begins. We recommend heading to your gate 45 minutes before departure.
              </div>
            </div>
            
            <div class="section2">
              <h2 class="section-title">📋 Pre-Flight Checklist Status</h2>
              <ul class="checklist">
                ${checklistHtml}
              </ul>
            </div>

          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Export Error", "Could not generate PDF.");
    }
  };
  // --- DYNAMIC EVALUATION LOGIC ---
  // If ANY mandatory item is overdue and unchecked, Flight Status overrides to "ACTION REQUIRED"
  const hasMandatoryOverdue = checklist.some(c => !c.is_completed && c.is_mandatory && c.dueTimestamp < now);
  const dynamicStatus = hasMandatoryOverdue ? "ACTION REQUIRED" : "ON TIME";

  const activeFlightProps = {
    ...flightBaseData,
    status: dynamicStatus,
    departureTime: flightBaseData.departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
                   ", " + flightBaseData.departureDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-slate-50 z-10">
        <View>
          <Text className="text-[10px] font-black text-indigo-600 tracking-widest uppercase mb-1">
            Flight Control
          </Text>
          <Text className="text-2xl font-black text-slate-900">
            Welcome, {fullName.split(' ')[0]}
          </Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 items-center justify-center relative">
          {hasMandatoryOverdue && <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full z-10 border border-white" />}
          <Bell size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* FLIGHT CARD COMPONENT (Now receives dynamic Status & exact Date) */}
        <FlightCard flight={activeFlightProps} />

        {/* ================= STEP 1: GENERATE ================= */}
        {appState === 'GENERATE' && (
          <View className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mt-6">
            <Text className="text-xl font-black text-slate-800 mb-2">Create Flight Guide</Text>
            <Text className="text-sm text-slate-500 mb-6 leading-5">
              We'll calculate your exact door-to-gate timeline. Customize your preparation needs below.
            </Text>
            
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
              <Text className="text-xs font-extrabold text-slate-400 tracking-widest uppercase mb-3">Contingency Buffer (Mins)</Text>
              <TextInput 
                keyboardType="numeric"
                value={bufferTime}
                onChangeText={setBufferTime}
                className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-slate-800"
              />
            </View>

            <TouchableOpacity onPress={calculateAndSaveGuide} className="bg-indigo-600 py-4 rounded-2xl shadow-lg shadow-indigo-200 items-center">
              <Text className="text-white font-black text-lg">Generate Route Guide</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= STEP 2: ACTIVE ================= */}
        {appState === 'ACTIVE' && (
          <View className="mt-6">
            
            {/* Action Required AI Alert */}
            {hasMandatoryOverdue && (
               <View className="bg-red-50 border border-red-200 p-4 rounded-[30px] shadow-sm flex-row items-start gap-4 mb-6">
                 <View className="bg-red-100 p-2 rounded-xl">
                   <Bell size={18} color="#ef4444" />
                 </View>
                 <View className="flex-1">
                   <Text className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Nova Alert</Text>
                   <Text className="text-sm text-red-800 italic leading-5 font-medium">
                     You have mandatory checklist items that are currently overdue. Please complete them to ensure a smooth journey.
                   </Text>
                 </View>
               </View>
            )}

            <View className="flex-row justify-between mb-6 gap-3">
              <TouchableOpacity onPress={exportGuideToPDF} className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 items-center shadow-sm flex-row justify-center gap-2">
                <Download size={18} color="#4f46e5" />
                <Text className="text-sm font-bold text-slate-700">Export Detailed PDF</Text>
              </TouchableOpacity>
            </View>

            {/* Departure Calculation Card */}
            <View className="bg-slate-900 rounded-[32px] p-6 mb-6 shadow-xl shadow-slate-300">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white/60 font-bold text-xs tracking-widest uppercase">Calculated Departure</Text>
                <Clock size={16} color="#a5b4fc" />
              </View>
              <Text className="text-4xl font-black text-white mb-2">{calculatedLeaveTime}</Text>
              <Text className="text-indigo-200 text-sm mb-6 leading-5">
                Calculated using {packingTime}m for packing and {bufferTime}m traffic buffer.
              </Text>
              
              <View className="h-40 rounded-2xl bg-slate-800 border border-slate-700 mb-4 items-center justify-center relative overflow-hidden">
                <View className="absolute inset-0 opacity-10 bg-indigo-500" style={{ 
                  backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', 
                  backgroundSize: '10px 10px' 
                }} />
                <MapIcon size={32} color="#6366f1" opacity={0.5} />
                <Text className="text-indigo-300/50 text-[10px] font-bold mt-2 uppercase tracking-widest">Route Visual Map</Text>
                
                <View className="absolute bottom-3 left-3 bg-white/95 px-3 py-1.5 rounded-full flex-row items-center shadow-lg">
                  <MapPin size={12} color="#4f46e5" />
                  <Text className="text-[10px] font-black text-slate-800 ml-1.5">Home to {flightBaseData.from} Airport</Text>
                </View>
              </View>
              
              <TouchableOpacity onPress={regenerateGuide} className="flex-row items-center justify-center gap-2 mt-2 bg-slate-800 p-3 rounded-xl border border-slate-700">
                <Settings size={14} color="#a5b4fc" />
                <Text className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Configure Guide / Regenerate</Text>
              </TouchableOpacity>
            </View>

            {/* Pre-Flight Checklist */}
            <View className="mb-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-black text-slate-800">Mission Checklist</Text>
                <View className="bg-indigo-50 px-2 py-1 rounded-md">
                  <Text className="text-[10px] font-bold text-indigo-600">
                    {checklist.filter(i => i.is_completed).length}/{checklist.length} Done
                  </Text>
                </View>
              </View>
              
              {checklist.map((item) => {
                const isOverdue = !item.is_completed && item.dueTimestamp < now;
                
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    onPress={() => toggleChecklistItem(item.id)}
                    className="flex-row items-center py-4 border-b border-slate-50 last:border-0"
                  >
                    {item.is_completed ? (
                      <CheckCircle2 size={24} color="#10b981" />
                    ) : (
                      <Circle size={24} color={isOverdue ? "#fca5a5" : "#cbd5e1"} />
                    )}
                    <View className="ml-3 flex-1">
                      <Text className={`text-sm font-bold ${item.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {item.taskName} {item.is_mandatory && <Text className="text-red-400">*</Text>}
                      </Text>
                      
                      <View className="flex-row items-center mt-1">
                        <Text className={`text-xs ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                          {item.due_time}
                        </Text>
                        {isOverdue && (
                          <View className="ml-2 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                            <Text className="text-[9px] font-black text-red-600 uppercase">Overdue</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Interactive Airport Guide */}
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
                    <Text className="text-lg font-black text-slate-800">Internal Airport Guide</Text>
                    <Text className="text-xs text-slate-400 font-medium">{flightBaseData.terminal} • Gate {flightBaseData.gate}</Text>
                  </View>
                </View>
                {showAirportGuide ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
              </TouchableOpacity>
              
              {showAirportGuide && (
                <View className="px-6 pb-6 pt-2 bg-slate-50 border-t border-slate-100">
                  <View className="mb-4">
                    <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Step 1: Check-in</Text>
                    <Text className="text-sm text-slate-700 leading-5">Upon arrival at {flightBaseData.terminal}, head directly to Zone 2 for bag drop.</Text>
                  </View>
                  <View className="mb-4">
                    <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Step 2: Security</Text>
                    <Text className="text-sm text-slate-700 leading-5">Security clearance is located on Level 2. Fast Track is available for Business class.</Text>
                  </View>
                  <View className="mb-4">
                    <Text className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Step 3: Boarding</Text>
                    <Text className="text-sm text-slate-700 leading-5">Gate {flightBaseData.gate} is a 10-minute walk from security. Follow signs for Concourse B.</Text>
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