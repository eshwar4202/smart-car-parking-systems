// Reset Password ResetPasswordScreen
import { supabase } from '../lib/supabase'; // Your Supabase client setup
import { useState } from 'react';
import { TextInput, Button, View, Text } from 'react-native';
export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');

  async function handleResetPassword() {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) alert('Error: ' + error.message);
    else alert('Password updated successfully!');
  }

  return (
    <View>
      <TextInput
        placeholder="Enter new password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <Button title="Update Password" onPress={handleResetPassword} />
    </View>
  );
}
