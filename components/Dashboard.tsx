import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { createClient } from '@supabase/supabase-js'
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native'

const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw'
const supabase = createClient(supabaseUrl, supabaseKey)

type DashboardRouteProp = RouteProp<
  { Dashboard: { session: any } },
  'Dashboard'
>

export default function Dashboard() {
  const route = useRoute<DashboardRouteProp>()
  const navigation = useNavigation()
  const session = route.params?.session

  const [userProfile, setUserProfile] = useState({
    full_name: '',
    username: '',
    email: '',
    last_login: '',
  })
  const [preferredParkingLocations, setPreferredParkingLocations] = useState<string[]>([])

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(session.user.id)
      fetchParkingSlots(session.user.id)
    }
  }, [session])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, email, last_login')
        .eq('id', userId)
        .single()
      if (error) throw error
      if (!data) return

      setUserProfile({
        full_name: data.full_name || '',
        username: data.username || '',
        email: data.email || '',
        last_login: data.last_login || '',
      })
    } catch (err) {
      console.error('Profile fetch error:', err)
    }
  }

  const fetchParkingSlots = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('parking_slots')
        .select('deck')
        .eq('uid', userId)
      if (error) throw error

      const decks = data.map((slot: any) => slot.deck)
      setPreferredParkingLocations(decks)
    } catch (err) {
      console.error('Parking fetch error:', err)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Profile</Text>
        <Text style={styles.text}>Username: {userProfile.username}</Text>
        <Text style={styles.text}>Email: {userProfile.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last Login</Text>
        <Text style={styles.text}>
          {userProfile.last_login
            ? new Date(userProfile.last_login).toLocaleString()
            : 'N/A'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Parking Locations</Text>
        <FlatList
          data={preferredParkingLocations}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Text style={styles.text}>{item}</Text>}
        />
      </View>

      {/* Styled Button to Navigate to Login History */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('LoginHistory', { session })}
      >
        <Text style={styles.buttonText}>View Login History</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  section: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, color: 'black', marginBottom: 5 },
  historyButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
