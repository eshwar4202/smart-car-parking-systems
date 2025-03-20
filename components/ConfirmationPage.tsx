import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert , Linking } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ConfirmationPage = () => {
    const route = useRoute();
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [balance, setBalance] = useState('0.00');
    const navigation = useNavigation();
    const { selectedSlot, selectedDate, startTime, endTime, estimatedCost,userId,selectedSlotName } = route.params || {};
      useEffect(() => {
        if (userId) {
          fetchWallet(userId);
        }
      }, [userId]);
       
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
          const upiUrl = `upi://pay?pa=${upiId}&pn=Business&mc=123456&tid=txn123456&tr=123456&tn=BookingPayment&am=${estimatedCost}&cu=INR`;
        
          Linking.openURL(upiUrl)
            .then(() => Alert.alert('Success', `Transaction of ₹${estimatedCost} initiated.`))
            .catch(() => Alert.alert('Error', 'Unable to process payment.'));
          
          return;
        }
         else if (paymentMethod === 'Credit/Debit Card') {
          navigation.navigate('CardPayment', { totalPrice: estimatedCost });}
        else if (paymentMethod === 'E-Wallet') {
          Alert.alert(
            'Confirm Payment',
            `Are you sure you want to deduct ${estimatedCost} from your e-wallet?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Confirm', onPress: handleEWalletPayment },
            ]
          );
        } else {
          Alert.alert('Success', `Payment of ${estimatedCost} scheduled for ${selectedDate} using ${paymentMethod}.`);
          navigation.goBack();
        }
      };
    
      const handleEWalletPayment = async () => {
        if (parseFloat(balance) >= parseFloat(estimatedCost)) {
          const newBalance = parseFloat(balance) - parseFloat(estimatedCost);
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
                  amount: estimatedCost,
                },
              ]);
            if (transactionError) throw transactionError;
            const { error: chargingError } = await supabase
                .from('ev_charging')
                .insert([
                    {
                        user_id: userId,
                        charging_slot_id: selectedSlot?.id,
                        charging_slot_name: selectedSlotName,
                        from_time: startTime,
                        to_time: endTime,
                        total_price: estimatedCost,
                        status: 'occupied',
                    },
                ]);

            if (chargingError) throw chargingError;

            // Update ev_charging_slots table to mark the slot as booked
            const { error: slotError } = await supabase
                .from('ev_charging_slots')
                .update({ status: "occupied" })
                .eq('id', selectedSlot?.id);

            if (slotError) throw slotError;
            Alert.alert('Payment Successful', `Successfully deducted ${estimatedCost} from your e-wallet.`);
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
           
            <View style={styles.infoBox}>
                <Text style={styles.label}>Charging Slot:</Text>
                <Text style={styles.value}>{selectedSlot?.charging_slot_name || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoBox}>
                <Text style={styles.label}>Type:</Text>
                <Text style={styles.value}>{selectedSlot?.slot_type || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoBox}>
                <Text style={styles.label}>Power Rating:</Text>
                <Text style={styles.value}>{selectedSlot?.power_rating ? `${selectedSlot.power_rating} kW` : 'N/A'}</Text>
            </View>
            
            <View style={styles.infoBox}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{selectedDate ? new Date(selectedDate).toDateString() : 'N/A'}</Text>
            </View>
            
            <View style={styles.infoBox}>
                <Text style={styles.label}>Start Time:</Text>
                <Text style={styles.value}>{startTime ? new Date(startTime).toLocaleTimeString() : 'N/A'}</Text>
            </View>
            
            <View style={styles.infoBox}>
                <Text style={styles.label}>End Time:</Text>
                <Text style={styles.value}>{endTime ? new Date(endTime).toLocaleTimeString() : 'N/A'}</Text>
            </View>
            
            <View style={styles.infoBox}>
                <Text style={styles.label}>Estimated Cost:</Text>
                <Text style={styles.value}>{estimatedCost ? `₹${estimatedCost}` : 'N/A'}</Text>
            </View>
            <View style={styles.infoBox}>
                <Text style={styles.label}>Wallet Balance:</Text>
                <Text style={styles.value}>{balance ? `₹${balance}` : 'N/A'}</Text>
            </View>
            <View>
            
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    infoBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        padding: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 16,
    },
    button: {
        marginTop: 20,
        backgroundColor: 'green',
        padding: 15,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    paymentMethodTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      paymentButton: {
        marginVertical: 6,
        padding: 10,
        paddingHorizontal: 85,
        backgroundColor: '#4C4C9D',
        alignItems: 'center',
        borderRadius: 5,
      },
      selectedButton: {
        backgroundColor: '#7878be',
      },
      confirmButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#28a745',
        alignItems: 'center',
        borderRadius: 5,
      },
});

export default ConfirmationPage;
