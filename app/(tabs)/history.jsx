import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../config/firebase"; // Adjust the path as necessary
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore"; // Import necessary Firestore functions
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
  const [userProfile, setUserProfile] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isEditingName, setIsEditingName] = useState(false); // New state for editing name
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
        const q = query(collection(db, "history"), where("uid", "==", userId));
        const querySnapshot = await getDocs(q);

        const fetchedHistory = [];
        querySnapshot.forEach((doc) => {
          fetchedHistory.push({ id: doc.id, ...doc.data() });
        });

        // Sort the fetched history by createdAt in descending order
        fetchedHistory.sort((a, b) => {
          return b.createdAt.seconds - a.createdAt.seconds; // Sort by seconds
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

    const fetchUserProfile = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "customer", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const profileData = userDoc.data();
          setUserProfile(profileData);
          setName(profileData.name || "");
          setEmail(profileData.email || "No email provided");
        }
      }
    };

    fetchHistory();
    fetchProducts();
    fetchUserProfile(); // Fetch user profile data
  }, []);

  const addToCart = (order) => {
    console.log("Adding to cart:", order);

    const ingredientsForCart = order.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      price: ingredient.price,
    }));

    const serializedItem = {
      id: order.id,
      name: order.productName,
      ingredients: ingredientsForCart,
      quantity: order.quantity || 0,
      totalPrice: order.totalPrice.toFixed(2) || 0,
    };

    router.push({
      pathname: "order",
      params: {
        selectedItems: JSON.stringify([serializedItem]),
        totalPrice: order.totalPrice.toFixed(2),
      },
    });
  };

  const getImageUrl = (productName) => {
    const product = productsData.find((prod) => prod.name === productName);
    return product ? product.image : null;
  };

  const handleRate = async (historyId, productName, newRating) => {
    const product = productsData.find((prod) => prod.name === productName);

    if (!product) {
      console.error("Product not found in products data");
      return;
    }

    const productRef = doc(db, "products", product.id);

    try {
      const productDoc = await getDoc(productRef);
      if (productDoc.exists()) {
        const productData = productDoc.data();

        // Initialize rating counts if they don't exist
        const updatedRatings = {
          1: productData.rating?.["1"] || 0,
          2: productData.rating?.["2"] || 0,
          3: productData.rating?.["3"] || 0,
          4: productData.rating?.["4"] || 0,
          5: productData.rating?.["5"] || 0,
        };

        // Increment the count for the new rating
        updatedRatings[newRating] += 1;

        await updateDoc(productRef, {
          rating: updatedRatings,
        });

        // Save the user's rating in the history document
        const historyRef = doc(db, "history", historyId);
        await updateDoc(historyRef, {
          rating: newRating, // Save the user's rating
        });

        // Update local historyData to reflect the new rating
        setHistoryData((prevHistory) =>
          prevHistory.map((item) =>
            item.id === historyId
              ? { ...item, rating: newRating } // Update the local history with the new rating
              : item
          )
        );

        console.log("Rating updated successfully!");
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  const handleSaveProfile = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid; // Get the current user's ID
      const userDocRef = doc(db, "customer", userId); // Reference to the user document

      try {
        // Update the user's name and email in Firestore
        await updateDoc(userDocRef, { name, email });
        setUserProfile({ ...userProfile, name, email }); // Update local state
        setIsEditingName(false); // Exit edit mode
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };

  const handleSendFeedback = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid; // Get the current user's ID
      const userDocRef = doc(db, "customer", userId); // Reference to the user document

      try {
        // Update the user's feedback in Firestore
        await updateDoc(userDocRef, {
          feedback: feedback,
        });
        console.log("Feedback sent:", feedback);
        setFeedback(""); // Clear the feedback input
      } catch (error) {
        console.error("Error sending feedback: ", error);
      }
    }
  };

  const StarRating = ({ rating, onRate }) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              console.log(`Rating selected: ${star}`);
              onRate(star);
            }}
          >
            <MaterialIcons
              name={star <= rating ? "star" : "star-border"}
              size={24}
              color={star <= rating ? "#caad13" : "#ccc"} // Change color based on rating
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderHistoryItem = ({ item }) => {
    const userRating = item.rating || 0; // Default to 0 if no rating exists

    return (
      <View style={styles.itemContainer}>
        <View style={styles.cartItem}>
          <View style={styles.cartItemImageContainer}>
            <Image
              source={{ uri: getImageUrl(item.productName) }}
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

        <StarRating
          rating={userRating}
          onRate={(newRating) =>
            handleRate(item.id, item.productName, newRating)
          }
        />
      </View>
    );
  };

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
      <View style={styles.accountContainer}>
        <Text style={styles.accountTitle}>Account</Text>
        <View style={styles.accountInfo}>
          {isEditingName ? (
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          ) : (
            <Text style={styles.accountText}>{name}</Text>
          )}
          <TouchableOpacity
            onPress={() => {
              if (isEditingName) {
                handleSaveProfile();
              }
              setIsEditingName(!isEditingName);
            }}
          >
            <MaterialIcons
              name={isEditingName ? "check" : "edit"}
              size={24}
              color="#4f3830"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.accountText}>{email}</Text>
        <Text style={styles.accountText}>
          Account Created:{" "}
          {new Date(userProfile.createdAt?.seconds * 1000).toLocaleDateString()}
        </Text>
      </View>

      <TextInput
        style={styles.feedbackInput}
        placeholder="Write your feedback..."
        value={feedback}
        onChangeText={setFeedback}
        multiline
        numberOfLines={3}
      />
      <TouchableOpacity style={styles.sendButton} onPress={handleSendFeedback}>
        <Text style={styles.sendButtonText}>Send Feedback</Text>
      </TouchableOpacity>

      <Text style={styles.historyLabel}>Order History</Text>

      {historyData.length === 0 ? (
        <Text>No history available.</Text>
      ) : (
        <FlatList
          data={historyData}
          keyExtractor={(item) => item.id}
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
  accountContainer: {
    marginBottom: 20,
  },
  accountTitle: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 10,
  },
  accountInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  accountText: {
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
  },
  feedbackInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontFamily: "Montserrat_400Regular",
    height: 80,
  },
  sendButton: {
    backgroundColor: "#4f3830",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    width: " 100%",
  },
  sendButtonText: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
  },
  list: {
    marginBottom: 20,
  },
  nameInput: {
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    flex: 1,
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
  starContainer: {
    flexDirection: "row",
    marginVertical: 5,
  },
  historyLabel: {
    fontSize: 14,
    fontFamily: "Montserrat_700Bold",
    marginVertical: 10,
    color: "#4f3830",
  },
});

export default History;
