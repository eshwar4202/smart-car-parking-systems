import React from 'react';
import { View, Text, Button } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const SplitBill = ({ amount }: { amount: number }) => {
  const qrValue = `https://payment-link.com/split?amount=${amount}`;

  return (
    <View>
      <Text>Split Bill</Text>
      <QRCode value={qrValue} size={150} />
      <Button title="Send Notifications" onPress={() => alert('Notifications sent')} />
    </View>
  );
};

export default SplitBill;