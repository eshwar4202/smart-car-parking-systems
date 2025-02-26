import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseKey);

const FAQScreen = () => {
  const [faqs, setFaqs] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, question, answer')
        .order('id');

      if (error) throw error;
      setFaqs(data || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      Alert.alert('Error', 'Failed to fetch FAQs.');
    }
  };

  const insertFAQ = async (question, answer) => {
    try {
      const { error } = await supabase.from('messages').insert([
        { question, answer }
      ]);

      if (error) throw error;
      fetchFAQs();
    } catch (err) {
      console.error('Error inserting FAQ:', err);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={faqs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.faqItem}>
            <TouchableOpacity onPress={() => setExpanded(expanded === item.id ? null : item.id)} style={styles.questionContainer}>
              <Text style={styles.questionText}>{item.question}</Text>
              <Text style={styles.arrow}>{expanded === item.id ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            {expanded === item.id && <Text style={styles.answerText}>{item.answer}</Text>}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  faqItem: {
    marginBottom: 15,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  answerText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
  arrow: {
    fontSize: 18,
    color: '#555',
  },
});

export default FAQScreen;
