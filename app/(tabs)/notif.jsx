import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Notif = () => {
  const [filter, setFilter] = useState("Unread");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Montserrat fonts
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  // Get Firestore instance
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "notification"),
      where("uid", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          message: data.message,
          time: data.timeSend.toDate().toLocaleTimeString(), // Format timestamp
          read: data.status === "read",
        };
      });
      setNotifications(fetchedNotifications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, currentUser]);

  const handleNotificationClick = async (id) => {
    const notifRef = doc(db, "notification", id);
    await updateDoc(notifRef, { status: "read" });

    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const filteredNotifications = notifications.filter((notif) =>
    filter === "Unread" ? !notif.read : notif.read
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleNotificationClick(item.id)}>
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
        <Ionicons
          name="notifications-outline"
          size={24}
          color={item.read ? "#aaa" : "#000"}
          style={{ marginRight: 16 }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Montserrat_400Regular",
              fontSize: 16,
              marginBottom: 4,
              color: item.read ? "#aaa" : "#000",
            }}
          >
            {item.message}
          </Text>
          <Text
            style={{
              fontFamily: "Montserrat_400Regular",
              fontSize: 12,
              color: "#555",
              alignSelf: "flex-end",
            }}
          >
            {item.time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading || !fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

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
