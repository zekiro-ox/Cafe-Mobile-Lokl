import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFonts, Montserrat_400Regular } from "@expo-google-fonts/montserrat";
import { ActivityIndicator } from "react-native";

const DrinkMenu = ({ onCategorySelect, selectedCategory }) => {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#675148" />;
  }

  // Updated drinks categories
  const drinks = [
    "All",
    "Hot Drinks",
    "Ice Blended",
    "Mocktails",
    "Non-Coffee",
    "Tea",
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.menuContainer}
    >
      {drinks.map((drink, index) => (
        <TouchableOpacity key={index} onPress={() => onCategorySelect(drink)}>
          <View
            style={[
              styles.menuItem,
              drink === selectedCategory && styles.activeMenuItem,
            ]}
          >
            <Text
              style={[
                styles.menuText,
                drink === selectedCategory && styles.activeMenuText,
              ]}
            >
              {drink}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  menuItem: {
    backgroundColor: "#e5dcd3",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  activeMenuItem: {
    backgroundColor: "#4f3830", // Active category color
  },
  menuText: {
    color: "#d1c2b4",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat_400Regular",
  },
  activeMenuText: {
    color: "#d1c2b4", // Text color for active category
  },
});

export default DrinkMenu;
