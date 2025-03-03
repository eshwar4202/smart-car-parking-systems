import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// Supabase setup
const supabaseUrl = 'https://velagnrotxuqhiczsczz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbGFnbnJvdHh1cWhpY3pzY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjkxMjcsImV4cCI6MjA1NTIwNTEyN30.Xpr6wjdZdL6KN4gcZZ_q0aHOLpN3aAcG89uso0a_Fsw';
const supabase = createClient(supabaseUrl, supabaseKey);

// Constants
const SLOT_STATUS = {
  EMPTY: 'empty',
  RESERVED: 'reserved',
  OCCUPIED: 'occupied',
};

const SLOT_ACTIONS = {
  MODIFY: 'Modify Booking',
  CANCEL: 'Cancel Booking',
};

const PRICE_PER_SLOT = 200;
const decks = ['Upper Deck', 'Lower Deck'];

// Review interface
interface Review {
  profiles: {
    username: string;
  };
  rating: number;
  review: string;
  fav: boolean;
}

const SmartParkingSystem = ({ route }) => {
  const { session, lotId } = route.params;
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [isModifying, setIsModifying] = useState(false);
  const [modifyingSlotId, setModifyingSlotId] = useState(null);
  const navigation = useNavigation();
  const [isFromPickerVisible, setFromPickerVisible] = useState(false);
  const [isToPickerVisible, setToPickerVisible] = useState(false);
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [review, setReview] = useState([]);

  useEffect(() => {
    fetchSlots();
    fetchReview();
    if (session && session.user) {
      setUserId(session.user.id);
      console.log('User ID in SmartParkingSystem:', session.user.id);
    } else {
      console.log('No session in SmartParkingSystem');
    }

    const intervalId = setInterval(checkAndCancelExpiredBookings, 3000);
    return () => clearInterval(intervalId);
  }, [session]);

  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_slots')
        .select('*, profiles(username)')
        .eq('lot_id', lotId)
        .order('id');

      if (error) throw error;
      const validData = (data || []).filter(
        (slot) => slot.id && slot.deck && slot.status
      );
      setSlots(validData);
      console.log('Fetched slots:', validData); // Debug fetched data
    } catch (err) {
      console.error('Fetch Slots Error:', err);
      Alert.alert('Error', 'Failed to fetch parking slots.');
    }
  };

  const fetchReview = async () => {
    try {
      const { data, error } = await supabase
        .from('user_review')
        .select('*, profiles(username)')
        .eq('lot_id', lotId)
        .order('id');
      if (error) throw error;
      setReview(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch reviews');
    }
  };

  const checkAndCancelExpiredBookings = async () => {
    try {
      const currentTime = new Date();
      const expiredSlots = slots.filter((slot) => {
        const toDate = slot.to ? new Date(slot.to) : null;
        const isExpired =
          slot.status === SLOT_STATUS.RESERVED &&
          toDate &&
          toDate < currentTime;

        // Debug logging
        if (slot.status === SLOT_STATUS.RESERVED) {
          console.log(`Slot ${slot.id}:`);
          console.log(`- Current Time: ${currentTime.toISOString()}`);
          console.log(`- Slot To Time: ${slot.to}`);
          console.log(`- Parsed To Time: ${toDate ? toDate.toISOString() : 'null'}`);
          console.log(`- Is Expired: ${isExpired}`);
        }

        return isExpired;
      });

      for (const slot of expiredSlots) {
        console.log(`Cancelling expired slot ${slot.id}`);
        await updateSlot(slot.id, SLOT_STATUS.EMPTY);
      }

      if (expiredSlots.length > 0) {
        console.log(`Cancelled ${expiredSlots.length} expired bookings.`);
        fetchSlots();
      }
    } catch (err) {
      console.error('Error checking expired bookings:', err);
    }
  };

  const updateSlot = async (slotId, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
      };

      if (newStatus === SLOT_STATUS.RESERVED && userId) {
        updateData.uid = userId;
        updateData.from = fromTime.toISOString();
        updateData.to = toTime.toISOString();
        console.log('Booking slot with:', { // Debug booking data
          slotId,
          from: updateData.from,
          to: updateData.to,
        });
      } else if (newStatus === SLOT_STATUS.EMPTY) {
        updateData.uid = null;
        updateData.from = null;
        updateData.to = null;
      }

      const { data, error } = await supabase
        .from('parking_slots')
        .update(updateData)
        .eq('id', parseInt(slotId, 10))
        .select('*');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No matching slot found to update.');
      }

      setSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot.id === slotId ? { ...slot, ...updateData } : slot
        )
      );

      if (newStatus === SLOT_STATUS.RESERVED && !isModifying) {
        setSelectedSlots((prev) => [...prev, slotId]);
      } else if (newStatus === SLOT_STATUS.EMPTY) {
        setSelectedSlots((prev) => prev.filter((id) => id !== slotId));
      }

      fetchSlots();

      if (isModifying) {
        Alert.alert('Success', 'Booking updated successfully');
      }
    } catch (err) {
      console.error('Update Slot Error:', err);
      Alert.alert('Error', err.message || 'Failed to update the slot status.');
    }
  };

  const handleSlotPress = (slot) => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to reserve a slot.');
      return;
    }

    if (slot.status === SLOT_STATUS.EMPTY) {
      setSelectedSlotId(slot.id);
      setFromPickerVisible(true);
    } else if (slot.status === SLOT_STATUS.RESERVED) {
      if (slot.uid === userId) {
        showBookingOptions(slot);
      } else {
        Alert.alert('Slot Reserved', 'This slot is already reserved by someone else.');
      }
    } else if (slot.status === SLOT_STATUS.OCCUPIED) {
      Alert.alert('Slot Occupied', 'This slot is currently occupied.');
    }
  };

  const showBookingOptions = (slot) => {
    Alert.alert(
      'Booking Options',
      `Slot ${slot.id}`,
      [
        {
          text: SLOT_ACTIONS.MODIFY,
          onPress: () => {
            setModifyingSlotId(slot.id);
            setIsModifying(true);
            setFromTime(new Date(slot.from));
            setToTime(new Date(slot.to));
            setFromPickerVisible(true);
          },
        },
        {
          text: SLOT_ACTIONS.CANCEL,
          onPress: () => updateSlot(slot.id, SLOT_STATUS.EMPTY),
        },
        {
          text: 'Close',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const isTimeWithinRange = (date) => {
    const hours = date.getHours();
    return hours >= 7 && hours < 22;
  };

  const handleFromConfirm = (date) => {
    setFromPickerVisible(false);
    if (!isTimeWithinRange(date)) {
      Alert.alert('Invalid Time', 'Please select a time between 7:00 AM and 10:00 PM.');
      return;
    }
    setFromTime(date);
    setToPickerVisible(true);
  };

  const handleToConfirm = (date) => {
    setToPickerVisible(false);
    if (!isTimeWithinRange(date)) {
      Alert.alert('Invalid Time', 'Please select a time between 7:00 AM and 10:00 PM.');
      return;
    }
    if (date <= fromTime) {
      Alert.alert('Error', 'End time must be after start time.');
      return;
    }
    setToTime(date);

    if (isModifying && modifyingSlotId) {
      updateSlot(modifyingSlotId, SLOT_STATUS.RESERVED);
      setIsModifying(false);
      setModifyingSlotId(null);
    } else if (selectedSlotId) {
      updateSlot(selectedSlotId, SLOT_STATUS.RESERVED);
    } else {
      Alert.alert('Error', 'No slot selected.');
    }
  };

  const goToPayment = () => {
    if (selectedSlots.length === 0) {
      Alert.alert('No Slots Selected', 'Please select at least one parking slot.');
      return;
    }
    const totalAmount = selectedSlots.length * PRICE_PER_SLOT;
    navigation.navigate('Payment', {
      slots: selectedSlots,
      amount: totalAmount,
      pricePerSlot: PRICE_PER_SLOT,
      session: session,
      fromTime: fromTime.toISOString(),
      toTime: toTime.toISOString(),
    });
  };

  const renderSlot = (slot) => (
    <TouchableOpacity
      style={[
        styles.slot,
        getSlotStyle(slot.status, slot.uid),
        selectedSlots.includes(slot.id) && styles.selectedSlot,
      ]}
      onPress={() => handleSlotPress(slot)}
    >
      <Text style={styles.slotText}>{slot.id}</Text>
      {(() => {
        if (slot.profiles && slot.uid !== userId) {
          return <Text style={styles.slotInfo}>Booked</Text>;
        } else if (slot.uid === userId) {
          return <Text style={styles.slotInfo}>Booked by you</Text>;
        } else if (!slot.profiles && slot.status === SLOT_STATUS.OCCUPIED) {
          return <Text style={styles.slotInfo}>Booked</Text>;
        } else {
          return <Text style={styles.slotInfo}>Available</Text>;
        }
      })()}
    </TouchableOpacity>
  );

  const getSlotStyle = (status, slotUid) => {
    if (status === SLOT_STATUS.RESERVED && slotUid === userId) {
      return styles.yourSlot;
    }
    switch (status) {
      case SLOT_STATUS.EMPTY:
        return styles.emptySlot;
      case SLOT_STATUS.RESERVED:
        return styles.reservedSlot;
      case SLOT_STATUS.OCCUPIED:
        return styles.occupiedSlot;
      default:
        return styles.emptySlot;
    }
  };

  const prepareFlatListData = () => {
    const data = [{ type: 'header', id: 'info-card' }];

    decks.forEach((deck) => {
      const deckSlots = slots.filter(
        (slot) => slot.deck.trim().toLowerCase() === deck.trim().toLowerCase()
      );
      if (deckSlots.length > 0) {
        data.push({ type: 'deck-title', id: `deck-${deck}`, title: deck });
        data.push({ type: 'slots', id: `slots-${deck}`, slots: deckSlots });
      } else {
        data.push({ type: 'deck-title', id: `deck-${deck}`, title: deck });
        data.push({ type: 'no-slots', id: `no-slots-${deck}` });
      }
    });

    data.push({ type: 'reviews', id: 'reviews-section' });
    return data;
  };

  const ReviewCard = ({ review, username, rating }) => {
    const renderStars = (rating) => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <Text key={i} style={styles.star}>
            {i <= rating ? '★' : '☆'}
          </Text>
        );
      }
      return stars;
    };

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewUsername}>{username}</Text>
          <View style={styles.ratingContainer}>{renderStars(rating)}</View>
        </View>
        <Text style={styles.reviewText}>{review}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Price per slot: ₹{PRICE_PER_SLOT}</Text>
            <Text style={styles.infoText}>
              Selected slots: {selectedSlots.length}
              {selectedSlots.length > 0 ? ` (₹${selectedSlots.length * PRICE_PER_SLOT})` : ''}
            </Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setFromPickerVisible(true)}
            >
              <Text style={styles.timeButtonText}>
                From: {fromTime.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setToPickerVisible(true)}
            >
              <Text style={styles.timeButtonText}>
                To: {toTime.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </Text>
            </TouchableOpacity>
            <Text style={styles.infoText}>Booking available: 7:00 AM - 10:00 PM</Text>
          </View>
        );
      case 'deck-title':
        return (
          <View style={styles.deck}>
            <Text style={styles.deckTitle}>{item.title}</Text>
          </View>
        );
      case 'slots':
        return (
          <FlatList
            data={item.slots}
            renderItem={({ item }) => renderSlot(item)}
            keyExtractor={(slot) => slot.id.toString()}
            numColumns={3}
            scrollEnabled={false}
          />
        );
      case 'no-slots':
        return <Text>No slots available for this deck.</Text>;
      case 'reviews':
        return (
          <View style={styles.reviewsContainer}>
            <Text style={styles.reviewsTitle}>Reviews</Text>
            {review.length > 0 ? (
              <FlatList
                data={review}
                renderItem={({ item }) => (
                  <ReviewCard
                    review={item.review}
                    username={item.profiles?.username || 'Anonymous'}
                    rating={item.rating}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noReviewsText}>No reviews yet</Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={prepareFlatListData()}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
      />

      <DateTimePickerModal
        isVisible={isFromPickerVisible}
        mode="datetime"
        onConfirm={handleFromConfirm}
        onCancel={() => {
          setFromPickerVisible(false);
          if (isModifying) {
            setIsModifying(false);
            setModifyingSlotId(null);
          }
        }}
        date={fromTime}
      />
      <DateTimePickerModal
        isVisible={isToPickerVisible}
        mode="datetime"
        onConfirm={handleToConfirm}
        onCancel={() => {
          setToPickerVisible(false);
          if (isModifying) {
            setIsModifying(false);
            setModifyingSlotId(null);
          }
        }}
        date={toTime}
      />

      {selectedSlots.length > 0 && (
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity style={styles.paymentButton} onPress={goToPayment}>
            <Text style={styles.paymentButtonText}>
              Proceed to Payment (₹{selectedSlots.length * PRICE_PER_SLOT})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  timeButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  timeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  deck: {
    marginVertical: 10,
  },
  deckTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  slot: {
    width: 100,
    height: 80,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    padding: 5,
  },
  slotText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  slotInfo: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptySlot: {
    backgroundColor: '#e0e0e0',
  },
  reservedSlot: {
    backgroundColor: '#f9a825',
  },
  occupiedSlot: {
    backgroundColor: '#e53935',
  },
  yourSlot: {
    backgroundColor: 'green',
  },
  selectedSlot: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  paymentButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  paymentButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewsContainer: {
    padding: 10,
    marginBottom: 20,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 18,
    color: '#FFD700',
    marginLeft: 2,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});

export default SmartParkingSystem;
