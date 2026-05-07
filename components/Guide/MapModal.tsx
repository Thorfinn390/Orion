import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number } | null;
  pendingPin: { latitude: number; longitude: number } | null;
  setPendingPin: (coords: { latitude: number; longitude: number }) => void;
  onConfirm: () => void;
  mapRef: React.RefObject<MapView>;
  googleApiKey: string;
}

export default function CustomLocationModal({
  visible,
  onClose,
  userLocation,
  pendingPin,
  setPendingPin,
  onConfirm,
  mapRef,
  googleApiKey,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          showsMyLocationButton={false}
          initialRegion={{
            latitude: userLocation?.latitude ?? 33.8938,
            longitude: userLocation?.longitude ?? 35.5018,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={(e) => setPendingPin(e.nativeEvent.coordinate)}
        >
          {pendingPin && <Marker coordinate={pendingPin} pinColor="#1568C4" />}
        </MapView>

        <SafeAreaView
          className="absolute top-0 left-0 right-0 px-4 pt-3"
          edges={["top"]}
          style={{ zIndex: 10 }}
        >
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-md"
            >
              <Ionicons name="close" size={20} color="#0D1A3A" />
            </TouchableOpacity>

            <View className="flex-1 bg-white rounded-xl shadow-md overflow-hidden">
              <GooglePlacesAutocomplete
                placeholder="Search for a location..."
                fetchDetails={true}
                onPress={(_, details) => {
                  if (!details) return;
                  const { lat, lng } = details.geometry.location;
                  setPendingPin({ latitude: lat, longitude: lng });
                  mapRef.current?.animateToRegion({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  });
                }}
                query={{ key: googleApiKey, language: "en" }}
                styles={{
                  container: { flex: 0 },
                  textInput: {
                    height: 44,
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#0D1A3A",
                    paddingHorizontal: 14,
                    backgroundColor: "white",
                  },
                  listView: {
                    backgroundColor: "white",
                    borderTopWidth: 1,
                    borderTopColor: "#f0f0f0",
                  },
                  row: { paddingVertical: 10, paddingHorizontal: 14 },
                  description: { fontSize: 12, color: "#444" },
                }}
                enablePoweredByContainer={false}
              />
            </View>
          </View>
        </SafeAreaView>

        {userLocation && (
          <TouchableOpacity
            onPress={() =>
              mapRef.current?.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              })
            }
            className="absolute right-4 bg-white w-11 h-11 rounded-xl items-center justify-center shadow-md"
            style={{ bottom: 180 }}
          >
            <Ionicons name="locate" size={20} color="#1568C4" />
          </TouchableOpacity>
        )}

        <View className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-5 pb-8 rounded-t-2xl shadow-xl">
          {pendingPin ? (
            <View className="flex-row bg-surface rounded-lg p-3 border border-black/5 mb-4">
              <View className="flex-1">
                <Text className="text-textMuted text-[9px] font-black uppercase tracking-wide mb-0.5">
                  Latitude
                </Text>
                <Text className="text-textPrimary font-mono font-bold text-xs">
                  {pendingPin.latitude.toFixed(6)}
                </Text>
              </View>
              <View className="w-px bg-borderDefault mx-3" />
              <View className="flex-1">
                <Text className="text-textMuted text-[9px] font-black uppercase tracking-wide mb-0.5">
                  Longitude
                </Text>
                <Text className="text-textPrimary font-mono font-bold text-xs">
                  {pendingPin.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center mb-4">
              <Ionicons name="hand-left-outline" size={16} color="#9CA3AF" />
              <Text className="text-textMuted text-xs ml-2">
                Tap anywhere on the map to place a pin
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={onConfirm}
            disabled={!pendingPin}
            className="py-4 rounded-xl items-center"
            style={{ backgroundColor: pendingPin ? "#1568C4" : "#E5E7EB" }}
          >
            <Text
              className="font-black text-sm uppercase tracking-widest"
              style={{ color: pendingPin ? "white" : "#9CA3AF" }}
            >
              {pendingPin ? "Confirm Location" : "Select a Location First"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
