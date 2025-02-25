import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StyleSheet, View, Alert, TouchableOpacity, Text, ImageBackground } from 'react-native';
import { Session } from '@supabase/supabase-js';
import Map from './Map';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook
import Usrav from './Usrav';
import Book from './Book';

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

  const book = require('../assets/book.jpg');
  const pay = require('../assets/pay.jpg');
  const service = require('../assets/service.jpg');
  const adv_pay = require('../assets/adv_pay.jpg');
  return (
    <View>
      <TouchableOpacity style={styles.map} onPress={() => navigation.navigate('Map')}>
        <Map />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Book')}>
        <ImageBackground source={book} resizeMode="cover" style={styles.booked}>
          <Text style={styles.buttonText}>Booked</Text>
        </ImageBackground>

      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Service')}>
        <ImageBackground source={service} resizeMode="cover" style={styles.service}>
          <Text style={styles.buttonText}>Services</Text>
        </ImageBackground>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('install')}>
        <ImageBackground source={pay} resizeMode="cover" style={styles.pay_history}>
          <Text style={styles.buttonText}>Pay History</Text>
        </ImageBackground>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('service')}>
        <ImageBackground source={adv_pay} resizeMode="cover" style={styles.adv_pay}>
          <Text style={styles.buttonText}>Advance Pay</Text>
        </ImageBackground>
      </TouchableOpacity>

      <TouchableOpacity style={styles.user} onPress={() => navigation.navigate('split')}>
        <Usrav />
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
    top: 35,
    left: 10,
    width: 130,
    height: 150,
    backgroundColor: 'blue',
    //borderWidth: 3,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  service: {
    top: -115,
    left: 150,
    width: 200,
    height: 150,
    backgroundColor: 'blue',
    borderRadius: 5,
    //borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pay_history: {
    top: -110,
    left: 10,
    width: 130,
    height: 150,
    backgroundColor: 'blue',
    //borderWidth: 3,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adv_pay: {
    top: -260,
    left: 150,
    width: 200,
    height: 150,
    backgroundColor: 'purple',
    //borderWidth: 3,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    top: 70,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  user: {
    top: -120,
    backgroundColor: 'blue',
    width: 330,
    left: 14,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

