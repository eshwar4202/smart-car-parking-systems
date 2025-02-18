import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Account from './components/Account'
import { View, StyleSheet, Text } from 'react-native'
import { Session } from '@supabase/supabase-js'

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
    <View style = {styles.centered}>
      <Text style ={styles.header}>Login</Text>
      {session && session.user ? <Account key={session.user.id} session={session}/> : <Auth />}
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    top : 150,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 30,
    left: 20,
  }
});
