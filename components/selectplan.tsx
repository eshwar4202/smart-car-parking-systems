// SelectPlan.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const SelectPlan = ({ navigation }) => {
  const [days, setDays] = useState('');

  const handleNext = () => {
    const parsedDays = parseInt(days);

    if (!isNaN(parsedDays) && parsedDays > 0) {
      navigation.navigate('InstallmentsScreen', { days: parsedDays });
    } else {
      alert('Please enter a valid number of days!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Plan</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter number of days"
        keyboardType="numeric"
        value={days}
        onChangeText={setDays}
      />
      <Button title="Next" onPress={handleNext} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: 200,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
});

export default SelectPlan;
