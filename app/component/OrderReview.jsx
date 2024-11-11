// OrderReview.js
import React from "react";
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Dimensions,
} from "react-native";

const { height: screenHeight } = Dimensions.get("window");

const OrderReview = ({
  visible,
  orderItems,
  totalPrice,
  onConfirmPayment,
  onCancelOrder,
}) => {
  const renderSelectedItem = ({ item }) => {
    if (!item || !item.name) {
      return null;
    }
    return (
      <View style={styles.itemContainer}>
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
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Review Your Order</Text>
        <FlatList
          data={orderItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSelectedItem}
          style={styles.list}
          ListFooterComponent={
            <>
              <Text style={styles.totalPrice}>
                Total Price: ₱{totalPrice.toFixed(2)}
              </Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onConfirmPayment}
              >
                <Text style={styles.confirmButtonText}>Confirm Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancelOrder}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e5dcd3",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 15,
    textAlign: "center",
  },
  list: {
    marginBottom: 20,
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
  cancelButton: {
    padding: 15,
    backgroundColor: "#333",
    borderRadius: 30,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },
});

export default OrderReview;
