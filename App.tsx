import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Account from './components/Account'
import Map from './components/Map'  // Import Map screen
import { View, StyleSheet } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; // Import Stack Navigator
import Visulization from './components/Visualization';
import install from './components/Installments';
import split from './components/SplitBill';
import recur from './components/RecurringPayments';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <NavigationContainer>
      {session && session.user ? (
        <Stack.Navigator>
          <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
          <Stack.Screen name="Map" component={Map} />
          <Stack.Screen name="visual" component={Visulization} />
          <Stack.Screen name="install" component={install} />
          <Stack.Screen name="split" component={split} />
          <Stack.Screen name="recur_pay" component={recur} />
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
});

