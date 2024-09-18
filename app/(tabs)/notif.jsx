import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

const initialNotifications = [
  // Read notifications
  {
    id: "1",
    message: "Your Latte is ready for pick-up!",
    read: true,
    time: "10:30 AM",
  },
  {
    id: "2",
    message: "Espresso is now available for pick-up.",
    read: true,
    time: "11:00 AM",
  },
  {
    id: "3",
    message: "Caramel Macchiato is ready for you.",
    read: true,
    time: "11:30 AM",
  },
  {
    id: "4",
    message: "Your order of Croissants is ready.",
    read: true,
    time: "12:00 PM",
  },
  {
    id: "5",
    message: "Your breakfast sandwich is ready.",
    read: true,
    time: "12:15 PM",
  },

  // Unread notifications
  {
    id: "6",
    message: "Your Cappuccino will be ready in 5 minutes.",
    read: false,
    time: "10:35 AM",
  },
  {
    id: "7",
    message: "Your Cold Brew is being prepared.",
    read: false,
    time: "10:45 AM",
  },
  {
    id: "8",
    message: "Your Matcha Latte is almost ready.",
    read: false,
    time: "11:10 AM",
  },
  {
    id: "9",
    message: "Your Tiramisu is now available.",
    read: false,
    time: "11:20 AM",
  },
  {
    id: "10",
    message: "Your Chai Latte will be ready soon.",
    read: false,
    time: "11:45 AM",
  },
  {
    id: "11",
    message: "Your Avocado Toast is being toasted.",
    read: false,
    time: "12:05 PM",
  },
  {
    id: "12",
    message: "Your Berry Smoothie is blending now.",
    read: false,
    time: "12:20 PM",
  },
  {
    id: "13",
    message: "Your Vegan Muffin is in the oven.",
    read: false,
    time: "12:30 PM",
  },
];

const Notif = () => {
  const [filter, setFilter] = useState("Unread");
  const [notifications, setNotifications] = useState(initialNotifications); // Store notifications in state

  // Load Montserrat fonts
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  // If fonts are not loaded, show a loading indicator
  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  const handleNotificationClick = (id) => {
    // Update the 'read' status of the clicked notification
    const updatedNotifications = notifications.map((notif) =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications); // Update the state
  };

  const filteredNotifications = notifications.filter((notif) =>
    filter === "Unread" ? !notif.read : notif.read
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleNotificationClick(item.id)} // Mark as read when clicked
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#e5dcd3",
          padding: 12,
          marginBottom: 12,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 2,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        {/* Notification icon */}
        <Ionicons
          name="notifications-outline"
          size={24}
          color={item.read ? "#aaa" : "#000"} // Icon color changes based on read status
          style={{ marginRight: 16 }}
        />

        {/* Message and time */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Montserrat_400Regular",
              fontSize: 16,
              marginBottom: 4,
              color: item.read ? "#aaa" : "#000", // Text color changes based on read status
            }}
          >
            {item.message}
          </Text>

          {/* Time at bottom-right */}
          <Text
            style={{
              fontFamily: "Montserrat_400Regular",
              fontSize: 12,
              color: "#555",
              alignSelf: "flex-end", // Aligns time to the bottom-right
            }}
          >
            {item.time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ backgroundColor: "#cfc1b1" }} className="flex-1">
      <View className="flex-row justify-around p-4">
        <TouchableOpacity
          onPress={() => setFilter("Unread")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            paddingHorizontal: 20,
            backgroundColor: filter === "Unread" ? "#4f3830" : "#e5dcd3",
            borderRadius: 50,
            borderColor: "#aaa",
            borderWidth: 1,
          }}
        >
          <Ionicons
            name="mail-unread-outline"
            size={20}
            color={filter === "Unread" ? "#d1c2b4" : "#555"}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontFamily:
                filter === "Unread"
                  ? "Montserrat_700Bold"
                  : "Montserrat_400Regular",
              fontSize: 16,
              color: filter === "Unread" ? "#d1c2b4" : "#555",
            }}
          >
            Unread
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter("Read")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            paddingHorizontal: 20,
            backgroundColor: filter === "Read" ? "#4f3830" : "#e5dcd3",
            borderRadius: 50,
            borderColor: "#aaa",
            borderWidth: 1,
          }}
        >
          <Ionicons
            name="mail-open-outline"
            size={20}
            color={filter === "Read" ? "#d1c2b4" : "#555"}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontFamily:
                filter === "Read"
                  ? "Montserrat_700Bold"
                  : "Montserrat_400Regular",
              fontSize: 16,
              color: filter === "Read" ? "#d1c2b4" : "#555",
            }}
          >
            Read
          </Text>
        </TouchableOpacity>
      </View>

      {/* FlatList for notifications */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
};

export default Notif;
