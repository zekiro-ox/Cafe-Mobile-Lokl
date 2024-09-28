import React from "react";
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useFonts } from "expo-font";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

const { height: screenHeight } = Dimensions.get("window");

const CustomizationModal = ({ visible, onClose, onAddToCart, product }) => {
  if (!product) {
    return null; // Or handle it in a way that suits your app
  }
  const productName = product.name || "Product"; // Default to "Product" if name is not defined
  const productDescription = product.description || "No description available"; // Default if description is not defined
  const productPrice = product.price || 0;

  // Default if price is not defined

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  // Define options for all customizations
  const milkOptions = [
    { label: "Almond Milk", value: "almond" },
    { label: "Soy Milk", value: "soy" },
  ];

  const addOnOptions = [
    { label: "Espresso Shots", value: "espresso_shots", price: 10 },
    { label: "Milk", value: "milk", price: 5 },
    { label: "Dark Chocolate", value: "dark_chocolate", price: 15 },
    { label: "Chocolate", value: "chocolate", price: 10 },
  ];

  const sugarLevels = [
    { label: "No Sugar", value: "none" },
    { label: "Regular Sugar", value: "regular" },
    { label: "Less Sugar", value: "less" },
  ];

  // State to keep track of selected options
  const [selectedMilk, setSelectedMilk] = React.useState(
    product?.milkType || milkOptions[0]?.value
  );

  const [selectedAddOns, setSelectedAddOns] = React.useState(
    addOnOptions.reduce((acc, option) => {
      acc[option.value] = product?.addOns?.[option.value] || 0; // Use optional chaining
      return acc;
    }, {})
  );

  const [selectedSugar, setSelectedSugar] = React.useState(
    product?.sugarLevel || sugarLevels[0]?.value
  );

  const [productQuantity, setProductQuantity] = React.useState(
    product?.quantity || 1
  );

  const handleAddToCart = () => {
    const totalPrice = calculateTotalPrice(); // Get the calculated total price
    onAddToCart({
      ...product,
      milkType: selectedMilk,
      addOns: selectedAddOns,
      sugarLevel: selectedSugar,
      totalPrice, // Include total price instead of productPrice
      quantity: productQuantity, // Include product quantity
    });
    onClose(); // Close the modal after adding to cart
  };

  // Function to handle incrementing and decrementing add-on counts
  const updateAddOnCount = (value, increment) => {
    setSelectedAddOns((prev) => {
      const newCount = prev[value] + increment;
      return { ...prev, [value]: newCount < 0 ? 0 : newCount }; // Prevent count from going below 0
    });
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    let totalPrice = productPrice * productQuantity; // Base price multiplied by quantity
    Object.keys(selectedAddOns).forEach((addOn) => {
      const addOnOption = addOnOptions.find((option) => option.value === addOn);
      if (addOnOption) {
        const addOnPrice = addOnOption.price;
        totalPrice += addOnPrice * selectedAddOns[addOn];
      }
    });
    return totalPrice;
  };

  // Function to handle incrementing and decrementing the product quantity
  const updateProductQuantity = (increment) => {
    setProductQuantity((prev) => {
      const newQuantity = prev + increment;
      return newQuantity < 1 ? 1 : newQuantity; // Prevent quantity from going below 1
    });
  };

  // Unified function for rendering option sections
  const renderOptionSection = (
    title,
    options,
    handleSelection,
    selectedValue
  ) => (
    <View style={[styles.optionContainer, styles.shadowStyle]}>
      <Text style={styles.optionTitle}>{title}</Text>
      {title === "Add Ons"
        ? options.map((option) => (
            <View key={option.value} style={styles.addOnContainer}>
              <Text style={styles.radioButtonText}>{option.label}</Text>
              <Text style={styles.addOnPriceText}>₱{option.price}</Text>
              <View style={styles.addOnControls}>
                <TouchableOpacity
                  onPress={() => updateAddOnCount(option.value, -1)}
                >
                  <Text style={styles.controlButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.addOnCountText}>
                  {selectedAddOns[option.value]}
                </Text>
                <TouchableOpacity
                  onPress={() => updateAddOnCount(option.value, 1)}
                >
                  <Text style={styles.controlButton}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        : options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.radioButtonContainer}
              onPress={() => handleSelection(option.value)}
            >
              <Text style={styles.radioButtonText}>{option.label}</Text>
              {title !== "Add Ons" && (
                <View
                  style={[
                    styles.radioButton,
                    selectedValue === option.value &&
                      styles.selectedRadioButton,
                  ]}
                />
              )}
            </TouchableOpacity>
          ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {product.image && (
            <Image
              source={product.image}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}

          {/* Updated Title Section */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{productName}</Text>
            <Text style={styles.price}>₱{productPrice}</Text>
          </View>

          {/* Description Below the Title */}
          <Text style={styles.description}>{productDescription}</Text>

          {/* Render sections */}
          {renderOptionSection(
            "Milk Option",
            milkOptions,
            setSelectedMilk,
            selectedMilk
          )}
          {renderOptionSection("Add Ons", addOnOptions, null, selectedAddOns)}
          {renderOptionSection(
            "Sugar Level",
            sugarLevels,
            setSelectedSugar,
            selectedSugar
          )}

          {/* Quantity Section */}
          <View style={[styles.optionContainer, styles.shadowStyle]}>
            <View style={styles.quantityHeader}>
              <Text style={styles.optionTitle}>Quantity</Text>
              <View style={styles.addOnControls}>
                <TouchableOpacity onPress={() => updateProductQuantity(-1)}>
                  <Text style={styles.controlButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.addOnCountText}>{productQuantity}</Text>
                <TouchableOpacity onPress={() => updateProductQuantity(1)}>
                  <Text style={styles.controlButton}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={[styles.optionContainer, styles.shadowStyle]}>
            <Text style={styles.optionTitle}>Total Price</Text>
            <Text style={styles.totalPriceText}>₱{calculateTotalPrice()}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#cfc1b1",
  },
  productImage: {
    width: "100%",
    height: screenHeight * 0.35,
    marginBottom: 20,
    borderRadius: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    padding: 20,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Center items vertically
    marginBottom: 10,
    flex: 1, // Use flex to allow items to expand equally
  },
  title: {
    fontSize: 22,
    marginBottom: 0, // Remove marginBottom to align better
    textAlign: "left", // Align text to the left
    fontFamily: "Montserrat_700Bold",
    flex: 1, // Allow title to take available space
  },
  price: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#4f3830", // Adjust as needed
    textAlign: "right", // Align text to the right
    flex: 1, // Allow price to take available space
  },
  description: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  addOnContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  addOnControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  addOnCountText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
  },
  controlButton: {
    fontSize: 20,
    width: 30,
    textAlign: "center",
    color: "#4f3830",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4f3830",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  selectedRadioButton: {
    backgroundColor: "#4f3830",
  },
  radioButtonText: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    flex: 1,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    padding: 15,
    backgroundColor: "#4f3830",
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Montserrat_400Regular",
  },
  shadowStyle: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android
  },
  optionContainer: {
    marginVertical: 10,
    borderRadius: 15, // Optional: for rounded corners
    backgroundColor: "#fff",
    padding: 20,
    backgroundColor: "#e5dcd3", // Optional: to ensure a background to see the shadow
  },
  optionTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Montserrat_700Bold",
  },
  addOnPriceText: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    marginRight: 10,
  },
  totalPriceText: {
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 10,
    textAlign: "center",
  },
  quantityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default CustomizationModal;