import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo"; // Import Entypo for the logout icon
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

const SearchBar = ({
  cartCount,
  searchQuery,
  setSearchQuery,
  onLogoutPress,
  cartItems = [], // Cart items to display in the modal
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible); // Toggle the modal visibility
  };

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return null; // You can return a loading indicator here if needed
  }

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
            <Text style={styles.modalTitle}>Your Cart</Text>

            {cartItems.length > 0 ? (
              <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id.toString()} // Assuming id is unique
                renderItem={({ item }) => (
                  <View style={styles.cartItem}>
                    <Text style={styles.cartItemText}>{item.name}</Text>

                    <Text style={styles.cartItemPrice}>
                      ₱{item.price.toFixed(2)}
                    </Text>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Aligns search bar and profile icon in a row
    justifyContent: "space-between", // Pushes elements apart
    alignItems: "center", // Aligns items vertically centered
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  cartItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
  },
  cartItemText: {
    fontSize: 16,
    color: "#333",
  },
  emptyCartText: {
    fontSize: 16,
    color: "#999",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#e5dcd3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#333",
  },
  cartItemPrice: {
    fontSize: 14,
    color: "#999",
  },
});

export default SearchBar;
