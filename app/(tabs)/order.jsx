import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import PayPalPayment from "../component/PaypalPayment";
import { db } from "../config/firebase"; // Adjust the path as necessary
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore"; // Import necessary Firestore functions
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";

const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={styles.toastContainer}>
      <Text style={styles.toastTitle}>{text1}</Text>
      <Text style={styles.toastMessage}>{text2}</Text>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={styles.toastContainer}>
      <Text style={styles.toastTitle}>{text1}</Text>
      <Text style={styles.toastMessage}>{text2}</Text>
    </View>
  ),
};

const Order = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const { selectedItems = "[]", totalPrice = "0" } = useLocalSearchParams();

  const parsedItems = React.useMemo(() => {
    try {
      return JSON.parse(selectedItems);
    } catch (error) {
      console.error("Failed to parse selectedItems:", error);
      return [];
    }
  }, [selectedItems]);

  const formattedTotalPrice = React.useMemo(() => {
    try {
      return parseFloat(totalPrice) || 0;
    } catch (error) {
      console.error("Failed to parse totalPrice:", error);
      return 0;
    }
  }, [totalPrice]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderInProgress, setOrderInProgress] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [isPayPalVisible, setIsPayPalVisible] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [specialRemarks, setSpecialRemarks] = useState("");
  const remarksInputRef = useRef(null);
  const [hasOrders, setHasOrders] = useState(false);
  const [pickupTime, setPickupTime] = useState("");
  const [orderId, setOrderId] = useState("");
  const [cancelAttempts, setCancelAttempts] = useState(0); // Track cancellations
  const [timeoutTimestamp, setTimeoutTimestamp] = useState(null); // Store timeout expiry
  const [timeRemaining, setTimeRemaining] = useState(0);

  const pickupTimeOptions = [
    { label: "11:00 AM", value: "11:00 AM" },
    { label: "11:30 AM", value: "11:30 AM" },
    { label: "12:00 PM", value: "12:00 PM" },
    { label: "12:30 PM", value: "12:30 PM" },
    { label: "1:00 PM", value: "01:00 PM" },
    { label: "1:30 PM", value: "01:30 PM" },
    { label: "2:00 PM", value: "02:00 PM" },
    { label: "2:30 PM", value: "02:30 PM" },
    { label: "3:00 PM", value: "03:00 PM" },
    { label: "3:30 PM", value: "03:30 PM" },
    { label: "4:00 PM", value: "04:00 PM" },
    { label: "4:30 PM", value: "04:30 PM" },
    { label: "5:00 PM", value: "05:00 PM" },
    { label: "5:30 PM", value: "05:30 PM" },
    { label: "6:00 PM", value: "06:00 PM" },
    { label: "6:30 PM", value: "06:30 PM" },
    { label: "7:00 PM", value: "07:00 PM" },
    { label: "7:30 PM", value: "07:30 PM" },
    { label: "8:00 PM", value: "08:00 PM" },
    { label: "8:30 PM", value: "08:30 PM" },
    { label: "9:00 PM", value: "09:00 PM" },
    { label: "9:30 PM", value: "09:30 PM" },
  ];

  useEffect(() => {
    if (parsedItems.length > 0 && !confirmed) {
      setOrderItems(parsedItems);
      setIsModalVisible(true);
      setOrderInProgress(true);
    }
    console.log("Parsed Items:", parsedItems);
  }, [parsedItems, confirmed]);

  useEffect(() => {
    setOrderItems(parsedItems);
    setIsModalVisible(true);
  }, [parsedItems]);

  useEffect(() => {
    if (isModalVisible) {
      // Focus on the TextInput when the modal opens
      setTimeout(() => {
        remarksInputRef.current?.focus();
      }, 100); // Delay to ensure modal is fully rendered
    }
  }, [isModalVisible]);

  // Function to fetch the order status
  const fetchOrderStatus = async (userId) => {
    const q = query(collection(db, "order"), where("uid", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        if (orderData.status) {
          setConfirmationMessage(orderData.status);
        }
      });
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid;
      const q = query(collection(db, "order"), where("uid", "==", userId));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          setHasOrders(true);
          querySnapshot.forEach((doc) => {
            const orderData = doc.data();
            if (orderData.status) {
              setConfirmationMessage(orderData.status);
            }
          });
        } else {
          setHasOrders(false); // No orders found
        }
      });

      return () => unsubscribe(); // Cleanup listener on unmount
    }
  }, [confirmed]);

  useEffect(() => {
    if (timeoutTimestamp) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, timeoutTimestamp - Date.now());
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          setTimeoutTimestamp(null); // Unblock after timeout
          setCancelAttempts(0); // Reset cancel attempts
          clearInterval(timer);

          // Update Firestore to set the user as not locked out
          const auth = getAuth();
          const user = auth.currentUser;

          if (user) {
            const userDocRef = doc(db, "customer", user.uid);
            updateDoc(userDocRef, { isLockedOut: false })
              .then(() => {
                console.log("User  is no longer locked out.");
              })
              .catch((error) => {
                console.error("Error updating lockout status:", error);
              });
          }
        }
      }, 1000);

      return () => clearInterval(timer); // Cleanup timer on unmount
    }
  }, [timeoutTimestamp]); // Only run this effect if the order is confirmed// Only run this effect if the order is confirmed

  const renderSelectedItem = ({ item }) => {
    if (!item || !item.name) {
      return null; // Avoid rendering if item is undefined or does not have an id
    }

    const handleDeleteItem = () => {
      // Clear the parsed items
      setOrderItems([]); // Clear the order items
      setConfirmed(false); // Reset confirmation state
      setIsModalVisible(false); // Close the modal if open
      router.replace("order", { selectedItems: "[]", totalPrice: "0" }); // Navigate to order with empty params
    };

    console.log("Rendering image URL:", item.image);
    return (
      <View style={styles.itemContainer}>
        <Image
          source={{ uri: item.image }} // Use the image URL from the item
          style={styles.itemImage}
          resizeMode="contain" // Apply styles for the image
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.ingredients && item.ingredients.length > 0 && (
            <Text style={styles.itemCustomization}>
              Ingredients:{" "}
              {item.ingredients
                .map(
                  (ingredient) => `${ingredient.name} x ${ingredient.quantity}`
                )
                .join(",")}
            </Text>
          )}
          <Text style={styles.itemPrice}>₱{item.totalPrice}</Text>
        </View>
        {!confirmed && ( // Only show delete button if not confirmed
          <TouchableOpacity onPress={handleDeleteItem}>
            <Ionicons name="trash" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleConfirmPayment = () => {
    if (timeoutTimestamp && timeRemaining > 0) {
      Toast.show({
        type: "error",
        text1: "Checkout Blocked",
        text2: `You can try again in ${Math.floor(
          timeRemaining / 60000
        )}:${Math.floor((timeRemaining % 60000) / 1000)
          .toString()
          .padStart(2, "0")}`,
      });
      return;
    }

    if (!pickupTime) {
      Toast.show({
        type: "error",
        text1: "Incomplete Field",
        text2: "Select a Pick-up Time!",
      });
      return;
    }

    setIsModalVisible(false);
    setIsPayPalVisible(true); // Show PayPal payment component
  };

  const handlePaymentSuccess = async () => {
    if (isPaymentProcessing) return;

    setIsPaymentProcessing(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is currently logged in.");
        return;
      }

      const userId = user.uid;

      for (const item of orderItems) {
        const orderData = {
          uid: userId,
          productName: item.name,
          quantity: item.quantity || 1,
          ingredients: item.ingredients.map((ingredient) => ({
            name: ingredient.name,
            price: ingredient.price || 0,
            quantity: ingredient.quantity || 0,
          })),
          totalPrice: formattedTotalPrice,
          specialRemarks: specialRemarks,
          pickupTime: pickupTime,
          createdAt: new Date(),
        };

        // Add the order to Firestore
        const orderDocRef = await addDoc(collection(db, "order"), orderData);

        // Fetch the order document data

        setOrderId(orderDocRef.id);
        const orderDoc = await getDoc(orderDocRef);
        const orderDataFetched = orderDoc.data();

        // Set the confirmation message based on the status field
        if (orderDataFetched && orderDataFetched.status) {
          setConfirmationMessage(orderDataFetched.status);
        } else {
          setConfirmationMessage(
            "Order confirmed! You can pick it up at your scheduled time."
          );
        }
      }

      setConfirmed(true);
      setIsPayPalVisible(false);
    } catch (error) {
      console.error("Error saving order to Firestore:", error);
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleCancelOrder = () => {
    setCancelAttempts((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        const timeoutEnd = Date.now() + 10 * 60 * 1000; // 10-minute timeout
        setTimeoutTimestamp(timeoutEnd);
        // Update Firestore to set the user as locked out
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "customer", user.uid);
          updateDoc(userDocRef, { isLockedOut: true });
        }
      }
      return newCount;
    });

    setIsModalVisible(false);
    setOrderInProgress(false);
    setOrderItems([]);
    setConfirmed(false);
    setIsPayPalVisible(false);
    setSpecialRemarks("");
    setPickupTime(""); // Reset any pickup time selection
    router.replace("order", { selectedItems: "[]", totalPrice: "0" });
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleOrderDone = async () => {
    setOrderInProgress(true);
    setOrderItems([]);
    setIsModalVisible(false);
    setConfirmed(false);
    setIsPayPalVisible(false); // Hide PayPal payment component

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("No user is currently logged in.");
      return;
    }

    const userId = user.uid;
    try {
      // Fetch the order data from the 'order' collection
      const q = query(collection(db, "order"), where("uid", "==", userId));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        const orderData = doc.data();

        // Add the order to the 'history' collection
        await addDoc(collection(db, "history"), orderData);

        // Delete the order from the 'order' collection
        await deleteDoc(doc.ref);
      });

      // After transferring the order, navigate back to the home screen
      router.replace("home"); // Ensure this line is executed after all operations
    } catch (error) {
      console.error("Error processing order:", error);
    } finally {
      setOrderInProgress(false); // Reset the order in progress state
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {timeoutTimestamp && timeRemaining > 0 && (
        <View style={styles.blockedMessageContainer}>
          <Text style={styles.blockedMessageText}>
            You cannot check out for another {formatTime(timeRemaining)}.
          </Text>
        </View>
      )}
      {!orderInProgress ? (
        <View style={styles.noOrderContainer}>
          <Text style={styles.noOrderMessage}>
            "Nothing brewing! Browse our tasty drink selection!"
          </Text>
          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => router.replace("home")}
          >
            <Text style={styles.backToHomeButtonText}>Browse</Text>
          </TouchableOpacity>
        </View>
      ) : hasOrders ? ( // Check for hasOrders instead of confirmed
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationMessage}>{confirmationMessage}</Text>
          <Text style={styles.orderIdText}>Order ID: {orderId}</Text>
          <FlatList
            data={orderItems}
            keyExtractor={(item) =>
              item.id ? item.id.toString() : Math.random().toString()
            }
            renderItem={renderSelectedItem}
            style={styles.list}
          />
          <Text style={styles.specialRemarks}>
            Special Remarks: {specialRemarks || "None"}
          </Text>
          <Text style={styles.specialRemarks}>Pick-up Time: {pickupTime}</Text>
          <Text style={styles.totalPrice}>
            Total Price: ₱{formattedTotalPrice.toFixed(2)}
          </Text>
          <TouchableOpacity style={styles.doneButton} onPress={handleOrderDone}>
            <Text style={styles.doneButtonText}>
              Cheers! My drinks are in hand!
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCancelOrder}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { overflow: "visible" }]}>
              <FlatList
                keyboardShouldPersistTaps="handled" // Allows taps on dropdown without dismissing it
                data={[
                  { key: "title", title: "Order Confirmation" },
                  {
                    key: "address",
                    title:
                      "Pick-up Address: Unit B VSL Bldg., 222 EJ Valdez St., Brgy. Ninoy Aquino, Marisol Subd., Angeles City",
                  },
                  ...orderItems.map((item) => ({
                    key: item.id.toString(),
                    item,
                  })),
                  {
                    key: "total",
                    title: `Total Price: ₱${formattedTotalPrice.toFixed(2)}`,
                  },
                  { key: "remarks", title: "Special Remarks" },
                ]}
                renderItem={({ item }) => {
                  if (item.key === "title") {
                    return <Text style={styles.modalTitle}>{item.title}</Text>;
                  } else if (item.key === "address") {
                    return <Text style={styles.cafeAddress}>{item.title}</Text>;
                  } else if (item.key === "total") {
                    return <Text style={styles.totalPrice}>{item.title}</Text>;
                  } else if (item.key === "remarks") {
                    return (
                      <TextInput
                        ref={remarksInputRef}
                        style={styles.remarksInput}
                        placeholder="Special Remarks"
                        value={specialRemarks}
                        onChangeText={setSpecialRemarks}
                      />
                    );
                  } else {
                    return renderSelectedItem({ item: item.item });
                  }
                }}
                ListHeaderComponent={() => (
                  <>
                    <Text style={styles.pickupLabel}>Pick-Up Time:</Text>
                    <Dropdown
                      style={styles.dropdown}
                      containerStyle={styles.dropdownContainer}
                      data={pickupTimeOptions}
                      labelField="label"
                      valueField="value"
                      placeholder="Select Time"
                      value={pickupTime}
                      onChange={(item) => {
                        setPickupTime(item.value);
                      }}
                    />
                  </>
                )}
                keyExtractor={(item) => item.key}
                ListFooterComponent={() => (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        !pickupTime && { backgroundColor: "#999" }, // Disabled color
                      ]}
                      onPress={handleConfirmPayment}
                      disabled={!pickupTime} // Disable button if no time is selected
                    >
                      <Text style={styles.confirmButtonText}>
                        Confirm Payment
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleCancelOrder}
                    >
                      <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
              />
            </View>
          </View>
        </Modal>
      )}
      {isPayPalVisible && (
        <PayPalPayment
          amount={formattedTotalPrice}
          onClose={handleOrderDone}
          onSuccess={handlePaymentSuccess}
        />
      )}
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#cfc1b1",
  },
  list: {
    marginBottom: 20,
  },
  noOrderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noOrderMessage: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#666",
    textAlign: "center",
  },
  backToHomeButton: {
    padding: 15,
    backgroundColor: "#4f3830",
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  backToHomeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },
  specialRemarks: {
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    marginTop: 5,
    color: "#4f3830",
  },
  itemContainer: {
    flexDirection: "row", // Align items in a row
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#4f3830",
    alignItems: "center", // Center align items vertically
  },
  itemImage: {
    width: 60, // Set a fixed width for the image
    height: 60, // Set a fixed height for the image
    borderRadius: 30, // Optional: make the image circular
    marginRight: 15, // Space between the image and text
  },
  itemDetails: {
    flex: 1,
    marginRight: 10, // Allow the text to take up remaining space
  },
  itemName: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },
  itemCustomization: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Montserrat_400Regular",
  },
  itemPrice: {
    fontSize: 16,
    marginTop: 5,
    fontFamily: "Montserrat_400Regular",
  },
  totalPrice: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    marginTop: 20,
    textAlign: "right",
  },
  confirmationContainer: {
    marginTop: 20,
  },
  confirmationMessage: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 10,
    color: "#4f3830",
  },
  confirmButton: {
    padding: 15,
    backgroundColor: "#4f3830",
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 10,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },
  doneButton: {
    padding: 15,
    backgroundColor: "#4f3830",
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    width: "100%",
    height: "100%", // Set a fixed height
    backgroundColor: "#e5dcd3",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 15,
    textAlign: "center",
  },
  closeButton: {
    padding: 15,
    backgroundColor: "#333",
    borderRadius: 30,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },

  cafeAddress: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 10,
    color: "#4f3830",
  },
  remarksInput: {
    height: 60,
    borderColor: "#4f3830",
    borderWidth: 1,
    borderRadius: 5,
    fontFamily: "Montserrat_400Regular",
    paddingHorizontal: 10,
    marginBottom: 20,
    marginTop: 20,
  },
  dropdown: {
    height: 50,
    borderColor: "#4f3830",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 20,
    zIndex: 1, // Ensure dropdown is above other components
  },
  dropdownContainer: {
    backgroundColor: "#eee", // Matches the dropdown for seamless design
    borderRadius: 5,
    borderColor: "#4f3830",
    fontFamily: "Montserrat_400Regular",
    elevation: 5, // Optional for shadow effect
  },
  pickupLabel: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    color: "#4f3830",
    marginBottom: 5,
  },
  toastContainer: {
    backgroundColor: "#4f3830",
    padding: 20,
    borderRadius: 8,
    margin: 10,
  },
  toastTitle: {
    color: "#d1c2b4",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },
  toastMessage: {
    color: "#fff",
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
  },
  orderIdText: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 10,
    color: "#4f3830",
  },
  blockedMessageContainer: {
    backgroundColor: "#4f3830",
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  blockedMessageText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
  },
});

export default Order;
