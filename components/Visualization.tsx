import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseKey);

const SLOT_STATUS = {
  EMPTY: 'empty',
  RESERVED: 'reserved',
  OCCUPIED: 'occupied',
};

const PRICE_PER_SLOT = 200;
const decks = ['Upper Deck', 'Lower Deck'];

const SmartParkingSystem = ({ route }) => {
  const { session } = route.params;
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const navigation = useNavigation();

  const [isFromPickerVisible, setFromPickerVisible] = useState(false);
  const [isToPickerVisible, setToPickerVisible] = useState(false);
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());

  useEffect(() => {
    fetchSlots();
    if (session && session.user) {
      setUserId(session.user.id);
      console.log('User ID in SmartParkingSystem:', session.user.id);
    } else {
      console.log('No session in SmartParkingSystem');
    }
  }, [session]);

  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_slots')
        .select('*, profiles(username)')
        .order('id');

      if (error) throw error;
      const validData = (data || []).filter(
        (slot) => slot.id && slot.deck && slot.status
      );
      setSlots(validData);
    } catch (err) {
      console.error('Fetch Slots Error:', err);
      Alert.alert('Error', 'Failed to fetch parking slots.');
    }
  };

  const updateSlot = async (slotId, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
      };

      if (newStatus === SLOT_STATUS.RESERVED && userId) {
        updateData.uid = userId;
        updateData.from = fromTime.toISOString();
        updateData.to = toTime.toISOString();
      } else if (newStatus === SLOT_STATUS.EMPTY) {
        updateData.uid = null;
        updateData.from = null;
        updateData.to = null;
      }

      const { data, error } = await supabase
        .from('parking_slots')
        .update(updateData)
        .eq('id', parseInt(slotId, 10))
        .select('*');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No matching slot found to update.');
      }

      setSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot.id === slotId ? { ...slot, ...updateData } : slot
        )
      );

      if (newStatus === SLOT_STATUS.RESERVED) {
        setSelectedSlots((prev) => [...prev, slotId]);
      } else {
        setSelectedSlots((prev) => prev.filter((id) => id !== slotId));
      }

      fetchSlots();
    } catch (err) {
      console.error('Update Slot Error:', err);
      Alert.alert('Error', err.message || 'Failed to update the slot status.');
    }
  };

  const handleSlotPress = (slot) => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to reserve a slot.');
      return;
    }

    if (slot.status === SLOT_STATUS.EMPTY) {
      setSelectedSlotId(slot.id);
      setFromPickerVisible(true);
    } else if (slot.status === SLOT_STATUS.RESERVED) {
      if (selectedSlots.includes(slot.id)) {
        updateSlot(slot.id, SLOT_STATUS.EMPTY);
      } else {
        Alert.alert('Slot Reserved', 'This slot is already reserved by someone else.');
      }
    } else if (slot.status === SLOT_STATUS.OCCUPIED) {
      Alert.alert('Slot Occupied', 'This slot is currently occupied.');
    }
  };

  const getTimeLimits = () => {
    const now = new Date();
    const minTime = new Date(now);
    minTime.setHours(7, 0, 0, 0); // 7:00 AM today
    const maxTime = new Date(now);
    maxTime.setHours(22, 0, 0, 0); // 10:00 PM today
    return { minTime, maxTime };
  };

  const handleFromConfirm = (date) => {
    const { minTime, maxTime } = getTimeLimits();
    setFromPickerVisible(false);

    if (date < minTime || date > maxTime) {
      Alert.alert('Invalid Time', 'Please select a time between 7:00 AM and 10:00 PM.');
      return;
    }

    setFromTime(date);
    setToPickerVisible(true);
  };

  const handleToConfirm = (date) => {
    const { minTime, maxTime } = getTimeLimits();
    setToPickerVisible(false);

    if (date < minTime || date > maxTime) {
      Alert.alert('Invalid Time', 'Please select a time between 7:00 AM and 10:00 PM.');
      return;
    }

    if (date <= fromTime) {
      Alert.alert('Error', 'End time must be after start time.');
      return;
    }

    setToTime(date);
    if (selectedSlotId) {
      updateSlot(selectedSlotId, SLOT_STATUS.RESERVED);
    } else {
      Alert.alert('Error', 'No slot selected.');
    }
  };

  const goToPayment = () => {
    if (selectedSlots.length === 0) {
      Alert.alert('No Slots Selected', 'Please select at least one parking slot.');
      return;
    }

    const totalAmount = selectedSlots.length * PRICE_PER_SLOT;
    navigation.navigate('Payment', {
      slots: selectedSlots,
      amount: totalAmount,
      pricePerSlot: PRICE_PER_SLOT,
      session: session,
      fromTime: fromTime.toISOString(),
      toTime: toTime.toISOString(),
    });
  };

  const renderSlot = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.slot,
        getSlotStyle(item.status, item.uid),
        selectedSlots.includes(item.id) && styles.selectedSlot,
      ]}
      onPress={() => handleSlotPress(item)}
    >
      <Text style={styles.slotText}>{item.id}</Text>
      {(() => {
        if (item.profiles && item.uid !== userId) {
          return <Text style={styles.slotInfo}>Booked</Text>;
        } else if (item.uid === userId) {
          return <Text style={styles.slotInfo}>Booked by you</Text>;
        } else if (!item.profiles && item.status === SLOT_STATUS.OCCUPIED) {
          return <Text style={styles.slotInfo}>Booked</Text>;
        } else {
          return <Text style={styles.slotInfo}>Available</Text>;
        }
      })()}
    </TouchableOpacity>
  );

  const getSlotStyle = (status, slotUid) => {
    if (status === SLOT_STATUS.RESERVED && slotUid === userId) {
      return styles.yourSlot;
    }
    switch (status) {
      case SLOT_STATUS.EMPTY:
        return styles.emptySlot;
      case SLOT_STATUS.RESERVED:
        return styles.reservedSlot;
      case SLOT_STATUS.OCCUPIED:
        return styles.occupiedSlot;
      default:
        return styles.emptySlot;
    }
  };

  const { minTime, maxTime } = getTimeLimits();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Price per slot: ₹{PRICE_PER_SLOT}</Text>
          <Text style={styles.infoText}>
            Selected slots: {selectedSlots.length}
            {selectedSlots.length > 0 ? ` (₹${selectedSlots.length * PRICE_PER_SLOT})` : ''}
          </Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setFromPickerVisible(true)}
          >
            <Text style={styles.timeButtonText}>
              From: {fromTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setToPickerVisible(true)}
          >
            <Text style={styles.timeButtonText}>
              To: {toTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          <Text style={styles.infoText}>Booking available: 7:00 AM - 10:00 PM</Text>
        </View>

        {decks.map((deck) => {
          const filteredSlots = slots.filter(
            (slot) => slot.deck.trim().toLowerCase() === deck.trim().toLowerCase()
          );
          return (
            <View key={deck} style={styles.deck}>
              <Text style={styles.deckTitle}>{deck}</Text>
              {filteredSlots.length > 0 ? (
                <FlatList
                  data={filteredSlots}
                  renderItem={renderSlot}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={3}
                />
              ) : (
                <Text>No slots available for this deck.</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      <DateTimePickerModal
        isVisible={isFromPickerVisible}
        mode="datetime"
        onConfirm={handleFromConfirm}
        onCancel={() => setFromPickerVisible(false)}
        date={fromTime}
        minimumDate={minTime}
        maximumDate={maxTime}
      />
      <DateTimePickerModal
        isVisible={isToPickerVisible}
        mode="datetime"
        onConfirm={handleToConfirm}
        onCancel={() => setToPickerVisible(false)}
        date={toTime}
        minimumDate={minTime}
        maximumDate={maxTime}
      />

      {selectedSlots.length > 0 && (
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity style={styles.paymentButton} onPress={goToPayment}>
            <Text style={styles.paymentButtonText}>
              Proceed to Payment (₹{selectedSlots.length * PRICE_PER_SLOT})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 80,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  timeButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  timeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  deck: {
    marginVertical: 10,
  },
  deckTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  slot: {
    width: 100,
    height: 80,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    padding: 5,
  },
  slotText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  slotInfo: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptySlot: {
    backgroundColor: '#e0e0e0',
  },
  reservedSlot: {
    backgroundColor: '#f9a825',
  },
  occupiedSlot: {
    backgroundColor: '#e53935',
  },
  yourSlot: {
    backgroundColor: 'green',
  },
  selectedSlot: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  paymentButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  paymentButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SmartParkingSystem;
