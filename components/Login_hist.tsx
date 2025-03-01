import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { RouteProp, useRoute } from '@react-navigation/native';

const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseKey);

type LoginHistoryRouteProp = RouteProp<
  { LoginHistory: { session: any } },
  'LoginHistory'
>;

type LoginEntry = {
  id: string;
  login_time: string;
  latitude: number | null;
  longitude: number | null;
  session_id: string | null;
};

export default function LoginHistory() {
  const route = useRoute<LoginHistoryRouteProp>();
  const session = route.params?.session;

  const [loginHistory, setLoginHistory] = useState<LoginEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<LoginEntry[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      fetchLoginHistory(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    applyFilters();
  }, [loginHistory, dateFilter, timeFilter, locationFilter]);

  const fetchLoginHistory = async (userId: string) => {
    console.log('Fetching login history for userId:', userId);
    try {
      const { data, error } = await supabase
        .from('login_details')
        .select('id, login_time, latitude, longitude, session_id')
        .eq('user_id', userId)
        .order('login_time', { ascending: false });
      if (error) throw error;
      console.log('Fetched data:', data);
      setLoginHistory(data || []);
      setFilteredHistory(data || []);
    } catch (err) {
      console.error('Login history fetch error:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...loginHistory];

    // Filter by date (e.g., "2025-03-01")
    if (dateFilter) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.login_time).toISOString().split('T')[0];
        return entryDate.includes(dateFilter);
      });
    }

    // Filter by time (e.g., "06:55")
    if (timeFilter) {
      filtered = filtered.filter((entry) => {
        const entryTime = new Date(entry.login_time).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        });
        return entryTime.includes(timeFilter);
      });
    }

    // Filter by location (e.g., "lat,lon" or partial match)
    if (locationFilter) {
      filtered = filtered.filter((entry) => {
        if (!entry.latitude || !entry.longitude) return false;
        const entryLocation = `${entry.latitude.toFixed(4)}, ${entry.longitude.toFixed(4)}`;
        return entryLocation.includes(locationFilter);
      });
    }

    setFilteredHistory(filtered);
  };

  const renderLoginItem = ({ item }: { item: LoginEntry }) => (
    <View style={styles.loginItem}>
      <Text style={styles.loginText}>
        <Text style={styles.bold}>Date & Time:</Text>{' '}
        {new Date(item.login_time).toLocaleString()}
      </Text>
      <Text style={styles.loginText}>
        <Text style={styles.bold}>Location:</Text>{' '}
        {item.latitude && item.longitude
          ? `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`
          : 'Not available'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login History</Text>

      {/* Filter Inputs */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.input}
          placeholder="Filter by date (e.g., 2025-03-01)"
          value={dateFilter}
          onChangeText={setDateFilter}
        />
        <TextInput
          style={styles.input}
          placeholder="Filter by time (e.g., 06:55)"
          value={timeFilter}
          onChangeText={setTimeFilter}
        />
        <TextInput
          style={styles.input}
          placeholder="Filter by location (e.g., 12.3456, 78.9012)"
          value={locationFilter}
          onChangeText={setLocationFilter}
        />
        <TouchableOpacity style={styles.clearButton} onPress={() => {
          setDateFilter('');
          setTimeFilter('');
          setLocationFilter('');
        }}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Login History List */}
      {filteredHistory.length === 0 ? (
        <Text style={styles.noDataText}>No login history matches your filters.</Text>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderLoginItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  filterContainer: { marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: { paddingBottom: 20 },
  loginItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  loginText: { fontSize: 16, color: '#333', marginBottom: 5 },
  bold: { fontWeight: 'bold' },
  noDataText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
});
