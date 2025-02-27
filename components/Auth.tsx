// components/Auth.tsx
import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, ScrollView } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'

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
  const [isSignUp, setIsSignUp] = useState(false) // Toggle between Sign In / Sign Up

  // Sign in existing user
  async function signInWithEmail() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) Alert.alert(error.message)
    } catch (err) {
      Alert.alert('Sign In Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  // Sign up new user, pass username in user_metadata
  async function signUpWithEmail() {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim()
          }
        }
      })
      if (error) {
        Alert.alert(error.message)
      } else if (!data.session) {
        // Usually, the user must confirm via email
        Alert.alert('Check your email for verification!')
      }
    } catch (err) {
      Alert.alert('Sign Up Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
