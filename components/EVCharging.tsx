import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation, useRoute } from '@react-navigation/native';

const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseKey);

const EVCharging = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const userId = route.params?.userId;

    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isStartPickerVisible, setStartPickerVisibility] = useState(false);
    const [isEndPickerVisible, setEndPickerVisibility] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [chargingDuration, setChargingDuration] = useState(0);
    const [estimatedCost, setEstimatedCost] = useState(0);

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        const { data, error } = await supabase.from('ev_charging_slots').select('*');
        if (error) {
            Alert.alert('Error', 'Failed to load charging slots');
            console.error(error);
        } else {
            setSlots(data);
        }
    };

    const handleSlotSelection = (slot) => {
        if (slot.status === 'occupied') {
            Alert.alert('Slot Occupied', 'Please select a different slot.');
            return;
        }
        setSelectedSlot(slot);
        setDatePickerVisibility(true);
    };

    const handleDateConfirm = (date) => {
        setDatePickerVisibility(false);
        setSelectedDate(date);
        setStartPickerVisibility(true);
    };

    const handleStartConfirm = (time) => {
        setStartPickerVisibility(false);
        setStartTime(time);
        setEndPickerVisibility(true);
    };

    const handleEndConfirm = (time) => {
        setEndPickerVisibility(false);
        setEndTime(time);
    
        if (!startTime) {
            Alert.alert('Error', 'Please select start time first.');
            return;
        }
    
        // Convert both times to Date objects (if not already)
        const start = new Date(startTime);
        const end = new Date(time);
    
        const duration = (end - start) / (1000 * 60 * 60); // Convert ms to hours
        if (duration <= 0) {
            Alert.alert('Error', 'End time must be after start time.');
            return;
        }
    
        const roundedDuration = duration % 1 === 0 ? duration : Math.ceil(duration); // Only round if needed
        setChargingDuration(roundedDuration);
        calculateCost(roundedDuration);
    };
    
    const calculateCost = (duration) => {
        const ratePerKWh =
            selectedSlot.slot_type === 'DC Fast' ? 9 :
            selectedSlot.slot_type === 'Level 2' ? 7 :
            5;
    
        const cost = duration * ratePerKWh;
        setEstimatedCost(cost);
    
        console.log('Navigating to ConfirmationPage with:', {
            userId,
            selectedSlot,
            selectedDate,
            startTime,
            endTime,
            estimatedCost: cost,
        });
    
        navigation.navigate('ConfirmationPage', {
            selectedSlot,
            userId,
            selectedSlotName: selectedSlot.charging_slot_name,
            selectedDate: selectedDate.toISOString(),
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            estimatedCost: cost,
        });
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select an EV Charging Slot</Text>
            {slots.map((slot) => (
                <TouchableOpacity
                    key={slot.id}
                    style={[
                        styles.slotButton,
                        slot.status === 'occupied' ? styles.occupied : styles.available,
                    ]}
                    onPress={() => handleSlotSelection(slot)}
                >
                    <Text style={styles.slotText}>{slot.charging_slot_name}</Text>
                    <Text style={styles.slotStatus}>
                        {slot.status === 'occupied' ? 'Occupied' : 'Available'}
                    </Text>
                    <Text style={styles.info}>
                        Type: {slot.slot_type} | Power: {slot.power_rating} kW
                    </Text>
                    <Text style={styles.info}>{slot.additional_info}</Text>
                </TouchableOpacity>
            ))}

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={() => setDatePickerVisibility(false)}
            />

            <DateTimePickerModal
                isVisible={isStartPickerVisible}
                mode="time"
                onConfirm={handleStartConfirm}
                onCancel={() => setStartPickerVisibility(false)}
            />

            <DateTimePickerModal
                isVisible={isEndPickerVisible}
                mode="time"
                onConfirm={handleEndConfirm}
                onCancel={() => setEndPickerVisibility(false)}
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
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    slotButton: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    available: {
        backgroundColor: 'green',
    },
    occupied: {
        backgroundColor: 'orange',
    },
    slotText: {
        fontSize: 18,
        color: '#fff',
    },
    slotStatus: {
        fontSize: 14,
        color: '#fff',
    },
    info: {
        fontSize: 12,
        color: '#ddd',
    },
});

export default EVCharging;