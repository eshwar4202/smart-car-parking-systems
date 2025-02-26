import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

// Supabase Client Setup
const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseKey);

const PaymentHistory = ({ route, navigation }) => {
  const { session } = route.params;
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation values
  const scale = useSharedValue(1);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    if (!session || !session.user || !session.user.id) {
      Alert.alert('Error', 'Authentication session is missing. Please log in again.');
      navigation.goBack();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('id, user_id, date, amount, status, lot')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setPaymentHistory(data);
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Error', 'Failed to load payment history.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Success':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#4CAF50" />
            <Path d="M10 14.5L16 8.5L14.5 7L10 11.5L8 9.5L6.5 11L10 14.5Z" fill="white" />
          </Svg>
        );
      case 'Failed':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#F44336" />
            <Path d="M15 9L9 15M9 9L15 15" stroke="white" strokeWidth="2" />
          </Svg>
        );
      case 'Pending':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#FF9800" />
            <Path d="M12 6V12H18" stroke="white" strokeWidth="2" />
          </Svg>
        );
      default:
        return null;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const handlePressIn = () => { scale.value = 0.95; };
  const handlePressOut = () => { scale.value = 1; };

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.card, animatedStyle]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>{getStatusIcon(item.status)}</View>
          <View style={styles.details}>
            <Text style={styles.amount}>₹{item.amount}</Text>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={styles.status}>{item.status}</Text>
            <Text >lot:{item.lot}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment History</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : paymentHistory.length === 0 ? (
        <Text style={styles.emptyText}>No payment history found.</Text>
      ) : (
        <FlatList
          data={paymentHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796B',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconContainer: {
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796B',
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
  status: {
    fontSize: 16,
    color: '#0288D1',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentHistory;
