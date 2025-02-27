import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, ScrollView } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'
import * as Location from 'expo-location' // Add this import

// Start/stop session auto-refresh based on app state
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  // Function to get current location
  async function getCurrentLocation() {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required')
        return null
      }

      let location = await Location.getCurrentPositionAsync({})
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting location:', error)
      return null
    }
  }

  // Sign in existing user with location check
  async function signInWithEmail() {
    setLoading(true)
    try {
      const currentLocation = await getCurrentLocation()
      if (!currentLocation) {
        setLoading(false)
        return
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Get user's existing location from profiles table (assuming you have one)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('last_known_location')
        .eq('id', authData.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') throw profileError

      const existingLocation = profileData?.last_known_location

      // Update location in profiles table
      await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          last_known_location: currentLocation,
          updated_at: new Date().toISOString()
        })

      if (existingLocation) {
        // Compare locations (simple comparison - you might want something more sophisticated)
        const locationChanged =
          Math.abs(existingLocation.latitude - currentLocation.latitude) > 0.1 ||
          Math.abs(existingLocation.longitude - currentLocation.longitude) > 0.1

        if (locationChanged) {
          // Send email notification via Supabase edge function or your own API
          await supabase.functions.invoke('send-location-change-email', {
            body: {
              email,
              newLocation: currentLocation,
              oldLocation: existingLocation
            }
          })
          Alert.alert('Notice', 'We detected a login from a new location. Check your email.')
        }
      }

    } catch (err) {
      Alert.alert('Sign In Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  // Sign up new user with initial location
  async function signUpWithEmail() {
    setLoading(true)
    try {
      const currentLocation = await getCurrentLocation()
      if (!currentLocation) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim(),
            last_known_location: currentLocation
          }
        }
      })

      if (error) throw error

      if (!data.session) {
        Alert.alert('Check your email for verification!')
      }

      // Add initial location to profiles table
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          username: username.trim(),
          last_known_location: currentLocation,
          updated_at: new Date().toISOString()
        })

    } catch (err) {
      Alert.alert('Sign Up Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  // Rest of your component (JSX) remains the same...
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* ... existing JSX ... */}
      <View style={styles.container}>
        {/* Toggle Sign In / Sign Up */}
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

        {/* Show username input on Sign Up */}
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
        </View>
      </View>
    </ScrollView>
  )
}

// Styles remain the same...
//
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#F7F9FC'
  },
  container: {
    padding: 20,
    alignItems: 'center'
  },
  toggleContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between'
  },
  toggleButton: {
    flex: 1,
    marginHorizontal: 5
  },
  verticallySpaced: {
    paddingTop: 8,
    paddingBottom: 8,
    alignSelf: 'stretch'
  },
  mt20: {
    marginTop: 20
  },
  inputContainer: {
    backgroundColor: '#E8EAF6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 0
  },
  inputStyle: {
    color: '#333'
  },
  labelStyle: {
    color: '#4C4C9D',
    fontWeight: 'bold'
  },
  buttonStyle: {
    backgroundColor: '#4C4C9D',
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%'
  },
  buttonTitleStyle: {
    fontWeight: 'bold',
    fontSize: 16
  },
  inputSpacing: {
    marginTop: 10
  }
})
