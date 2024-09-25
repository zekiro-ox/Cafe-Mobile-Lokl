import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
  onLogoutPress, // Function to handle logout action
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
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

        <TouchableOpacity style={styles.cartContainer}>
          <MaterialIcons name="shopping-cart" size={24} color="#737373" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Icon and Dropdown */}
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
    flex: 1, // Makes the search bar take up available space
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
    fontFamily: "Montserrat_400Regular", // Use Montserrat font
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
    backgroundColor: "#e5dcd3", // Badge color
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
    position: "relative", // Allows the dropdown to be positioned relative to the profile icon
  },
  profileIconContainer: {
    paddingLeft: 10,
  },
  dropdownMenu: {
    position: "absolute",
    top: 35, // Positioning the dropdown below the profile icon
    right: 0,
    backgroundColor: "#e5dcd3",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Shadow effect for Android
    paddingVertical: 5,
    zIndex: 1,
    width: 120, // Set the width for the dropdown
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
    fontWeight: "600", // Semi-bold text
    marginLeft: 10, // Space between the icon and text
    fontFamily: "Montserrat_400Regular", // Use Montserrat font
  },
  logoutIcon: {
    marginRight: 10, // Space between the icon and text
  },
});

export default SearchBar;
