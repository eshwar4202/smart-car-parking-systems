```
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_KEY'; // Replace with your actual key
const supabase = createClient(supabaseUrl, supabaseKey);

const SLOT_STATUS = {
  EMPTY: 'empty',
  RESERVED: 'reserved',
  OCCUPIED: 'occupied',
};

const predefinedQuestions = [
  "What are your hours?",
  "Do you offer discounts?",
  "Is parking available?"
];

const SmartParkingSystem = () => {
  const [slots, setSlots] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    fetchSlots();
    fetchMessages();
  }, []);

  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase.from('parking_slots').select('*').order('id');
      if (error) throw error;
      setSlots(data || []);
    } catch (err) {
      console.error('Fetch Slots Error:', err);
      Alert.alert('Error', 'Failed to fetch parking slots.');
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase.from('messages').select('*').order('created_at');
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Fetch Messages Error:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await supabase.from('messages').insert([{ user_role: userRole, content: newMessage, created_at: new Date() }]);
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSlotPress = async (slot) => {
    if (slot.status === SLOT_STATUS.EMPTY) {
      await updateSlot(slot.id, SLOT_STATUS.RESERVED);
    } else {
      Alert.alert('Info', Slot is ${slot.status});
    }
  };

  const updateSlot = async (slotId, newStatus) => {
    try {
      await supabase.from('parking_slots').update({ status: newStatus }).eq('id', slotId);
      fetchSlots();
    } catch (err) {
      console.error('Update Slot Error:', err);
      Alert.alert('Error', 'Failed to update slot status.');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={item.user_role === 'user' ? styles.userMessage : styles.providerMessage}>
            <Text>{item.content}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <TextInput
        style={styles.input}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Type a message..."
      />
      <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
      <FlatList
        data={slots}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.slot, styles[item.status]]}
            onPress={() => handleSlotPress(item)}
          >
            <Text>{item.id}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginTop: 10 },
  sendButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, marginTop: 10 },
  sendButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#e0e0e0', padding: 10, marginBottom: 5, borderRadius: 5 },
  providerMessage: { alignSelf: 'flex-start', backgroundColor: '#f9a825', padding: 10, marginBottom: 5, borderRadius: 5 },
  slot: { width: 50, height: 50, margin: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 5 },
  empty: { backgroundColor: '#ddd' },
  reserved: { backgroundColor: '#ffa500' },
  occupied: { backgroundColor: '#ff0000' },
});

export default SmartParkingSystem;
```