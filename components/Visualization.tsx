// Smart Parking System using Expo and Supabase

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseKey);

const SLOT_STATUS = {
  EMPTY: 'empty',
  RESERVED: 'reserved',
  OCCUPIED: 'occupied',
};

const decks = ['Upper Deck', 'Lower Deck'];

const SmartParkingSystem = () => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    fetchSlots();
  }, []);

  // Fetch slots from Supabase
  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_slots')
        .select('*')
        .order('id'); // order by id for consistency

      if (error) throw error;

      console.log('Raw Fetched Data:', data);

      const validData = (data || []).filter(
        (slot) => slot.id && slot.deck && slot.status
      );

      console.log('Fetched and Validated Slots:', validData);
      setSlots(validData);
    } catch (err) {
      console.error('Fetch Slots Error:', err);
      Alert.alert('Error', 'Failed to fetch parking slots. Check your network or Supabase credentials.');
    }
  };

  // Update slot status
  const updateSlot = async (slotId, newStatus) => {
    try {
      console.log('Updating Slot ID:', slotId, 'to Status:', newStatus);

      // Ensure slotId is an integer and fetch updated row
      const { data, error } = await supabase
        .from('parking_slots')
        .update({ status: newStatus })
        .eq('id', parseInt(slotId, 10))
        .select('*'); // returns updated rows

      // Check for error
      if (error) throw error;

      // If no rows were updated, data might be null or empty
      if (!data || data.length === 0) {
        throw new Error('No matching slot found to update.');
      }

      // Optimistically update local state for instant UI feedback
      setSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot.id === slotId ? { ...slot, status: newStatus } : slot
        )
      );

      Alert.alert('Success', `Slot updated to ${newStatus}`);
      // Re-fetch to ensure data sync with Supabase
      fetchSlots();
    } catch (err) {
      console.error('Update Slot Error:', err);
      Alert.alert('Error', err.message || 'Failed to update the slot status.');
    }
  };

  // Handle slot press
  const handleSlotPress = (slot) => {
    if (slot.status === SLOT_STATUS.EMPTY) {
      updateSlot(slot.id, SLOT_STATUS.RESERVED);
    } else if (slot.status === SLOT_STATUS.RESERVED) {
      Alert.alert('Slot Reserved', 'This slot is already reserved.');
    } else if (slot.status === SLOT_STATUS.OCCUPIED) {
      Alert.alert('Slot Occupied', 'This slot is currently occupied.');
    }
  };

  // Render each slot
  const renderSlot = ({ item }) => (
    <TouchableOpacity
      style={[styles.slot, getSlotStyle(item.status)]}
      onPress={() => handleSlotPress(item)}
    >
      <Text style={styles.slotText}>{item.id}</Text>
    </TouchableOpacity>
  );

  // Determine slot style based on status
  const getSlotStyle = (status) => {
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

  // Main render
  return (
    <View style={styles.container}>
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
                numColumns={5}
              />
            ) : (
              <Text>No slots available for this deck.</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
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
    width: 50,
    height: 50,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
  },
  slotText: {
    color: '#000',
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
});

export default SmartParkingSystem;
