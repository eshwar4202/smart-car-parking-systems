// Auth.tsx
import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@rneui/themed';
import * as Location from 'expo-location';
import { NavigationProp } from '@react-navigation/native'; // Import NavigationProp for typing

// Define props interface
interface AuthProps {
  navigation: NavigationProp<any>; // Type for navigation prop
}

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth({ navigation }: AuthProps) { // Accept navigation as a prop
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  async function getCurrentLocation() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return null;
      }

      let location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  async function insertLoginDetails(userId: string, sessionId: string | null, location: any) {
    const loginDetails = {
      user_id: userId,
      session_id: sessionId,
      latitude: location.latitude,
      longitude: location.longitude,
      login_time: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('login_details')
      .insert(loginDetails);

    if (error) {
      console.error('Error inserting login details:', error);
    }
  }

  async function signInWithEmail() {
    setLoading(true);
    try {
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        setLoading(false);
        return;
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await insertLoginDetails(
        authData.user.id,
        authData.session?.access_token || null,
        currentLocation
      );

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('last_known_location')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      const existingLocation = profileData?.last_known_location;

      await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          last_known_location: currentLocation,
          updated_at: new Date().toISOString(),
        });

      if (existingLocation) {
        const locationChanged =
          Math.abs(existingLocation.latitude - currentLocation.latitude) > 0.1 ||
          Math.abs(existingLocation.longitude - currentLocation.longitude) > 0.1;

        if (locationChanged) {
          await supabase.functions.invoke('send-location-change-email', {
            body: {
              email,
              newLocation: currentLocation,
              oldLocation: existingLocation,
            },
          });
          Alert.alert('Notice', 'We detected a login from a new location. Check your email.');
        }
      }

      navigation.navigate('Account'); // Use the prop here
    } catch (err) {
      Alert.alert('Sign In Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithEmail() {
    setLoading(true);
    try {
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim(),
            last_known_location: currentLocation,
          },
        },
      });

      if (error) throw error;

      if (!data.session) {
        Alert.alert('Check your email for verification!');
      } else {
        await insertLoginDetails(
          data.user.id,
          data.session.access_token || null,
          currentLocation
        );

        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            username: username.trim(),
            last_known_location: currentLocation,
            updated_at: new Date().toISOString(),
          });
        navigation.navigate('Account'); // Use the prop here
      }
    } catch (err) {
      Alert.alert('Sign Up Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.toggleContainer}>
          <Button
            title="Sign In"
            type={isSignUp ? 'outline' : 'solid'}
            onPress={() => setIsSignUp(false)}
            containerStyle={styles.toggleButton}
          />
          <Button
            title="Sign Up"
            type={!isSignUp ? 'outline' : 'solid'}
            onPress={() => setIsSignUp(true)}
            containerStyle={styles.toggleButton}
          />
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Input
            label="Email"
            leftIcon={{ type: 'font-awesome', name: 'envelope', color: '#4C4C9D' }}
            onChangeText={setEmail}
            value={email}
            placeholder="email@address.com"
            autoCapitalize="none"
            inputStyle={styles.inputStyle}
            inputContainerStyle={styles.inputContainer}
            labelStyle={styles.labelStyle}
          />
        </View>
        <View style={[styles.verticallySpaced, styles.inputSpacing]}>
          <Input
            label="Password"
            leftIcon={{ type: 'font-awesome', name: 'lock', color: '#4C4C9D' }}
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize="none"
            inputStyle={styles.inputStyle}
            inputContainerStyle={styles.inputContainer}
            labelStyle={styles.labelStyle}
          />
        </View>

        {isSignUp && (
          <View style={[styles.verticallySpaced, styles.inputSpacing]}>
            <Input
              label="Username"
              leftIcon={{ type: 'font-awesome', name: 'user', color: '#4C4C9D' }}
              onChangeText={setUsername}
              value={username}
              placeholder="Your username"
              autoCapitalize="none"
              inputStyle={styles.inputStyle}
              inputContainerStyle={styles.inputContainer}
              labelStyle={styles.labelStyle}
            />
          </View>
        )}

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title={isSignUp ? 'Sign Up' : 'Sign In'}
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.buttonTitleStyle}
            disabled={loading}
            onPress={() => (isSignUp ? signUpWithEmail() : signInWithEmail())}
          />
          <Button
            title="Reset Passwd"
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={() => navigation.navigate('reset')} // Use the prop here
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#F7F9FC',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  toggleButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  verticallySpaced: {
    paddingTop: 8,
    paddingBottom: 8,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  inputContainer: {
    backgroundColor: '#E8EAF6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 0,
  },
  inputStyle: {
    color: '#333',
  },
  labelStyle: {
    color: '#4C4C9D',
    fontWeight: 'bold',
  },
  buttonStyle: {
    backgroundColor: '#4C4C9D',
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%',
  },
  buttonTitleStyle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputSpacing: {
    marginTop: 10,
  },
});
