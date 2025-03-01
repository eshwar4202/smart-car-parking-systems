import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button,TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useRoute } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';

// If you already have a single supabase client in lib/supabase.ts, import it:
const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Transaction = {
  id: number;
  transaction_type: string;
  amount: string;
  created_at: string;
};

export default function EWallet() {
  // Expecting session from route params, or retrieve from your global context
  const route = useRoute();
  const session = (route.params as { session: Session })?.session;

  const [balance, setBalance] = useState<string>('0.00');
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      // 1. Fetch wallet balance
      fetchWallet(session.user.id);
      // 2. Fetch transaction history
      fetchTransactions(session.user.id);
    }
  }, [session]);

  // Fetch current wallet balance
  async function fetchWallet(userId: string) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Fetch wallet error:', error);
      } else if (data) {
        setBalance(data.balance?.toString() || '0.00');
      } else {
        // No wallet row yet, set to 0.00
        setBalance('0.00');
      }
    } catch (err) {
      console.error('Wallet fetch exception:', err);
    }
  }

  // Fetch transaction history
  async function fetchTransactions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Fetch transactions error:', error);
      } else if (data) {
        setTransactions(data as Transaction[]);
      }
    } catch (err) {
      console.error('Transactions fetch exception:', err);
    }
  }

  // Recharge wallet
  async function handleRecharge() {
    const amount = parseFloat(rechargeAmount);
    if (!session?.user?.id) {
      Alert.alert('Error', 'No user session found!');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid recharge amount.');
      return;
    }

    try {
      const userId = session.user.id;

      // 1. Insert a RECHARGE transaction
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          transaction_type: 'RECHARGE',
          amount,
        })
        .select('*')
        .single();

      if (txError) throw txError;

      // 2. Upsert or update the wallet balance
      // A. Fetch current balance first or do an atomic update
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .upsert({
          user_id: userId,
          balance: parseFloat(balance) + amount, // new balance
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (walletError) throw walletError;

      Alert.alert('Success', `Recharged with ${amount}`);
      setRechargeAmount(''); // clear input

      // Refresh
      fetchWallet(userId);
      fetchTransactions(userId);
    } catch (err: any) {
      console.error('Recharge error:', err);
      Alert.alert('Recharge Error', err.message || 'Something went wrong.');
    }
  }

  // Render each transaction
  function renderTransaction({ item }: { item: Transaction }) {
    const isDeduction = item.transaction_type === 'CANCELLATION FEE' || item.transaction_type === 'SERVICE FEE' || item.transaction_type === 'BOOKING FEE' ;
    let amount = parseFloat(item.amount);
    const sign = isDeduction ? '-' : '+';
    const color = isDeduction ? 'red' : 'green';
    return (
      <View style={styles.transactionItem}>
        <Text style={styles.txType}>{item.transaction_type}</Text>
        <Text style={[styles.txAmount, { color }]}>
        {sign} ₹{Math.abs(amount)}
        </Text>
        <Text style={styles.txDate}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Current Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>Current Balance: ₹{balance}</Text>
      </View>

      {/* Recharge Section */}
      <View style={styles.rechargeContainer}>
        <Text style={styles.label}>Recharge Amount:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={rechargeAmount}
          onChangeText={setRechargeAmount}
          placeholder="e.g. 50"
        />
        <TouchableOpacity style={styles.rechargeButton} onPress={handleRecharge}>
          <Text style={styles.rechargeButtonText}>Recharge</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction History */}
      <Text style={styles.historyTitle}>Transaction History</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        style={styles.transactionList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  balanceContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rechargeContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 8,
    height: 40,
  },
  rechargeButton: {
    backgroundColor: '#4C4C9D',  // Button color
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rechargeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  transactionList: {
    flex: 1,
  },
  transactionItem: {
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 10,
    borderRadius: 6,
    elevation: 1,
  },
  txType: {
    fontWeight: 'bold',
  },
  txAmount: {
    color: 'green',
    marginTop: 2,
  },
  txDate: {
    color: '#666',
    marginTop: 4,
  },
});
