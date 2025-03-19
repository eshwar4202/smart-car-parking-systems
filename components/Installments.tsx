import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const InstallmentPlanScreen = () => {
  const [months, setMonths] = useState('15');

  return (
    <View style={styles.container}>
      {/* Header Text */}
      <Text style={styles.heading}>Select Your Installment Plan</Text>

      {/* Picker Dropdown */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={months}
          onValueChange={(itemValue) => setMonths(itemValue)}
          style={styles.picker}
          dropdownIconColor="#4CAF50"
        >
          <Picker.Item label="2 Weeks" value="15" />
          <Picker.Item label="4 Weeks" value="30" />
          <Picker.Item label="8 Weeks" value="60" />
        </Picker>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => alert(`✅ Plan selected: ${months} days`)}
      >
        <Text style={styles.buttonText}>Confirm Plan</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    padding: 20,
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },

  pickerContainer: {
    width: '80%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 20,
    elevation: 2,
  },

  picker: {
    height: 50,
    width: '100%',
    color: '#444',
  },

  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default InstallmentPlanScreen;
