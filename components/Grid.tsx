import React from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from "react-native";

// Define the type for grid items
type GridItem = {
  id: string;
  title: string;
  icon: any; // Change to ImageSourcePropType if using stricter typing
  width: number;
  height: number;
};

// Sample data
const data: GridItem[] = [
  { id: "1", title: "Phone", icon: require("../assets/phone.png"), width: 100, height: 120 },
  { id: "2", title: "Messages", icon: require("../assets/messages.png"), width: 120, height: 120 },
  { id: "3", title: "Camera", icon: require("../assets/camera.png"), width: 200, height: 200 },
  { id: "4", title: "Gallery", icon: require("../assets/gallery.png"), width: 150, height: 150 },
  { id: "5", title: "Music", icon: require("../assets/music.png"), width: 100, height: 100 },
  { id: "6", title: "Settings", icon: require("../assets/settings.png"), width: 120, height: 100 },
];

export default function Grid() {
  // Define the renderItem function
  const renderItem = ({ item }: { item: GridItem }) => {
    // Apply dynamic dimensions from the item
    const dynamicStyle = {
      width: item.width,
      height: item.height,
    };

    return (
      <TouchableOpacity style={[styles.gridItem, dynamicStyle]}>
        <Image source={item.icon} style={styles.icon} />
        <Text style={styles.label}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3} // Base number of columns for alignment
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  grid: {
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  gridItem: {
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 8,
    resizeMode: "contain", // Ensures icons fit properly
  },
  label: {
    fontSize: 14,
    color: "#333",
  },
});

