import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const Order = () => {
  const router = useRouter();

  // Check if router.query exists before destructuring
  const { selectedItems = [], totalPrice = 0 } = router.query || {};

  // Convert totalPrice to a number if necessary
  const formattedTotalPrice = parseFloat(totalPrice) || 0;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const renderSelectedItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₱{item.totalPrice.toFixed(2)}</Text>
      </View>
    );
  };

  const handleConfirmPayment = () => {
    alert("Payment processed!");
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>
      <FlatList
        data={Array.isArray(selectedItems) ? selectedItems : []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSelectedItem}
        style={styles.list}
      />
      <Text style={styles.totalPrice}>
        Total Price: ₱{formattedTotalPrice.toFixed(2)}
      </Text>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => setIsModalVisible(true)} // Show modal when confirming payment
      >
        <Text style={styles.confirmButtonText}>Review Order</Text>
      </TouchableOpacity>

      {/* Modal for review */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)} // Close modal on back press
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Review Your Order</Text>
            <FlatList
              data={Array.isArray(selectedItems) ? selectedItems : []}
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
              onPress={() => setIsModalVisible(false)} // Close modal
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  list: {
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemName: {
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 16,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "right",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent background
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
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
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#f44336", // Red color for close button
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Order;
