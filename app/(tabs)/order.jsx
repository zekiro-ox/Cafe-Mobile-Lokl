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

  useEffect(() => {
    if (parsedItems.length > 0 && !confirmed) {
      setOrderItems(parsedItems);
      setIsModalVisible(true);
      setOrderInProgress(true);
    }
  }, [parsedItems, confirmed]);

  const renderSelectedItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemCustomization}>
        Milk Type: {item.milkType}, Sugar Level: {item.sugarLevel}
      </Text>
      {item.addOns && (
        <Text style={styles.itemCustomization}>
          Add Ons:{" "}
          {Object.keys(item.addOns)
            .map(
              (addOn) => `${item.addOns[addOn]} x ${addOn.replace("_", " ")}`
            )
            .join(", ")}
        </Text>
      )}
      <Text style={styles.itemPrice}>₱{item.totalPrice}</Text>
    </View>
  );

  const handleConfirmPayment = () => {
    setIsModalVisible(false);
    setConfirmed(true);
  };

  const handleCancelOrder = () => {
    setIsModalVisible(false);
    setOrderInProgress(false);
    setOrderItems([]);
    setConfirmed(false);
    router.replace("order", { selectedItems: "[]", totalPrice: "0" });
  };

  const handleOrderDone = () => {
    // Clear the order and show the "No Order" message
    setOrderInProgress(false);
    setOrderItems([]);
    setConfirmed(false);
    setIsModalVisible(false);
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
    borderRadius: 15,
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
    borderRadius: 15,
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
    borderRadius: 15,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },
});

export default Order;
