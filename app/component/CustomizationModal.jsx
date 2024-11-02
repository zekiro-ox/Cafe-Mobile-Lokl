import React, { useEffect } from "react";
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

const CustomizationModal = ({
  visible,
  onClose,
  onAddToCart,
  product = {},
}) => {
  if (!product) {
    return null; // Or render a loading state or an error message
  }

  const productName = product.name || "Product";
  const productDescription = product.description || "No description available";
  const productPrice = parseFloat(product.price) || 0;

  const [customization, setCustomization] = React.useState({
    productQuantity: 1,
    selectedIngredients: {},
  });

  useEffect(() => {
    if (visible && product) {
      const initialIngredients = Array.isArray(product.ingredients)
        ? product.ingredients.reduce((acc, ingredient) => {
            if (ingredient && ingredient.name && ingredient.price) {
              // Check if recommendedAmount is a valid number before parsing
              const recommendedAmount = isNaN(
                parseFloat(ingredient.recommendedAmount)
              )
                ? ingredient.recommendedAmount
                : parseFloat(ingredient.recommendedAmount);

              acc[ingredient.name] = {
                quantity: ingredient.quantity || 0, // Use the passed quantity
                price: parseFloat(ingredient.price), // Store price
                recommendedAmount: recommendedAmount || "N/A", // Store recommended amount or fallback
              };
            } else {
              console.warn("Invalid ingredient:", ingredient);
            }
            return acc;
          }, {})
        : {};

      setCustomization((prevCustomization) => ({
        productQuantity: product.quantity || prevCustomization.productQuantity,
        selectedIngredients: initialIngredients,
      }));
    }
  }, [visible, product]);

  const handleAddToCart = () => {
    const totalPrice = calculateTotalPrice();
    const ingredientsToAdd = Object.entries(
      customization.selectedIngredients
    ).map(([name, { quantity, price, recommendedAmount }]) => ({
      name,
      quantity,
      price,
      recommendedAmount,
    }));

    onAddToCart({
      ...product,
      totalPrice,
      quantity: customization.productQuantity,
      ingredients: ingredientsToAdd, // Pass structured ingredients
    });
    onClose();
  };

  const updateIngredientQuantity = (ingredientName, increment) => {
    setCustomization((prev) => {
      const currentIngredient = prev.selectedIngredients[ingredientName] || {
        quantity: 0,
      };
      const newQuantity = currentIngredient.quantity + increment;
      return {
        ...prev,
        selectedIngredients: {
          ...prev.selectedIngredients,
          [ingredientName]: {
            ...currentIngredient,
            quantity: Math.max(newQuantity, 0), // Ensure quantity doesn't go below 0
          },
        },
      };
    });
  };

  const calculateTotalPrice = () => {
    let totalPrice = productPrice * customization.productQuantity;

    Object.keys(customization.selectedIngredients).forEach((ingredient) => {
      const { price, quantity } = customization.selectedIngredients[ingredient];
      totalPrice += price * quantity * customization.productQuantity;
    });

    return totalPrice;
  };

  const updateProductQuantity = (increment) => {
    setCustomization((prev) => {
      const newQuantity = prev.productQuantity + increment;
      return {
        ...prev,
        productQuantity: Math.max(newQuantity, 1), // Ensure quantity is at least 1
      };
    });
  };

  const renderIngredientsSection = () => (
    <View style={[styles.optionContainer, styles.shadowStyle]}>
      <Text style={styles.optionTitle}>Ingredients</Text>
      {Array.isArray(product.ingredients) && product.ingredients.length > 0 ? (
        product.ingredients.map((ingredient, index) => {
          if (ingredient && ingredient.name && ingredient.price) {
            const ingredientPrice = parseFloat(ingredient.price); // Convert price to number
            const recommendedAmount = isNaN(
              parseFloat(ingredient.recommendedAmount)
            )
              ? ingredient.recommendedAmount
              : parseFloat(ingredient.recommendedAmount);
            // Use the recommended amount from Firestore

            return (
              <View key={index} style={styles.addOnContainer}>
                <Text style={styles.radioButtonText}>{ingredient.name}</Text>
                <Text style={styles.addOnPriceText}>
                  ₱{ingredientPrice.toFixed(2)}
                </Text>
                <Text style={styles.radioButtonText}>
                  Recommended Amount:{" "}
                  {
                    customization.selectedIngredients[ingredient.name]
                      ?.recommendedAmount
                  }
                </Text>
                <View style={styles.addOnControls}>
                  <TouchableOpacity
                    onPress={() =>
                      updateIngredientQuantity(ingredient.name, -1)
                    }
                  >
                    <Text style={styles.controlButton}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.addOnCountText}>
                    {customization.selectedIngredients[ingredient.name]
                      ?.quantity || 0}
                  </Text>
                  <TouchableOpacity
                    onPress={() => updateIngredientQuantity(ingredient.name, 1)}
                  >
                    <Text style={styles.controlButton}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          } else {
            console.warn(`Invalid ingredient at index ${index}:`, ingredient);
            return null; // Skip invalid ingredient
          }
        })
      ) : (
        <Text>No ingredients available.</Text>
      )}
    </View>
  );
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {product.image && (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{productName}</Text>
            <Text style={styles.price}>₱{productPrice}</Text>
          </View>
          <Text style={styles.description}>{productDescription}</Text>

          {renderIngredientsSection()}

          <View style={[styles.optionContainer, styles.shadowStyle]}>
            <View style={styles.quantityHeader}>
              <Text style={styles.optionTitle}>Quantity</Text>
              <View style={styles.addOnControls}>
                <TouchableOpacity onPress={() => updateProductQuantity(-1)}>
                  <Text style={styles.controlButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.addOnCountText}>
                  {customization.productQuantity}
                </Text>
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
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Montserrat_700Bold",
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
