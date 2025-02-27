import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { createClient } from '@supabase/supabase-js';
import { useNavigation, useRoute } from '@react-navigation/native';

// Supabase Configuration
const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';  // Replace with your actual Supabase anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// List of Available Services
const services = [
  { id: 1, name: 'Car Wash', description: 'Complete exterior and interior car wash.' },
  { id: 2, name: 'Oil Change', description: 'Quick oil change service with quality oil.' },
  { id: 3, name: 'Tire Alignment', description: 'Ensure your tires are properly aligned for safety.' },
  { id: 4, name: 'Brake Repair', description: 'Professional brake repair and maintenance service.' },
];

export default function ServiceBooking() {
  const navigation = useNavigation();
  const route = useRoute();

  // Get session from route params (passed from navigation)
  const session = route.params?.session || null;
  const userId = session?.user?.id || null;

  const [selectedService, setSelectedService] = useState<{ id: number; name: string; description: string } | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Called when user taps 'Book Service'
  const handleBookPress = () => {
    if (!selectedService) {
      Alert.alert('Error', 'Please select a service first.');
      return;
    }
    setDatePickerVisibility(true);
  };

  // Called once user confirms date/time
  const handleConfirm = async (pickedDate: Date) => {
    setDatePickerVisibility(false);
    setSelectedDate(pickedDate);

    // Convert picked date to local time before inserting
    const localDateTime = new Date(pickedDate.getTime() - pickedDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' '); // Format as "YYYY-MM-DD HH:MM:SS"

    console.log("Selected Local Time:", localDateTime);

    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .insert([
          {
            user_id: userId, // Save User ID if logged in
            service_name: selectedService?.name,
            date_time: localDateTime, // Store correctly formatted date-time
          },
        ]);

      if (error) throw error;

      Alert.alert('Success', `Service booked successfully for ${localDateTime}!`);
    } catch (err) {
      Alert.alert('Error', 'Failed to book service.');
      console.error("Booking Error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Service</Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.serviceItem, selectedService?.id === item.id && styles.selectedService]}
            onPress={() => setSelectedService(item)}
          >
            <Text style={styles.serviceName}>{item.name}</Text>
            <Text style={styles.serviceDesc}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Book Service Button */}
      <TouchableOpacity style={styles.bookButton} onPress={handleBookPress}>
        <Text style={styles.buttonText}>Book Service</Text>
      </TouchableOpacity>

      {/* DateTime Picker (Shows after pressing Book Service) */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />

      {/* FAQ Button */}
      <TouchableOpacity style={styles.faq} onPress={() => navigation.navigate('faq')}>
        <Text style={styles.buttonText}>FAQ</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  serviceItem: {
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
  },
  selectedService: {
    backgroundColor: '#cce5ff',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceDesc: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#007bff',
    alignItems: 'center',
    borderRadius: 5,
  },
  faq: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#007bff',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
