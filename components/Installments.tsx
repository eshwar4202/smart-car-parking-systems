import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // ✅ Correct Import

const Installments = () => {
  const [months, setMonths] = useState('3');

  return (
    <View>
      <Text>Select Installment Plan</Text>
      <Picker selectedValue={months} onValueChange={(itemValue) => setMonths(itemValue)}>
        <Picker.Item label="3 months" value="3" />
        <Picker.Item label="6 months" value="6" />
        <Picker.Item label="12 months" value="12" />
      </Picker>
      <Button title="Confirm Plan" onPress={() => alert(`Plan selected: ${months} months`)} />
    </View>
  );
};

export default Installments;

