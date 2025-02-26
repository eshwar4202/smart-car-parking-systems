import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { createClient } from '@supabase/supabase-js';
import { useNavigation } from '@react-navigation/native';

// Supabase Configuration
const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseKey);

// List of Services
const services = [
  { id: 1, name: 'Car Wash', description: 'Complete exterior and interior car wash.' },
  { id: 2, name: 'Oil Change', description: 'Quick oil change service with quality oil.' },
  { id: 3, name: 'Tire Alignment', description: 'Ensure your tires are properly aligned for safety.' },
  { id: 4, name: 'Brake Repair', description: 'Professional brake repair and maintenance service.' },
];

const ServiceBooking = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const navigation = useNavigation();

  // Function to book a service
  const bookService = async () => {
    if (!selectedService) {
      Alert.alert('Error', 'Please select a service.');
      return;
    }

    try {
      const { data, error } = await supabase.from('service_bookings').insert([
        {
          service_name: selectedService.name,
          date_time: date.toISOString(),
        },
      ]);

      if (error) throw error;
      Alert.alert('Success', 'Service booked successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to book service.');
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate) => {
    hideDatePicker();
    if (selectedDate) setDate(selectedDate);
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

      <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
        <Text>Select Date & Time</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        date={date}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      <TouchableOpacity style={styles.bookButton} onPress={bookService}>
        <Text style={styles.buttonText}>Book Service</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.faq} onPress={() => navigation.navigate('faq')}>
        <Text style={styles.buttonText}>FAQ</Text>
      </TouchableOpacity>
    </View >
  );
};

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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
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
  dateButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#ddd',
    alignItems: 'center',
    borderRadius: 5,
  },
  bookButton: {
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

  faq: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#007bff',
    alignItems: 'center',
    borderRadius: 5,
  },

});

export default ServiceBooking;
