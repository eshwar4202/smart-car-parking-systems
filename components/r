import { supabase } from '../lib/supabase'; // Your Supabase client setup
import { useState } from 'react';
import { TextInput, Button, View, Text } from 'react-native';

// Forgot Password Screen
export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  async function handleForgotPassword() {
    // For testing: Simulate user lookup (in production, this would involve email)
    const { data: user, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'pavethran', // Temporary workaround, not secure
    });

    if (error) {
      alert('Error: ' + error.message);
      return;
    }

    // Navigate to reset password screen if user exists
    navigation.navigate('ResetPassword');
  }

  return (
    <View>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Reset Password" onPress={handleForgotPassword} />
    </View>
  );
}


