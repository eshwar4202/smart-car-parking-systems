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
  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

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

  useFocusEffect(() => {
    slideAnim.setValue(0);
  });

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

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Error', error.message);
    } else {
      console.log('Successfully signed out!');
      navigation.navigate('Auth');
    }
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Parking System</Text>
      </View>

      {/* Map Section */}
      <TouchableOpacity
        style={styles.mapContainer}
        onPress={() => navigation.navigate('Map')}
      >
        <Map />
      </TouchableOpacity>

      {/* Main Buttons Grid */}
      <View style={styles.gridContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Book')}
          style={styles.gridItem}
        >
          <ImageBackground
            source={require('../assets/book.jpg')}
            resizeMode="cover"
            style={styles.gridImage}
          >
            <View style={styles.gridOverlay}>
              <Text style={styles.gridText}>Booked Slots</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Service')}
          style={styles.gridItem}
        >
          <ImageBackground
            source={require('../assets/service.jpg')}
            resizeMode="cover"
            style={styles.gridImage}
          >
            <View style={styles.gridOverlay}>
              <Text style={styles.gridText}>Services</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Pay_hist')}
          style={styles.gridItem}
        >
          <ImageBackground
            source={require('../assets/pay.jpg')}
            resizeMode="cover"
            style={styles.gridImage}
          >
            <View style={styles.gridOverlay}>
              <Text style={styles.gridText}>Pay History</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('EWallet')}
          style={styles.gridItem}
        >
          <ImageBackground
            source={require('../assets/adv_pay.jpg')}
            resizeMode="cover"
            style={styles.gridImage}
          >
            <View style={styles.gridOverlay}>
              <Text style={styles.gridText}>E-Wallet</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>

      {/* Dashboard Slider */}
      <View style={styles.sliderContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.sliderHandle,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <Text style={styles.sliderArrow}>→</Text>
        </Animated.View>
        <Text style={styles.sliderText}>Slide to Dashboard</Text>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 15,
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 4,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 6,
    backgroundColor: '#fff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    height: 120,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  gridImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  sliderContainer: {
    backgroundColor: '#3498db',
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 4,
    overflow: 'hidden',
  },
  sliderHandle: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  sliderArrow: {
    fontSize: 24,
    color: '#3498db',
    fontWeight: 'bold',
  },
  sliderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 20,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    elevation: 4,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
