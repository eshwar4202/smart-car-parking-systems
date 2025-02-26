import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { supabase } from "../lib/supabase";
import { Svg, Circle } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";

export default function ParkingSlots({ route }) {
  const { session } = route.params;
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (session && session.user) {
      setUserId(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    if (userId) {
      fetchParkingSlots();
    }
  }, [userId]);

  async function fetchParkingSlots() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("parking_slots")
        .select("id, deck, status, uid, from, to") // Added from and to
        .eq("uid", userId)
        .neq("status", "cancelled")
        .order("id", { ascending: true });

      if (error) throw error;
      setParkingSlots(data);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setParkingSlots([]);
    } finally {
      setLoading(false);
    }
  }

  async function cancelSlot(slotId) {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this slot?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("parking_slots")
                .update({ status: "empty", uid: null, from: null, to: null }) // Clear timestamps too
                .eq("id", slotId)
                .eq("uid", userId);

              if (error) throw error;
              fetchParkingSlots();
            } catch (err) {
              console.error("Error cancelling slot:", err);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading your booked slots...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={parkingSlots}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <ParkingSlotCard slot={item} navigation={navigation} onCancel={cancelSlot} />
      )}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={<Text>No booked slots found</Text>}
    />
  );
}

function ParkingSlotCard({ slot, navigation, onCancel }) {
  const isOccupied = slot.status === "reserved";

  // Format timestamps for display
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "Not set";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <TouchableOpacity
      style={[styles.card, isOccupied ? styles.occupied : styles.available]}
      onPress={() => navigation.navigate("SlotDetails", { slot })}
    >
      <Svg height="50" width="50">
        <Circle cx="25" cy="25" r="20" fill={isOccupied ? "red" : "green"} />
      </Svg>

      <View style={styles.cardText}>
        <Text style={styles.slotNumber}>Slot {slot.id} ({slot.deck})</Text>
        <Text style={styles.statusText}>{isOccupied ? "Booked" : "Available"}</Text>
        <Text style={styles.timeText}>From: {formatDateTime(slot.from)}</Text>
        <Text style={styles.timeText}>To: {formatDateTime(slot.to)}</Text>
      </View>

      {isOccupied && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => onCancel(slot.id)}>
          <Text style={styles.cancelText}>X</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  listContainer: {
    padding: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  occupied: {
    borderLeftWidth: 5,
    borderLeftColor: "red",
  },
  available: {
    borderLeftWidth: 5,
    borderLeftColor: "green",
  },
  cardText: {
    flex: 1,
    marginLeft: 15,
  },
  slotNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: "gray",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#333",
  },
  cancelButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
