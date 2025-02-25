import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";
import { Svg, Circle } from "react-native-svg";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

export default function ParkingSlots() {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchParkingSlots();
  }, []);

  async function fetchParkingSlots() {
    setLoading(true);

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error fetching user:", userError.message);
      setLoading(false);
      return;
    }

    const userId = userData?.user?.id; // Extract the current user ID
    if (!userId) {
      console.error("User not found");
      setLoading(false);
      return;
    }

    // Fetch only parking slots booked by the current user
    const { data, error } = await supabase
      .from("parking_slots")
      .select("id, status, profiles(username, avatar_url)")
      .eq("profiles.id", userId) // Filter by current user ID
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching parking slots:", error.message);
    } else {
      setParkingSlots(data);
    }
    setLoading(false);
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
      renderItem={({ item }) => <ParkingSlotCard slot={item} navigation={navigation} />}
      contentContainerStyle={styles.listContainer}
    />
  );
}

function ParkingSlotCard({ slot, navigation }) {
  const isOccupied = slot.status === "reserved";

  return (
    <TouchableOpacity
      style={[styles.card, isOccupied ? styles.occupied : styles.available]}
      onPress={() => navigation.navigate("SlotDetails", { slot })}
    >
      <Svg height="50" width="50">
        <Circle cx="25" cy="25" r="20" fill={isOccupied ? "red" : "green"} />
      </Svg>

      <View style={styles.cardText}>
        <Text style={styles.slotNumber}>Slot {slot.id}</Text>
        <Text style={styles.username}>
          {/*{slot.profiles ? `Booked by: ${slot.profiles.username}` : "Booked"}*/}
          {(() => {
            if (slot.profiles) {
              return (
                <Text style={styles.username}>
                  Booked by: {slot.profiles.username}
                </Text>
              );
            } else if (!slot.profiles && isOccupied) {
              return (
                <Text style={styles.username}>
                  Booked
                </Text>
              );
            } else {
              return (
                <Text style={styles.username}>
                  Available
                </Text>
              );
            }
          })()}
        </Text>
      </View>
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
    marginLeft: 15,
  },
  slotNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  username: {
    fontSize: 14,
    color: "gray",
  },
});

