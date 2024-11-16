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
import Toast from "react-native-toast-message"; // Import Toast
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

const { height: screenHeight } = Dimensions.get("window");

const toastConfig = {
  info: ({ text1, text2 }) => (
    <View style={styles.toastContainer}>
      <Text style={styles.toastTitle}>{text1}</Text>
      <Text style={styles.toastMessage}>{text2}</Text>
    </View>
  ),
  // You can add more custom types (success, error, etc.) here
};

const CustomizationModal = ({
  visible,
  onClose,
  onAddToCart,
  product = {},
}) => {
  const router = useRouter();
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

  // New state to track alerted ingredients
  const [alertedIngredients, setAlertedIngredients] = React.useState({});

  useEffect(() => {
    if (visible && product) {
      const initialIngredients = Array.isArray(product.ingredients)
        ? product.ingredients.reduce((acc, ingredient) => {
            if (ingredient && ingredient.name && ingredient.price) {
              const recommendedAmount = isNaN(
                parseFloat(ingredient.recommendedAmount)
              )
                ? ingredient.recommendedAmount
                : parseFloat(ingredient.recommendedAmount);

              acc[ingredient.name] = {
                quantity: ingredient.quantity || 0,
                price: parseFloat(ingredient.price),
                recommendedAmount: recommendedAmount || "N/A",
              };
            } else {
              console.warn("Invalid ingredient:", ingredient);
            }
            return acc;
          }, {})
        : {};

      setTimeout(() => {
        setCustomization((prevCustomization) => ({
          productQuantity:
            product.quantity || prevCustomization.productQuantity,
          selectedIngredients: initialIngredients,
        }));

        // Reset alerted ingredients when modal opens
        setAlertedIngredients({});

        // Show toast message when modal opens
        Toast.show({
          text1: "Customize your drinks!",
          text2: "Press the recommended icon for best drinks!",
          position: "top",
          visibilityTime: 4000,
          autoHide: true,
          type: "info",
        });
      }, 0);
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
      ingredients: ingredientsToAdd,
    });
    onClose();
  };

  const handleOrderNow = () => {
    const totalPrice = calculateTotalPrice();
    const ingredientsToAdd = Object.entries(
      customization.selectedIngredients
    ).map(([name, { quantity, price, recommendedAmount }]) => ({
      name,
      quantity,
      price,
      recommendedAmount,
    }));

    // Serialize item data
    const serializedItem = {
      id: product.id,
      name: productName,
      totalPrice,
      quantity: customization.productQuantity,
      ingredients: ingredientsToAdd,
    };

    // Navigate to the Order page and pass the serialized data
    router.push({
      pathname: "order",
      params: {
        selectedItems: JSON.stringify([serializedItem]),
        totalPrice: totalPrice.toFixed(2),
      },
    });
    onClose(); // Close the modal after ordering
  };

  const updateIngredientQuantity = (ingredientName, increment) => {
    setCustomization((prev) => {
      const currentIngredient = prev.selectedIngredients[ingredientName] || {
        quantity: 0,
      };
      const newQuantity = currentIngredient.quantity + increment;

      // Show toast for recommended amount when increasing quantity
      if (increment > 0 && !alertedIngredients[ingredientName]) {
        const recommendedAmount = currentIngredient.recommendedAmount;

        // Show toast message instead of alert
        Toast.show({
          text1: "Recommended Amount",
          text2: `The recommended amount for ${ingredientName} is ${recommendedAmount}.`,
          position: "top",
          visibilityTime: 4000,
          autoHide: true,
          type: "info", // You can change this to 'success', 'error', etc.
        });

        // Use setTimeout to defer the state update to the next render cycle
        setTimeout(() => {
          setAlertedIngredients((prevAlerted) => ({
            ...prevAlerted,
            [ingredientName]: true,
          }));
        }, 0);
      }

      return {
        ...prev,
        selectedIngredients: {
          ...prev.selectedIngredients,
          [ingredientName]: {
            ...currentIngredient,
            quantity: Math.max(newQuantity, 0),
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
        productQuantity: Math.max(newQuantity, 1),
      };
    });
  };

  const renderIngredientsSection = () => (
    <View style={[styles.optionContainer, styles.shadowStyle]}>
      <View style={styles.ingredientsHeader}>
        <Text style={styles.optionTitle}>Ingredients</Text>
        <TouchableOpacity
          onPress={() => {
            setCustomization((prev) => {
              const updatedIngredients = { ...prev.selectedIngredients };
              Object.keys(updatedIngredients).forEach((ingredientName) => {
                const recommendedAmount =
                  updatedIngredients[ingredientName].recommendedAmount;
                updatedIngredients[ingredientName].quantity = recommendedAmount; // Set to recommended amount
              });
              return {
                ...prev,
                selectedIngredients: updatedIngredients,
              };
            });

            // Show a toast message when the recommended icon is clicked
            Toast.show({
              text1: "Drinks Customized!",
              text2: "Crafted to Perfection, Sip by Sip!",
              position: "top",
              visibilityTime: 4000,
              autoHide: true,
              type: "info",
            });
          }}
        >
          <MaterialIcons name="recommend" size={24} color="#4f3830" />
        </TouchableOpacity>
      </View>
      {Array.isArray(product.ingredients) && product.ingredients.length > 0 ? (
        product.ingredients.map((ingredient, index) => {
          if (ingredient && ingredient.name && ingredient.price) {
            const ingredientPrice = parseFloat(ingredient.price);
            const recommendedAmount = isNaN(
              parseFloat(ingredient.recommendedAmount)
            )
              ? ingredient.recommendedAmount
              : parseFloat(ingredient.recommendedAmount);

            return (
              <View key={index} style={styles.addOnContainer}>
                <Text style={styles.radioButtonText}>{ingredient.name}</Text>
                <Text style={styles.addOnPriceText}>
                  ₱{ingredientPrice.toFixed(2)}
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
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="arrow-back-circle" size={40} color="#4f3830" />
        </TouchableOpacity>
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
            <TouchableOpacity style={styles.button} onPress={handleOrderNow}>
              <Text style={styles.buttonText}>Order Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Toast config={toastConfig} />
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
  closeButton: {
    position: "absolute",
    top: 8,
    left: 25,
    zIndex: 1,
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
  ingredientsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Center items vertically
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
  toastContainer: {
    backgroundColor: "#4f3830", // Background color of the toast
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
  recommendIcon: {
    marginLeft: 10, // Add some spacing
  },
});

export default CustomizationModal;
