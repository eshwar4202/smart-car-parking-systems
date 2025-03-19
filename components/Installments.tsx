import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Get screen width
const { width } = Dimensions.get('window');

const InstallmentPlan = ({ route }) => {
  const navigation = useNavigation();
  const { totalAmount } = route.params;

  const [selectedPlan, setSelectedPlan] = useState(3); // Default to 3 installments

  const handleSelectPlan = (count) => {
    setSelectedPlan(count);
  };

  const handleConfirmPlan = () => {
    const installmentAmount = (totalAmount / selectedPlan).toFixed(2);
    navigation.navigate('InstallmentTracker', { totalAmount, installmentAmount, installmentCount: selectedPlan });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Installment Plan</Text>
      <Text style={styles.info}>Total Amount: ₹{totalAmount}</Text>

      <View style={styles.planContainer}>
        {[2, 3, 4].map((count) => (
          <TouchableOpacity
            key={count}
            style={[styles.planButton, selectedPlan === count && styles.selectedPlan]}
            onPress={() => handleSelectPlan(count)}
          >
            <Text style={styles.planText}>{count} Installments</Text>
            <Text style={styles.planAmount}>₹{(totalAmount / count).toFixed(2)} each</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPlan}>
        <Text style={styles.buttonText}>Confirm Plan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  info: { fontSize: 18, marginBottom: 10, textAlign: 'center' },

  // Make sure buttons fit within the screen width
  planContainer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginVertical: 20 },
  planButton: {
    width: width * 0.28, // Each button takes up about 28% of screen width
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginHorizontal: 5,
    marginVertical: 5,
    alignItems: 'center',
  },
  selectedPlan: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  planText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  planAmount: { fontSize: 14, color: '#555', textAlign: 'center' },

  confirmButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, marginTop: 20, width: width * 0.8 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});

export default InstallmentPlan;
