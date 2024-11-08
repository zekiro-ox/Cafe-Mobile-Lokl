import { Text, View } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons, Foundation } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

const TabIcon = ({ icon: Icon, color, name, unreadCount }) => {
  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Icon
        name={name}
        size={24}
        color={color}
        style={{ marginBottom: -3 }} // Adjust the icon's position if needed
      />
    </View>
  );
};

const TabsLayout = () => {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#4f3830", // Dark background
          borderTopWidth: 1,
          height: 65,
          borderTopColor: "#E5E7EB", // Light gray border
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          fontFamily: "Montserrat_400Regular",
          color: "#d1c2b4", // Default gray for inactive labels
        },
        tabBarActiveTintColor: "#d1c2b4", // Light color for active labels
        tabBarInactiveTintColor: "#737373", // Dark gray for inactive labels
        tabBarIconStyle: {
          // Optional: Add any style you need for icons here
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabIcon icon={MaterialIcons} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notif"
        options={{
          title: "Notifications",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabIcon icon={MaterialIcons} name="notifications" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: "Orders",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabIcon icon={Foundation} name="shopping-cart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabIcon icon={MaterialIcons} name="history" color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
