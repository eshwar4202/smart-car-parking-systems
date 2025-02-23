import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StyleSheet, View, Alert, TouchableOpacity, Text } from 'react-native';
import { Session } from '@supabase/supabase-js';
import Map from './Map';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import install from './Installments';
import split from './SplitBill';
import recur from './RecurringPayments';

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const navigation = useNavigation(); // Hook for navigation

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <TouchableOpacity style={styles.map} onPress={() => navigation.navigate('Map')}>
        <Map />
      </TouchableOpacity>

      <TouchableOpacity style={styles.booked} onPress={() => navigation.navigate('visual')}>
        <Text style={styles.buttonText}>Booked</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.service} onPress={() => navigation.navigate('install')}>
        <Text style={styles.buttonText}>Service</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.pay_history} onPress={() => navigation.navigate('recur_pay')}>
        <Text style={styles.buttonText}>Pay History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.adv_pay} onPress={() => navigation.navigate('split')}>
        <Text style={styles.buttonText}>Advance Pay</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    top: 20,
    left: 10,
    width: 340,
    height: 200,
    borderWidth: 3,
    borderRadius: 5,
    elevation: 10,
  },
  booked: {
    top: 25,
    left: 10,
    width: 130,
    height: 150,
    backgroundColor: 'blue',
    borderWidth: 3,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  service: {
    top: -125,
    left: 150,
    width: 200,
    height: 150,
    backgroundColor: 'blue',
    borderRadius: 5,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pay_history: {
    top: -120,
    left: 10,
    width: 130,
    height: 150,
    backgroundColor: 'blue',
    borderWidth: 3,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adv_pay: {
    top: -270,
    left: 150,
    width: 200,
    height: 150,
    backgroundColor: 'purple',
    borderWidth: 3,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

