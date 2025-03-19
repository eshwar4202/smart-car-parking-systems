import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const InstallmentTracker = ({ route }) => {
  const navigation = useNavigation();
  const { totalAmount, installmentAmount, installmentCount } = route.params;
  const [paidInstallments, setPaidInstallments] = useState(0);

  const handlePayInstallment = () => {
    if (paidInstallments < installmentCount - 1) {
      setPaidInstallments(paidInstallments + 1);
      Alert.alert('Payment Successful', `Installment ${paidInstallments + 1} paid successfully!`);
    } else if (paidInstallments === installmentCount - 1) {
      setPaidInstallments(paidInstallments + 1);
      Alert.alert('🎉 Payment Completed!', 'Congratulations! All installments are completed.');
    }
  };

  // Ensure amounts round up to the next whole number
  const remainingAmount = Math.ceil(totalAmount - paidInstallments * installmentAmount);
  const isCompleted = paidInstallments === installmentCount;

  const handleGoHome = () => {
    navigation.navigate('Account'); // Navigate back to Account page
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Installment Tracker</Text>
      <Text style={styles.info}>Total Amount: ₹{Math.ceil(totalAmount)}</Text>
      <Text style={styles.info}>Installment Plan: {installmentCount} payments of ₹{Math.ceil(installmentAmount)} each</Text>

      <Text style={styles.status}>
        {isCompleted
          ? '✅ All Installments Completed!'
          : `💸 Installments Paid: ${paidInstallments}/${installmentCount}`}
      </Text>

      <Text style={styles.remaining}>Remaining Amount: ₹{remainingAmount}</Text>

      {!isCompleted && (
        <TouchableOpacity style={styles.payButton} onPress={handlePayInstallment}>
          <Text style={styles.buttonText}>Pay Next Installment</Text>
        </TouchableOpacity>
      )}

      {isCompleted && (
        <>
          <Text style={styles.completedText}>🎉 Congratulations! Payment Completed 🎉</Text>
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Text style={styles.buttonText}>🏠 Back to home</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  info: { fontSize: 18, marginBottom: 10 },
  status: { fontSize: 18, marginVertical: 10, color: '#4CAF50', fontWeight: 'bold' },
  remaining: { fontSize: 18, marginVertical: 10, color: '#FF5733', fontWeight: 'bold' },

  payButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, marginTop: 20 },
  homeButton: { backgroundColor: '#FF5733', padding: 15, borderRadius: 10, marginTop: 10 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  completedText: { fontSize: 20, color: '#4CAF50', fontWeight: 'bold', marginTop: 20 },
});

export default InstallmentTracker;
