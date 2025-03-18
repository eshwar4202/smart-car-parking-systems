// Full update of Book.tsx with DateTimePickerModal integration and time validation
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
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function ParkingSlots({ route }) {
  const { session } = route.params;
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [newFromTime, setNewFromTime] = useState(new Date());
  const [newToTime, setNewToTime] = useState(new Date());
  const [isFromPickerVisible, setFromPickerVisible] = useState(false);
  const [isToPickerVisible, setToPickerVisible] = useState(false);

  useEffect(() => {
    if (session?.user) setUserId(session.user.id);
  }, [session]);

  useEffect(() => {
    if (userId) {
      fetchWalletBalance();
      fetchParkingSlots();
    }
  }, [userId]);

  async function fetchWalletBalance() {
    const { data, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (!error && data) setWalletBalance(data.balance);
  }

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

  const handleCancelClick = (slot) => {
    setSelectedSlot(slot);
    setShowCancelModal(true);
  };

  const handleChangeTiming = async () => {
    if (!selectedSlot) return;

    if (newFromTime >= newToTime) {
      Alert.alert("Error", "Start time cannot exceed or be equal to end time.");
      return;
    }

    if (walletBalance < 50) {
      Alert.alert("Error", "Insufficient balance to change timings (Rs 50 required)");
      return;
    }

    try {
      await supabase
        .from("parking_slots")
        .update({ from: newFromTime.toISOString(), to: newToTime.toISOString() })
        .eq("id", selectedSlot.id)
        .eq("uid", userId);

      await supabase
        .from("wallets")
        .update({ balance: walletBalance - 50 })
        .eq("user_id", userId);

      await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          transaction_type: "TIMING CHANGE FEE",
          amount: -50,
          created_at: new Date().toISOString()
        });

      Alert.alert("Success", "Timings updated. Rs 50 deducted from wallet.");
      fetchWalletBalance();
      fetchParkingSlots();
    } catch (err) {
      console.error("Error updating timing:", err);
      Alert.alert("Error", "Failed to update timings.");
    } finally {
      setShowTimePickerModal(false);
      setSelectedSlot(null);
    }
  };

  const handleFinalCancel = async () => {
    if (!cancelReason.trim()) {
      Alert.alert("Error", "Please provide a reason for cancellation");
      return;
    }

    try {
      if (walletBalance < 10) {
        Alert.alert("Error", "Insufficient balance to cancel (Rs 10 required)");
        return;
      }

      await supabase
        .from("parking_slots")
        .update({ status: "empty", uid: null, from: null, to: null })
        .eq("id", selectedSlot.id)
        .eq("uid", userId);

      await supabase
        .from("wallets")
        .update({ balance: walletBalance - 10 })
        .eq("user_id", userId);

      await supabase
        .from("cancel")
        .insert({ user_id: userId, message: cancelReason, slot_id: selectedSlot.id, created_at: new Date().toISOString() });

      await supabase
        .from("transactions")
        .insert({ user_id: userId, transaction_type: "CANCELLATION FEE", amount: -10, created_at: new Date().toISOString() });

      Alert.alert("Cancelled", "Rs 10 deducted from wallet.");
      fetchWalletBalance();
      fetchParkingSlots();
    } catch (err) {
      console.error("Error cancelling:", err);
      Alert.alert("Error", "Failed to cancel slot.");
    } finally {
      setShowCancelModal(false);
      setCancelReason("");
      setSelectedSlot(null);
    }
  };

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
          <ParkingSlotCard slot={item} onCancel={handleCancelClick} />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text>No booked slots found</Text>}
      />

      <Modal visible={showCancelModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel or Change Booking</Text>
            <Button title="Change Timings (Rs 50)" onPress={() => { setShowCancelModal(false); setShowTimePickerModal(true); }} />
            <TextInput placeholder="Reason for cancellation (Rs 10)" style={styles.input} value={cancelReason} onChangeText={setCancelReason} multiline />
            <Button title="Confirm Cancellation" onPress={handleFinalCancel} color="#d9534f" />
            <Button title="Close" onPress={() => setShowCancelModal(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={showTimePickerModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select New Timing</Text>

            <Button title="Set New From Time" onPress={() => setFromPickerVisible(true)} />
            <DateTimePickerModal
              isVisible={isFromPickerVisible}
              mode="datetime"
              onConfirm={(date) => { setNewFromTime(date); setFromPickerVisible(false); }}
              onCancel={() => setFromPickerVisible(false)}
              date={newFromTime}
            />

            <Button title="Set New To Time" onPress={() => setToPickerVisible(true)} />
            <DateTimePickerModal
              isVisible={isToPickerVisible}
              mode="datetime"
              onConfirm={(date) => { setNewToTime(date); setToPickerVisible(false); }}
              onCancel={() => setToPickerVisible(false)}
              date={newToTime}
            />

            <Button title="Confirm New Timing" onPress={handleChangeTiming} color="#5cb85c" />
            <Button title="Cancel" onPress={() => setShowTimePickerModal(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

function ParkingSlotCard({ slot, onCancel }) {
  const isOccupied = slot.status === "reserved";

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "Not set";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <View style={[styles.card, isOccupied ? styles.occupied : styles.available]}>
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
        <TouchableOpacity style={styles.cancelButton} onPress={() => onCancel(slot)}>
          <Text style={styles.cancelText}>X</Text>
        </TouchableOpacity>
      )}
    </View>
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: "top",
  },
});