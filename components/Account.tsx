import React, { useEffect, useState } from 'react';
import {
  View,
  Alert,
  TouchableOpacity,
  Text,
  ImageBackground,
  Animated,
  PanResponder,
  StyleSheet,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Map from './Map';
import Book from './Book';

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const navigation = useNavigation();
  const slideAnim = useState(new Animated.Value(0))[0]; // For the slide-to-dashboard animation

  // Fetch profile whenever session changes
  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  // Fetch user profile from 'profiles' table
  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select('username, website, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username || '');
        setWebsite(data.website || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // Reset arrow position whenever page gains focus
  useFocusEffect(() => {
    slideAnim.setValue(0);
  });

  // PanResponder for the green 'Dashboard' arrow
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      let newX = Math.min(Math.max(0, gesture.dx), 250);
      slideAnim.setValue(newX);
    },
    onPanResponderRelease: () => {
      if (slideAnim._value >= 200) {
        navigation.navigate('Dashboard');
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // Sign out function
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Error', error.message);
    } else {
      console.log('Successfully signed out!');
      // The 'onAuthStateChange' in App.tsx will redirect to Auth screen automatically
    }
  }

  return (
    <View style={styles.app}>
      {/* MAP */}
      <TouchableOpacity style={styles.map} onPress={() => navigation.navigate('Map')}>
        <Map />
      </TouchableOpacity>

      {/* Booked */}
      <TouchableOpacity onPress={() => navigation.navigate('Book')}>
        <ImageBackground
          source={require('../assets/book.jpg')}
          resizeMode="cover"
          style={styles.booked}
        >
          <Text style={styles.buttonText}>Booked</Text>
        </ImageBackground>
      </TouchableOpacity>

      {/* Services */}
      <TouchableOpacity onPress={() => navigation.navigate('Service')}>
        <ImageBackground
          source={require('../assets/service.jpg')}
          resizeMode="cover"
          style={styles.service}
        >
          <Text style={styles.buttonText}>Services</Text>
        </ImageBackground>
      </TouchableOpacity>

      {/* Pay History */}
      <TouchableOpacity onPress={() => navigation.navigate('Pay_hist')}>
        <ImageBackground
          source={require('../assets/pay.jpg')}
          resizeMode="cover"
          style={styles.pay_history}
        >
          <Text style={styles.buttonText}>Pay History</Text>
        </ImageBackground>
      </TouchableOpacity>

      {/* Advance Pay */}
      <TouchableOpacity onPress={() => navigation.navigate('EWallet')}>
        <ImageBackground
          source={require('../assets/adv_pay.jpg')}
          resizeMode="cover"
          style={styles.adv_pay}
        >
          <Text style={styles.buttonText}>E-Wallet</Text>
        </ImageBackground>
      </TouchableOpacity>

      {/* Sliding Arrow Button - Dashboard Navigation */}
      <View style={styles.dashboardButton}>
        <Text style={styles.dashboardText}>Dashboard</Text>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.arrow, { transform: [{ translateX: slideAnim }] }]}
        >
          <Text style={styles.arrowText}>{'>'}</Text>
        </Animated.View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: 'white',
    flex: 1,
  },
  map: {
    top: 20,
    left: 10,
    width: 340,
    height: 200,
    borderRadius: 5,
    elevation: 10,
  },
  booked: {
    top: 35,
    left: 10,
    width: 180,
    height: 180,
    backgroundColor: 'blue',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  service: {
    top: -145,
    left: 180,
    width: 180,
    height: 180,
    backgroundColor: 'blue',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pay_history: {
    top: -110,
    left: 20,
    width: 130,
    height: 150,
    backgroundColor: 'blue',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adv_pay: {
    top: -260,
    left: 160,
    width: 200,
    height: 150,
    backgroundColor: 'purple',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    top: 80,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Dashboard
  dashboardButton: {
    top: -150,
    backgroundColor: 'green',
    width: 330,
    left: 14,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  arrow: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 10,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  // Sign Out Button
  signOutButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    backgroundColor: 'red',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 5,
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
