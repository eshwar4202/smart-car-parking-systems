// App.tsx

import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'

// Screens
import Auth from './components/Auth'
import Account from './components/Account'
import Map from './components/Map'
import Visualization from './components/Visualization'
import Book from './components/Book'
import Service from './components/Service'
import Payment from './components/Payment'
import FAQ from './components/Faq'
import PayHist from './components/Pay_hist'
import Dashboard from './components/Dashboard'
import EWallet from './components/EWallet'

const Stack = createStackNavigator()

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // 1. Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        upsertProfile(session.user)
      }
    })

    // 2. Listen for auth changes
    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        if (newSession?.user) {
          upsertProfile(newSession.user)
        }
      }
    )

    // 3. Cleanup
    return () => {
      authSubscription?.subscription.unsubscribe()
    }
  }, [])

  // Upsert to 'profiles' table
  async function upsertProfile(user: User) {
    try {
      // user_metadata should contain the username if provided during sign-up
      const username = user.user_metadata?.username ?? null

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,                      // PK in 'profiles'
          email: user.email,
          username,
          last_login: user.last_sign_in_at, // Record last login
        })

      if (error) {
        console.error('Upsert profile error:', error)
      } else {
        console.log('Profile upserted successfully.')
      }
    } catch (err) {
      console.error('Upsert profile exception:', err)
    }
  }

  return (
    <NavigationContainer>
      {session && session.user ? (
        <Stack.Navigator>
          {/* Home screen: Account */}
          <Stack.Screen
            name="Account"
            component={Account}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Map" component={Map} />
          <Stack.Screen
            name="Visualization"
            component={Visualization}
            initialParams={{ session }}
          />
          <Stack.Screen
            name="Book"
            component={Book}
            initialParams={{ session }}
          />
          <Stack.Screen name="Service" component={Service} 
          initialParams={{ session }}/>
          <Stack.Screen name="Payment" component={Payment} />
          <Stack.Screen name="faq" component={FAQ} />
          <Stack.Screen
            name="Pay_hist"
            component={PayHist}
            initialParams={{ session }}
          />
          <Stack.Screen
            name="Dashboard"
            component={Dashboard}
            initialParams={{ session }}
          />
          <Stack.Screen
            name="EWallet"
            component={EWallet}
            initialParams={{ session }}
          />
        </Stack.Navigator>
      ) : (
        <Auth />
      )}
    </NavigationContainer>
  )
}
