import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert , Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PaymentService() {
  const route = useRoute();
  const navigation = useNavigation();
  const { service, date, session } = route.params;
  
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [servicePrice, setServicePrice] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      fetchWallet(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (service?.id) {
      fetchServicePrice(service.id);
    }
  }, [service]);

  async function fetchWallet(userId) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setBalance(data?.balance?.toString() || '0.00');
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
  }

  async function fetchServicePrice(serviceId) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('price')
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      setServicePrice(data?.price);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch service price');
      console.error(err);
    }
  }

  const handlePaymentConfirmation = () => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method.');
      return;
    }
    if (paymentMethod === 'UPI') {
      const upiId = 'q653401402@ybl'; 
      const upiUrl = `upi://pay?pa=${upiId}&pn=Business&mc=123456&tid=txn123456&tr=123456&tn=BookingPayment&am=${servicePrice}&cu=INR`;
    
      Linking.openURL(upiUrl)
        .then(() => Alert.alert('Success', `Transaction of ₹${servicePrice} initiated.`))
        .catch(() => Alert.alert('Error', 'Unable to process payment.'));
      
      return;
    }
     else if (paymentMethod === 'Credit/Debit Card') {
      navigation.navigate('CardPayment', { totalPrice: servicePrice });}
    else if (paymentMethod === 'E-Wallet') {
      Alert.alert(
        'Confirm Payment',
        `Are you sure you want to deduct ${servicePrice} from your e-wallet?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: handleEWalletPayment },
        ]
      );
    } else {
      Alert.alert('Success', `Payment of ${servicePrice} scheduled for ${date} using ${paymentMethod}.`);
      navigation.goBack();
    }
  };

  const handleEWalletPayment = async () => {
    if (parseFloat(balance) >= parseFloat(servicePrice)) {
      const newBalance = parseFloat(balance) - parseFloat(servicePrice);
      try {
        const { error: balanceError } = await supabase
          .from('wallets')
          .update({ balance: newBalance })
          .eq('user_id', userId);
  
        if (balanceError) throw balanceError;
  
        // Insert transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: userId,
              transaction_type: 'SERVICE FEE',
              amount: servicePrice,
            },
          ]);
  
        if (transactionError) throw transactionError;
  
        Alert.alert('Payment Successful', `Successfully deducted ${servicePrice} from your e-wallet.`);
        navigation.goBack();
      } catch (err) {
        Alert.alert('Error', 'An error occurred while processing the payment.');
        console.error('Payment error:', err);
      }
    } else {
      Alert.alert('Insufficient Balance', `Your balance of ${balance} is insufficient.`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment for {service?.name}</Text>
      <Text style={styles.subtitle}>Date: {date}</Text>
      <Text style={styles.subtitle}>Price: {servicePrice || 'Loading...'}</Text>
      <Text style={styles.subtitle}>Wallet Balance: {balance}</Text>

      <Text style={styles.paymentMethodTitle}>Select Payment Method</Text>
      {['UPI', 'Credit/Debit Card', 'E-Wallet'].map((method) => (
        <TouchableOpacity 
          key={method} 
          style={[styles.paymentButton, paymentMethod === method && styles.selectedButton]} 
          onPress={() => setPaymentMethod(method)}
        >
          <Text style={styles.buttonText}>{method}</Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity style={styles.confirmButton} onPress={handlePaymentConfirmation}>
        <Text style={styles.buttonText}>Confirm Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

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
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  paymentMethodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paymentButton: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#4C4C9D',
    alignItems: 'center',
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#7878be',
  },
  confirmButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#28a745',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
