import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
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
} from "firebase/firestore"; // Import necessary Firestore functions
import { getAuth } from "firebase/auth";

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

  useEffect(() => {
    if (parsedItems.length > 0 && !confirmed) {
      setOrderItems(parsedItems);
      setIsModalVisible(true);
      setOrderInProgress(true);
    }
    console.log("Parsed Items:", parsedItems);
  }, [parsedItems, confirmed]);

  const renderSelectedItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      {item.ingredients && item.ingredients.length > 0 && (
        <Text style={styles.itemCustomization}>
          Ingredients:{" "}
          {item.ingredients
            .map((ingredient) => `${ingredient.name} x ${ingredient.quantity}`)
            .join(", ")}
        </Text>
      )}
      <Text style={styles.itemPrice}>₱{item.totalPrice}</Text>
    </View>
  );

  const handleConfirmPayment = () => {
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
          createdAt: new Date(),
        };

        await addDoc(collection(db, "order"), orderData);
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
    setIsModalVisible(true);
    setOrderInProgress(false);
    setOrderItems([]);
    setConfirmed(false);
    setIsPayPalVisible(false); // Hide PayPal payment component
    router.replace("order", { selectedItems: "[]", totalPrice: "0" });
  };

  const handleOrderDone = async () => {
    setOrderInProgress(true);
    setOrderItems([]);
    setConfirmed(false);
    setIsModalVisible(false);
    setIsPayPalVisible(false); // Hide PayPal payment component

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("No user is currently logged in.");
      return;
    }

    const userId = user.uid;

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

    // After transferring the order, reset the state to show no orders
    router.replace("order", { selectedItems: "[]", totalPrice: "0" });
  };

  return (
    <SafeAreaView style={styles.container}>
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
      ) : confirmed ? (
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationMessage}>
            Order confirmed! It will take 20 mins before availability for pick
            up.
          </Text>
          <FlatList
            data={orderItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSelectedItem}
            style={styles.list}
          />
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
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Review Your Order</Text>
              <FlatList
                data={orderItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderSelectedItem}
                style={styles.list}
              />
              <Text style={styles.totalPrice}>
                Total Price: ₱{formattedTotalPrice.toFixed(2)}
              </Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmPayment}
              >
                <Text style={styles.confirmButtonText}>Confirm Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancelOrder}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
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
  itemContainer: {
    flexDirection: "column",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#4f3830",
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
    width: "85%",
    backgroundColor: "#e5dcd3",
    borderRadius: 20,
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
});

export default Order;
