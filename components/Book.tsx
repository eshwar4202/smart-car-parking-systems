import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  Button
} from "react-native";
import { supabase } from "../lib/supabase";
import { Svg, Circle } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";

export default function ParkingSlots({ route }) {
  const { session } = route.params;
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

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
        .select("id, deck, status, uid, from, to")
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
    setSelectedSlotId(slotId);
    setShowCancelModal(true);
  }

  async function handleCancelConfirmation() {
    if (!cancelReason.trim()) {
      Alert.alert("Error", "Please provide a reason for cancellation");
      return;
    }

    try {
      // Check if wallet exists
      let { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (walletError && walletError.code === "PGRST116") {
        // Wallet doesn't exist, create one with initial balance
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({ user_id: userId, balance: 100 })
          .select()
          .single();

        if (createError) throw createError;
        walletData = newWallet;
      } else if (walletError) {
        throw walletError;
      }

      if (!walletData || walletData.balance < 10) {
        Alert.alert("Error", "Insufficient balance in your wallet");
        return;
      }

      // Update parking slot
      const { error: slotError } = await supabase
        .from("parking_slots")
        .update({ status: "empty", uid: null, from: null, to: null })
        .eq("id", selectedSlotId)
        .eq("uid", userId);

      if (slotError) throw slotError;

      // Deduct from wallet
      const { error: deductError } = await supabase
        .from("wallets")
        .update({ balance: walletData.balance - 10 })
        .eq("user_id", userId);

      if (deductError) throw deductError;

      // Insert cancellation record
      const { error: cancelError } = await supabase
        .from("cancel")
        .insert({
          user_id: userId,
          message: cancelReason,
          slot_id: selectedSlotId,
          created_at: new Date().toISOString()
        });

      if (cancelError) throw cancelError;

      // Insert transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          transaction_type: "CANCELLATION FEE",
          amount: -10,  // Negative amount since it's a deduction
          created_at: new Date().toISOString()  // Optional: if you want to track when it happened
        });

      if (transactionError) throw transactionError;

      Alert.alert(
        "Cancellation Successful",
        "Deducted Rs 10 from your wallet",
        [{ text: "OK", onPress: () => fetchParkingSlots() }]
      );

      setShowCancelModal(false);
      setCancelReason("");
      setSelectedSlotId(null);
    } catch (err) {
      console.error("Error cancelling slot:", err);
      Alert.alert("Error", "Failed to cancel slot. Please try again.");
    }
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
    <>
      <FlatList
        data={parkingSlots}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ParkingSlotCard slot={item} navigation={navigation} onCancel={cancelSlot} />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text>No booked slots found</Text>}
      />

      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Booking</Text>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for cancellation (Rs 10 will be deducted):
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter cancellation reason"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                color="#4C4C9D" 
              />
              <Button
                title="Confirm"
                onPress={handleCancelConfirmation}
                color="#4CAF50"
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function ParkingSlotCard({ slot, navigation, onCancel }) {
  const isOccupied = slot.status === "reserved";

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
    borderLeftColor: "#4C4C9D",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    color: "gray",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
