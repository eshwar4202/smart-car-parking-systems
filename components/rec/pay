import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const Payment = ({ route, navigation }) => {
  // Get the parameters passed from the SmartParkingSystem
  const { slots, amount, pricePerSlot } = route.params;

  const handlePayment = () => {
    // Here you would integrate with a payment gateway
    // For now, we'll just simulate a successful payment
    Alert.alert(
      "Payment Successful",
      `You have successfully reserved ${slots.length} parking slot(s) for ₹${amount}.`,
      [
        {
          text: "OK",
          onPress: () => navigation.navigate('Account')  // Navigate back to main screen after payment
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Payment Summary</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Selected Slots:</Text>
          <Text style={styles.value}>{slots.join(', ')}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Price per Slot:</Text>
          <Text style={styles.value}>₹{pricePerSlot}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Number of Slots:</Text>
          <Text style={styles.value}>{slots.length}</Text>
        </View>

        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>₹{amount}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default Payment;
