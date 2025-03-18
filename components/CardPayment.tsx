import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function CardPayment({ route, navigation }) {
  const { totalPrice } = route.params;
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const validateCard = () => {
    if (cardNumber.length !== 16 || isNaN(cardNumber)) {
      Alert.alert('Invalid Card Number', 'Card number must be 16 digits.');
      return;
    }
    if (cvv.length !== 3 || isNaN(cvv)) {
      Alert.alert('Invalid CVV', 'CVV must be 3 digits.');
      return;
    }

    Alert.alert('Success', `Transaction of ₹${totalPrice} completed.`, [
        { text: 'OK', onPress: () => navigation.navigate('Account') }
      ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Card Details</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Card Number" 
        value={cardNumber} 
        onChangeText={setCardNumber} 
        keyboardType="numeric" 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Expiry Date" 
        value={expiry} 
        onChangeText={setExpiry} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="CVV" 
        value={cvv} 
        onChangeText={setCvv} 
        keyboardType="numeric" 
        secureTextEntry 
      />
      <TouchableOpacity style={styles.payButton} onPress={validateCard}>
        <Text style={styles.buttonText}>Pay ₹{totalPrice}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  payButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});