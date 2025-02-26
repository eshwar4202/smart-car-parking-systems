import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Account from './components/Account'
import Map from './components/Map'  // Import Map screen
import { View, StyleSheet } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack' // Import Stack Navigator
import Visulization from './components/Visualization'
import Payment from './components/Payment'
import Service from './components/Service'
import Book from './components/Book'
import FAQ from './components/Faq'
import Pay_hist from './components/Pay_hist.tsx'

const Stack = createStackNavigator()

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Fetch initial session when the app loads
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log(session.user.id);
      setSession(session)
    }

    getSession()

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Clean up listener on unmount

  }, [])

  return (
    <NavigationContainer>
      {session && session.user ? (
        <Stack.Navigator>
          <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
          <Stack.Screen name="Map" component={Map} />
          <Stack.Screen name="visual" component={Visulization} initialParams={{ session }} />
          <Stack.Screen name="Book" component={Book} initialParams={{ session }} />
          <Stack.Screen name="Service" component={Service} />
          <Stack.Screen name="Payment" component={Payment} />
          <Stack.Screen name='faq' component={FAQ} />
          <Stack.Screen name='Pay_hist' component={Pay_hist} initialParams={{ session }} />
          {/* Add other screens here */}
        </Stack.Navigator>
      ) : (
        <Auth />
      )}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    top: 150,
  },
})
