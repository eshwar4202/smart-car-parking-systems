import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const InstallmentTracker = ({ route }) => {
  const { selectedPlan } = route.params;

  // 🔹 State to track payment status of each installment
  const [installments, setInstallments] = useState([
    { id: 1, status: 'Unpaid' },
    { id: 2, status: 'Unpaid' },
    { id: 3, status: 'Unpaid' },
  ]);

  // 🔹 Handle payment action
  const handlePayment = (id) => {
    Alert.alert(
      'Payment Confirmation',
      `Proceed to pay for Installment ${id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => {
            const updatedInstallments = installments.map((installment) =>
              installment.id === id ? { ...installment, status: 'Paid' } : installment
            );
            setInstallments(updatedInstallments);
            Alert.alert('✅ Payment Successful', `Installment ${id} is now marked as Paid.`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Installment Tracker</Text>
      <Text style={styles.text}>Selected Plan: {selectedPlan} days</Text>

      {/* 🔹 Render 3 installments */}
      {installments.map((installment) => (
        <View key={installment.id} style={styles.installmentCard}>
          <Text style={styles.installmentText}>
            Installment {installment.id}: {installment.status}
          </Text>

          {installment.status === 'Unpaid' && (
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => handlePayment(installment.id)}
            >
              <Text style={styles.buttonText}>Proceed to Payment</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f4f4', padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  text: { fontSize: 18, marginBottom: 20, color: '#555' },

  installmentCard: { 
    width: '90%', 
    padding: 15, 
    marginBottom: 10, 
    borderRadius: 10, 
    backgroundColor: '#fff', 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3, 
    alignItems: 'center' 
  },

  installmentText: { fontSize: 18, color: '#444', marginBottom: 10 },
  payButton: { backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default InstallmentTracker;
