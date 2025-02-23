import React, { useState } from 'react';
import { View, Text, Switch, Button } from 'react-native';
import { supabase } from '../lib/supabase';

const RecurringPayments = () => {
  const [enabled, setEnabled] = useState(false);

  const toggleSwitch = async () => {
    setEnabled(!enabled);
    const { error } = await supabase.from('user_preferences').upsert({ recurring_payments: !enabled });
    if (error) alert('Error updating preferences');
  };

  return (
    <View>
      <Text>Enable Recurring Payments</Text>
      <Switch value={enabled} onValueChange={toggleSwitch} />
      <Button title="Set Reminder Preferences" onPress={() => alert('Reminder preferences updated')} />
    </View>
  );
};

export default RecurringPayments;
