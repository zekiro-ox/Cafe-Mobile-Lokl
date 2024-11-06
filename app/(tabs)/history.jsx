import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../config/firebase"; // Adjust the path as necessary
import { collection, query, where, getDocs } from "firebase/firestore"; // Import necessary Firestore functions
import { getAuth } from "firebase/auth";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useFonts } from "expo-font";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  useEffect(() => {
    const fetchHistory = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is currently logged in.");
        setLoading(false);
        return;
      }

      const userId = user.uid;

      try {
        // Query the history collection for documents matching the user's UID
        const q = query(collection(db, "history"), where("uid", "==", userId));
        const querySnapshot = await getDocs(q);

        const fetchedHistory = [];
        querySnapshot.forEach((doc) => {
          fetchedHistory.push({ id: doc.id, ...doc.data() });
        });

        setHistoryData(fetchedHistory);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"));
        const querySnapshot = await getDocs(q);

        const fetchedProducts = [];
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() });
        });

        setProductsData(fetchedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err);
      }
    };

    fetchHistory();
    fetchProducts();
  }, []);

  const addToCart = (order) => {
    console.log("Adding to cart:", order);

    // Navigate to the Order screen and pass the order data
    router.push("order", {
      selectedItems: JSON.stringify([
        {
          name: order.productName,
          ingredients: order.ingredients,
          quantity: order.quantity || 1,
        },
      ]), // Pass the selected product as an array
      totalPrice: order.totalPrice, // Assuming order has a totalPrice property
    });
  };

  const getImageUrl = (productName) => {
    const product = productsData.find((prod) => prod.name === productName);
    return product ? product.image : null; // Return the image URL or null if not found
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.cartItem}>
        <View style={styles.cartItemImageContainer}>
          <Image
            source={{ uri: getImageUrl(item.productName) }} // Get the image using product name
            style={styles.cartItemImage}
          />
        </View>
        <View style={styles.cartItemDetailsContainer}>
          <Text style={styles.cartItemText}>{item.productName}</Text>
          <Text style={styles.cartItemCustomizationTitle}>Ingredients:</Text>
          {item.ingredients.map((ingredient, index) => (
            <Text key={index} style={styles.cartItemCustomization}>
              - {ingredient.name} x {ingredient.quantity}
            </Text>
          ))}
        </View>
        <TouchableOpacity onPress={() => addToCart(item)}>
          <MaterialIcons name="add-shopping-cart" size={24} color="#4f3830" />
        </TouchableOpacity>
      </View>
      <Text style={styles.itemDetails}>
        Total Price: ₱{item.totalPrice ? item.totalPrice.toFixed(2) : "N/A"}
      </Text>
      <Text style={styles.itemDetails}>
        Date: {new Date(item.createdAt.seconds * 1000).toLocaleString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error fetching history: {error.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.catchyPhrase}>
        Ready to enjoy your favorites again? Order your last drinks now!
      </Text>
      {historyData.length === 0 ? (
        <Text>No order history found.</Text>
      ) : (
        <FlatList
          data={historyData}
          keyExtractor={(item) => item.id} // Each order has its own document ID
          renderItem={renderHistoryItem}
          style={styles.list}
        />
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
  catchyPhrase: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#4f3830",
  },
  itemContainer: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#e5dcd3",
    borderRadius: 10,
    borderColor: "#4f3830",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#4f3830",
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
  cartItemText: {
    fontSize: 16,
    fontFamily: "Montserrat_700Bold",
  },
  cartItemCustomizationTitle: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    color: "#333",
  },
  cartItemCustomization: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    color: "#666",
  },
  itemDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});

export default History;
