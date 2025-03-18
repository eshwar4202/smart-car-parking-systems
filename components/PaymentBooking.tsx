import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert , Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BookingPaymentService() {
  const route = useRoute();
  const navigation = useNavigation();
  const { slotCount,totalPrice,session,fromTime,toTime } = route.params;
  const fromFormatted = new Date(fromTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  const toFormatted = new Date(toTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [balance, setBalance] = useState('0.00');

  const userId = session?.user?.id;

  useEffect(() => {
    console.log("Slot Count:", slotCount);
    console.log(route.params);
    if (userId) {
      fetchWallet(userId);
    }
  }, [userId, route.params]);

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

  const handlePaymentConfirmation = () => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method.');
      return;
    }
    if (paymentMethod === 'UPI') {
      const upiId = 'q653401402@ybl'; 
      const upiUrl = `upi://pay?pa=${upiId}&pn=Business&mc=123456&tid=txn123456&tr=123456&tn=BookingPayment&am=${totalPrice}&cu=INR`;
    
      Linking.openURL(upiUrl)
        .then(() => Alert.alert('Success', `Transaction of ₹${totalPrice} initiated.`))
        .catch(() => Alert.alert('Error', 'Unable to process payment.'));
      
      return;
    }
     else if (paymentMethod === 'Credit/Debit Card') {
      navigation.navigate('CardPayment', { totalPrice });}
    else if (paymentMethod === 'E-Wallet') {

      Alert.alert(
        'Confirm Payment',
        `Are you sure you want to deduct ₹${totalPrice} from your e-wallet?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: handleEWalletPayment },
        ]
      );
    } else {
      Alert.alert('Success', `Payment of ₹${totalPrice} scheduled for ${fromFormatted} to ${toFormatted} using ${paymentMethod}.`);
      navigation.goBack();
    }
  };

  const handleEWalletPayment = async () => {
    if (parseFloat(balance) >= totalPrice) {
      const newBalance = parseFloat(balance) - totalPrice;
      try {
        // Deduct balance
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
              transaction_type: 'BOOKING FEE',
              amount: totalPrice,
            },
          ]);

        if (transactionError) throw transactionError;

        // Insert booking record
        const { error: bookingError } = await supabase
          .from('bookings')
          .insert([
            {
              user_id: userId,
              start_date: fromTime,
              end_date: toTime,
              slot_count: slotCount,
              total_price: totalPrice,
              status: 'Confirmed',
            },
          ]);

        if (bookingError) throw bookingError;

        Alert.alert('Booking Confirmed', `Your booking for ${slotCount} slots on ${fromFormatted} to ${toFormatted} is confirmed.`);
        navigation.navigate('Account');
      } catch (err) {
        Alert.alert('Error', 'An error occurred while processing the booking.');
        console.error('Booking error:', err);
      }
    } else {
      Alert.alert('Insufficient Balance', `Your balance of ₹${balance} is insufficient.`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment for Booking</Text>
      <Text style={styles.subtitle}>
        Date: {fromFormatted} to {toFormatted}
      </Text>
      <Text style={styles.subtitle}>Slots: {slotCount}</Text>
      <Text style={styles.subtitle}>Total Price: ₹{totalPrice}</Text>
      <Text style={styles.subtitle}>Wallet Balance: ₹{balance}</Text>

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
    backgroundColor: '#007bff',
    alignItems: 'center',
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#0056b3',
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
