```
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Button, TextInput, FlatList, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { Card } from '@/components/ui/card';
import { ScrollView } from 'react-native-gesture-handler';

const RecurringPayments = () => {
  const [enabled, setEnabled] = useState(false);
  const [reminder, setReminder] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const toggleSwitch = async () => {
    setEnabled(!enabled);
    const { error } = await supabase.from('user_preferences').upsert({ recurring_payments: !enabled });
    if (error) Alert.alert('Error', 'Error updating preferences');
  };

  const toggleReminder = async () => {
    setReminder(!reminder);
    const { error } = await supabase.from('user_preferences').upsert({ reminders_enabled: !reminder });
    if (error) Alert.alert('Error', 'Error updating reminder preferences');
  };

  const updateAmount = async () => {
    const { error } = await supabase.from('user_preferences').upsert({ payment_amount: parseFloat(amount) });
    if (error) Alert.alert('Error', 'Error updating payment amount');
    else Alert.alert('Success', 'Payment amount updated');
  };

  const fetchPaymentHistory = async () => {
    const { data, error } = await supabase.from('payment_history').select('*');
    if (error) Alert.alert('Error', 'Error fetching payment history');
    else setPaymentHistory(data);
  };

  return (
    <ScrollView className="p-4">
      <Card className="mb-4 p-4">
        <Text className="text-xl font-bold mb-2">Recurring Payments</Text>
        <View className="flex-row items-center justify-between mb-4">
          <Text>Enable Recurring Payments</Text>
          <Switch value={enabled} onValueChange={toggleSwitch} />
        </View>
        <View className="flex-row items-center justify-between mb-4">
          <Text>Receive Reminders Before Payment</Text>
          <Switch value={reminder} onValueChange={toggleReminder} />
        </View>
        <Text className="mb-2">Payment Amount ($)</Text>
        <TextInput
          className="border p-2 rounded mb-4"
          keyboardType="numeric"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
        />
        <Button title="Save Amount" onPress={updateAmount} />
      </Card>

      <Card className="mb-4 p-4">
        <Text className="text-xl font-bold mb-2">Payment History</Text>
        <FlatList
          data={paymentHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="border-b py-2">
              <Text>Date: {item.date}</Text>
              <Text>Amount: ${item.amount}</Text>
              <Text>Status: {item.status}</Text>
            </View>
          )}
        />
      </Card>

      <Card className="p-4">
        <Text className="text-xl font-bold mb-2">Payment Summary</Text>
        <Text>Summary of your last session will be sent to your email after each session.</Text>
      </Card>
    </ScrollView>
  );
};

export default RecurringPayments;
```
