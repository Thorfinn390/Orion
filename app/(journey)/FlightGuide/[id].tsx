import Ticket from "@/components/Flight/Ticket";
import CustomLocationModal from "@/components/Guide/MapModal";
import { apiFetch } from "@/utils/apiFetch";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const GOOGLE_API_KEY = "AIzaSyAXeFgQDQ7bacngbYQpZYq9A7-uLiHvw5A";

export default function PlanMyJourney() {
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [isLocating, setIsLocating] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [isCustomMapVisible, setIsCustomMapVisible] = useState(false);
  const [firstTimeTraveler, setFirstTimeTraveler] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [pendingPin, setPendingPin] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [startingPoint, setStartingPoint] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const mapRef = useRef<MapView>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["flight", id],
    queryFn: async () => {
      const response = await apiFetch(`/flight/${id}`, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch flight");
      const result = await response.json();
      return result.data;
    },
    enabled: !!id,
  });

  const resolveAndSetLocation = async (latitude: number, longitude: number) => {
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (reverseGeocode.length > 0) {
      const addr = reverseGeocode[0];
      const line1 =
        [addr.streetNumber, addr.street].filter(Boolean).join(" ") ||
        addr.name ||
        null;
      const line2 =
        [addr.subregion ?? addr.district, addr.city]
          .filter(Boolean)
          .join(", ") ||
        addr.region ||
        null;
      const line3 = [addr.region, addr.country].filter(Boolean).join(", ");
      const formattedAddress = [line1, line2, line3].filter(Boolean).join(", ");
      setStartingPoint({ address: formattedAddress, latitude, longitude });
    } else {
      setStartingPoint({
        address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        latitude,
        longitude,
      });
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({ type: "error", text1: "Permission Denied" });
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      await resolveAndSetLocation(
        location.coords.latitude,
        location.coords.longitude,
      );
      Toast.show({ type: "success", text1: "Location Updated" });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not fetch location",
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handleOpenCustomMap = async () => {
    setPendingPin(null);
    setIsMapLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (_) {
    } finally {
      setIsMapLoading(false);
      setIsCustomMapVisible(true);
    }
  };

  const handleConfirmCustomLocation = async () => {
    if (!pendingPin) return;
    try {
      await resolveAndSetLocation(pendingPin.latitude, pendingPin.longitude);
      Toast.show({ type: "success", text1: "Location Set" });
    } catch {}
    setIsCustomMapVisible(false);
    setPendingPin(null);
  };

  if (isLoading)
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#1568C4" />
      </View>
    );

  if (error || !data)
    return (
      <View className="flex-1 bg-surface items-center justify-center p-xl">
        <Text className="text-primary font-black text-xl">
          Flight not found
        </Text>
      </View>
    );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-navtab px-5 pt-4 pb-6 rounded-b-[32px]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 bg-white/10 rounded-lg items-center justify-center mb-5"
          >
            <Ionicons name="arrow-back" size={18} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-black">
            Plan My Journey
          </Text>
        </View>

        <View className="px-4 pt-5 pb-2">
          <Ticket data={{ flight: data }} onClose={() => router.back()} />
        </View>

        <View className="px-5 pb-6">
          <View className="mb-5">
            <View className="flex-row items-center mb-3">
              <View className="w-7 h-7 rounded-full bg-primaryBrand items-center justify-center mr-3">
                <Text className="text-white font-black text-xs">1</Text>
              </View>
              <View>
                <Text className="text-primary font-black text-base">
                  Starting Location
                </Text>
                <Text className="text-gray-500 text-xs">
                  Choose where your journey starts from.
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-xl border border-black/8 overflow-hidden">
              {!startingPoint ? (
                <View>
                  <TouchableOpacity
                    onPress={handleGetCurrentLocation}
                    disabled={isLocating || isMapLoading}
                    className="flex-row items-center justify-center h-14 border-b border-black/5"
                  >
                    {isLocating ? (
                      <ActivityIndicator color="#1568C4" />
                    ) : (
                      <Text className="text-primaryBrand font-black uppercase text-xs">
                        Use Current Location
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleOpenCustomMap}
                    disabled={isLocating || isMapLoading}
                    className="flex-row items-center justify-center h-14"
                  >
                    {isMapLoading ? (
                      <ActivityIndicator color="#7B5FE8" />
                    ) : (
                      <Text className="text-nova font-black uppercase text-xs">
                        Pick on Map
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <MapView
                    style={{ width: "100%", height: 180 }}
                    provider={PROVIDER_GOOGLE}
                    scrollEnabled={false}
                    region={{
                      latitude: startingPoint.latitude,
                      longitude: startingPoint.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: startingPoint.latitude,
                        longitude: startingPoint.longitude,
                      }}
                    />
                  </MapView>

                  <View className="px-4 pt-4">
                    <Text className="text-primary font-black text-xs uppercase">
                      Selected Location
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      {startingPoint.address}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setStartingPoint(null)}
                    className="p-4 items-center"
                  >
                    <Text className="text-nova font-black text-[10px] uppercase">
                      Reset Location
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View>
            <View className="flex-row items-center mb-3">
              <View className="w-7 h-7 rounded-full bg-primaryBrand items-center justify-center mr-3">
                <Text className="text-white font-black text-xs">2</Text>
              </View>
              <View>
                <Text className="text-primary font-black text-base">
                  Traveler Experience
                </Text>
                <Text className="text-gray-500 text-xs">
                  Tell us if this is your first time traveling.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setFirstTimeTraveler((prev) => !prev)}
              activeOpacity={0.8}
              className="bg-white rounded-xl border border-black/8 p-4 flex-row items-center justify-between"
            >
              <View className="flex-1 pr-4">
                <Text className="text-primary font-black text-base">
                  First-time traveler
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  Check this if this is your first time traveling.
                </Text>
              </View>

              <Ionicons
                name={firstTimeTraveler ? "checkbox" : "square-outline"}
                size={24}
                color={firstTimeTraveler ? "#1568C4" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>

          <View className="mt-5">
            <View className="flex-row items-center mb-3">
              <View className="w-7 h-7 rounded-full bg-primaryBrand items-center justify-center mr-3">
                <Text className="text-white font-black text-xs">3</Text>
              </View>
              <View>
                <Text className="text-primary font-black text-base">
                  Generate Your Guide
                </Text>
                <Text className="text-gray-500 text-xs">
                  Create your full travel guide for this flight.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!startingPoint}
              className={`h-14 rounded-xl items-center justify-center ${
                startingPoint ? "bg-primaryBrand" : "bg-gray-300"
              }`}
            >
              <Text className="text-white font-black uppercase text-xs">
                Generate Guide
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomLocationModal
        visible={isCustomMapVisible}
        onClose={() => setIsCustomMapVisible(false)}
        userLocation={userLocation}
        pendingPin={pendingPin}
        setPendingPin={setPendingPin}
        onConfirm={handleConfirmCustomLocation}
        mapRef={mapRef as React.RefObject<MapView>}
        googleApiKey={GOOGLE_API_KEY}
      />
    </SafeAreaView>
  );
}
