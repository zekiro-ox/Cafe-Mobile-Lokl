import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import CustomizationModal from "./CustomizationModal";
import { useRouter } from "expo-router";

const RadioButton = ({ selected, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.radioButtonContainer}>
      <View
        style={[styles.radioButton, selected && styles.radioButtonSelected]}
      >
        {selected && <View style={styles.radioButtonInner} />}
      </View>
    </TouchableOpacity>
  );
};
const SearchBar = ({
  cartCount,
  searchQuery,
  setSearchQuery,
  onLogoutPress,
  cartItems = [],
  setCartItems,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCartItems, setSelectedCartItems] = useState([]);
  const [customizationProduct, setCustomizationProduct] = useState(null);
  const [isCustomizationModalVisible, setCustomizationModalVisible] =
    useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const router = useRouter(); // Use useRouter for navigation

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const toggleCustomizationModal = () => {
    setCustomizationModalVisible(!isCustomizationModalVisible);
  };

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const calculateTotalPrice = () => {
    const total = cartItems.reduce((sum, item) => {
      const itemTotalPrice = item.totalPrice;
      return sum + (selectedCartItems.includes(item.id) ? itemTotalPrice : 0);
    }, 0);
    setTotalPrice(total);
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [cartItems, selectedCartItems]);

  const renderCartItem = ({ item }) => {
    const milkType = item.milkType;
    const addOns = Object.keys(item.addOns)
      .map((addOn) => `${item.addOns[addOn]} x ${addOn.replace("_", " ")}`)
      .join(", ");
    const sugarLevel = item.sugarLevel;
    const isSelected = selectedCartItems.includes(item.id);

    return (
      <View style={styles.cartItem}>
        <RadioButton
          selected={isSelected}
          onPress={() => {
            const newSelectedCartItems = isSelected
              ? selectedCartItems.filter((id) => id !== item.id)
              : [...selectedCartItems, item.id];

            setSelectedCartItems(newSelectedCartItems);
            calculateTotalPrice();
          }}
        />
        <View style={styles.cartItemImageContainer}>
          <Image source={item.image} style={styles.cartItemImage} />
        </View>
        <View style={styles.cartItemDetailsContainer}>
          <View style={styles.cartItemDetails}>
            <Text style={styles.cartItemText}>{item.name}</Text>
            <Text style={styles.cartItemPrice}>
              ₱{item.totalPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.cartItemCustomizationContainer}>
            <Text style={styles.cartItemCustomizationTitle}>
              Customization:
            </Text>
            <Text style={styles.cartItemCustomization}>Milk: {milkType}</Text>
            {addOns && (
              <Text style={styles.cartItemCustomization}>
                Add Ons: {addOns}
              </Text>
            )}
            <Text style={styles.cartItemCustomization}>
              Sugar Level: {sugarLevel}
            </Text>
          </View>
          <View style={styles.cartItemQuantityContainer}>
            <Text style={styles.cartItemCustomization}>
              Quantity: {item.quantity}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setCustomizationProduct(item);
                toggleCustomizationModal();
              }}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                const updatedCartItems = cartItems.filter(
                  (cartItem) => cartItem.id !== item.id
                );
                setCartItems(updatedCartItems);
                calculateTotalPrice(); // Recalculate total price after removing item
              }}
            >
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#737373"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search drinks..."
          placeholderTextColor="#737373"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity style={styles.cartContainer} onPress={toggleModal}>
          <MaterialIcons name="shopping-cart" size={24} color="#737373" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        <TouchableOpacity
          onPress={toggleDropdown}
          style={styles.profileIconContainer}
        >
          <FontAwesome name="user-circle" size={28} color="#737373" />
        </TouchableOpacity>

        {isDropdownVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              onPress={onLogoutPress}
              style={styles.dropdownItemContainer}
            >
              <Entypo
                name="log-out"
                size={16}
                color="#737373"
                style={styles.logoutIcon}
              />
              <Text style={styles.dropdownItem}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={toggleModal}
            >
              <Entypo name="cross" size={28} color="#737373" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Your Cart</Text>
            <View style={styles.scrollContainer}>
              {cartItems.length > 0 ? (
                <FlatList
                  data={cartItems}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderCartItem}
                  scrollEnabled={true}
                  style={{ maxHeight: 350 }}
                />
              ) : (
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
              )}
            </View>
            <Text style={styles.totalPriceText}>
              Total Price: ₱{totalPrice.toFixed(2)}
            </Text>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => {
                // Filter the cart items based on selectedCartItems
                const selectedItems = cartItems.filter((item) =>
                  selectedCartItems.includes(item.id)
                );

                // Prepare the selected items for the next screen, including customization details
                const serializedItems = selectedItems.map((item) => ({
                  ...item,
                  totalPrice: item.totalPrice.toFixed(2), // Format price as a string
                  addOns: item.addOns, // Include addOns if needed
                  milkType: item.milkType, // Include other customizations like milk type
                  sugarLevel: item.sugarLevel, // Include sugar level
                }));

                // Navigate to the Order screen with selected items and total price
                router.push({
                  pathname: "order",
                  params: {
                    selectedItems: JSON.stringify(serializedItems), // Stringify the items to pass in the URL params
                    totalPrice: totalPrice.toFixed(2), // Pass the formatted total price
                  },
                });

                toggleModal(); // Close the modal
              }}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomizationModal
        visible={isCustomizationModalVisible}
        onClose={toggleCustomizationModal}
        onAddToCart={(updatedProduct) => {
          const updatedCartItems = cartItems.map((cartItem) =>
            cartItem.id === updatedProduct.id ? updatedProduct : cartItem
          );
          setCartItems(updatedCartItems);
          calculateTotalPrice();
          toggleCustomizationModal();
        }}
        product={customizationProduct}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 10,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontFamily: "Montserrat_400Regular",
  },
  cartContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  cartBadge: {
    position: "absolute",
    right: -5,
    top: -8,
    backgroundColor: "#e5dcd3",
    borderRadius: 50,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  cartBadgeText: {
    color: "#000",
    fontSize: 8,
    fontFamily: "Montserrat_700Bold",
  },
  profileContainer: {
    position: "relative",
  },
  profileIconContainer: {
    paddingLeft: 10,
  },
  dropdownMenu: {
    position: "absolute",
    top: 35,
    right: 0,
    backgroundColor: "#e5dcd3",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    paddingVertical: 5,
    zIndex: 1,
    width: 120,
  },
  dropdownItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  dropdownItem: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
    marginLeft: 10,
    fontFamily: "Montserrat_400Regular",
  },
  logoutIcon: {
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Increased transparency
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#e5dcd3",
    borderRadius: 20,
    padding: 25,
    paddingTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 15,
    textAlign: "center",
  },
  emptyCartText: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 15,
    textAlign: "center",
  },
  scrollContainer: {
    maxHeight: 350, // Adjust this value to fit your design
    overflow: "scroll", // Allows scrolling if needed
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#4f3830",
    width: "100%",
  },
  cartItemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  cartItemImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  cartItemDetailsContainer: {
    flex: 1,
  },
  cartItemDetails: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  cartItemText: {
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 5,
  },
  cartItemCustomizationContainer: {
    marginTop: 10,
  },
  cartItemCustomizationTitle: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    color: "#333",
    marginBottom: 5,
  },
  cartItemCustomization: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    color: "#666",
  },
  closeIconContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
  },
  cartItemQuantityContainer: {
    marginTop: 10,
  },
  radioButtonContainer: {
    marginRight: 15,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#737373", // Outer border color
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#3b5998", // Color when selected
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3b5998", // Inner color when selected
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Align buttons evenly
    marginTop: 10,
  },
  editButton: {
    padding: 10,
    backgroundColor: "#4f3830",
    borderRadius: 15,
    flex: 1,
    marginRight: 5, // Add space between Edit and Remove buttons
  },
  editButtonText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Montserrat_700Bold", // Center the text
  },
  removeButton: {
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 15, // Make it circular
    width: 40, // Adjust width for better look
    height: 40, // Adjust height for better look
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Montserrat_700Bold", // Center the text
  },
  totalPriceText: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
    marginTop: 15,
    textAlign: "center",
  },
  checkoutButton: {
    marginTop: 10,
    backgroundColor: "#4f3830", // Set the color for the checkout button
    paddingVertical: 10, // Adjust the vertical padding
    paddingHorizontal: 20, // Set the left and right padding to a smaller value
    borderRadius: 15,
    alignItems: "center",
    width: 150, // Adjust the width to make it smaller
    alignSelf: "center", // Center the button within its container
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 15, // Adjusted font size for smaller button
    fontFamily: "Montserrat_700Bold",
  },
});

export default SearchBar;
