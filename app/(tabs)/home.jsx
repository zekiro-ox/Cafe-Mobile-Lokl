import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  BackHandler,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DrinkMenu from "../component/DrinkMenu";
import SearchBar from "../component/SearchBar";
import CustomizationModal from "../component/CustomizationModal";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFonts } from "expo-font";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { FontAwesome6 } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import AIProfileIcon from "../../assets/logo.png"; // Replace with your AI profile icon path
import { getWeatherData } from "../../api/WeatherAPI";
import { useRouter } from "expo-router";
import * as Location from "expo-location"; // Adjust the path accordingly
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { getAuth, signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import Firebase Auth

// Don't forget to export the products array if needed

const { width: screenWidth } = Dimensions.get("window");
const categoryOrder = {
  "Hot Drinks": 0,
  "Ice Blended": 1,
  "Non-Coffee": 2,
  Tea: 3,
  Mocktails: 4,
};

const Home = () => {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const [selectedCategory, setSelectedCategory] = useState("Recommended");
  const [productSearchQuery, setProductSearchQuery] = useState(""); // For product searching
  const [citySearchQuery, setCitySearchQuery] = useState(""); // For city searching
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [isCitySearchModalVisible, setCitySearchModalVisible] = useState(true);
  const [currentCity, setCurrentCity] = useState(""); // To store the current city name
  const [weatherStatus, setWeatherStatus] = useState(""); // To store the weather status
  const [cartItems, setCartItems] = useState([]);
  const [isChatboxModalVisible, setChatboxModalVisible] = useState(false);
  const [messages, setMessages] = useState([]); // State to store messages
  const [inputMessage, setInputMessage] = useState(""); // State to hold input message
  const messagesRef = React.useRef();
  const initialAIResponse = "Hello! How can I assist you today?";
  const preBuiltQuestions = [
    {
      question: "Where can I find your physical store?",
      answer:
        "This is the address of LOKL: Unit B VSL Bldg., 222 EJ Valdez St.,Brgy. Ninoy Aquino,Marisol Subd.,Angeles City",
    },
    {
      question: "What time does the cafe open?",
      answer: "The cafe is open from 11 AM to 10 PM",
    },
    {
      question: "What are the lactose-free or non-dairy alternative milk?",
      answer:
        "Almond Milk: A smooth and creamy vanilla latte made with almond milk, perfect for those who are lactose intolerant. Soy Milk: soy milk for a slightly nutty and rich flavor.",
    },
    {
      question: "How strong do I need to make the Americano stronger?",
      answer:
        "Double shots for a stronger kick: Add double shots of espresso to make the Americano stronger and more intense.",
    },
    {
      question: "What are the best sellers?",
      answer:
        "Salted Caramel, Java Chips, Matcha Latte, Strawberry Milk, Dirty Horchata, Honey Citron Ade.",
    },
    {
      question:
        "For someone who has diabetes, wants to reduce weight, and doesn't like high sugar, what sugar level would you recommend?",
      answer: "15% level.",
    },
    {
      question: "Low Sugar options?",
      answer:
        "Iced Americano with a Splash of Almond Milk: A strong coffee flavor with a hint of creaminess, customized to 15% sugar. Hot Cappuccino with Cinnamon: A classic cappuccino with a sprinkle of cinnamon for added flavor, customized to 15% sugar.",
    },
    {
      question: "Which coffee would you recommend to someone who is acidic?",
      answer:
        "Vanilla latte is recommended for its milder and smoother taste, which is gentler on the stomach.",
    },
    // New Questions and Answers
    {
      question:
        "What would you recommend for someone who enjoys a strong coffee flavor?",
      answer:
        "Lokl Signature with Extra Double Shot: An intense coffee experience, ideal for those who love strong coffee.",
    },
    {
      question: "Can you suggest a coffee option that's not too sweet?",
      answer:
        "Iced Latte with Half Sweetener: A refreshing and less sweetened iced latte. Hot Americano with a Hint of Caramel Syrup: Just a touch of sweetness without overpowering the coffee flavor.",
    },
    {
      question:
        "I'm looking for a unique coffee experience. Any recommendations?",
      answer:
        "Mocha with Dark Chocolate: A rich and indulgent mocha, customized with extra dark chocolate shavings for an enhanced chocolate flavor.",
    },
    {
      question:
        "Which coffee would you recommend if I prefer something with a rich chocolate flavor?",
      answer: "Mocha, Java Chip.",
    },
    {
      question:
        "I'm not sure which milk alternative would go best with my cappuccino. Any suggestions?",
      answer: "Almond Milk or Soy Milk.",
    },
    {
      question:
        "Can you recommend a coffee that's both creamy and not too sweet?",
      answer: "Cappuccino.",
    },
  ];

  const [isCustomizationModalVisible, setCustomizationModalVisible] =
    useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAIAlert, setShowAIAlert] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const router = useRouter(); // Initial value for sliding animation
  const [products, setProducts] = useState([]);

  const handleCitySearchSubmit = () => {
    fetchWeather(citySearchQuery);
    setCitySearchModalVisible(false);

    // Show the alert message with animation
    showAlert();

    // Reset the alert message after 3 seconds
    setTimeout(hideAlert, 7000); // Change time as needed (3000 ms = 3 seconds)
  };

  const showAlert = () => {
    setShowAIAlert(true);
    Animated.spring(slideAnim, {
      toValue: 1, // Slide in
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  };

  const hideAlert = () => {
    Animated.spring(slideAnim, {
      toValue: 0, // Slide out
      useNativeDriver: true,
    }).start(() => {
      setShowAIAlert(false); // Set the alert visibility to false after the animation
    });
  };
  useEffect(() => {
    const backAction = () => {
      // Prevent the back button from doing anything
      return true; // Returning true prevents the default back action
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Cleanup the event listener on component unmount
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Define the collection reference and query
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("available", "==", true));

        // Execute the query
        const querySnapshot = await getDocs(q);

        // Map the fetched data
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          ingredients: doc.data().ingredients || [], // Handle missing ingredients field
        }));
        setProducts(productsData); // Set the fetched products to state
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, []);

  // Fetches weather data
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // Request permission to access location
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("Permission to access location was denied");
          return;
        }

        // Get the user's current location
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Fetch weather data using latitude and longitude
        const city = await reverseGeocode(latitude, longitude);
        fetchWeather(city);
      } catch (error) {
        console.error("Error fetching location: ", error);
      }
    };

    getUserLocation();
  }, []); // Call once when the component mounts

  const reverseGeocode = async (latitude, longitude) => {
    // Convert coordinates to a readable city name
    const region = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (region.length > 0) {
      return region[0].city || region[0].postalCode; // Return city or postal code
    }
    return ""; // Default return if no region found
  };

  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getWeatherData(city);
      console.log(data);

      if (data && data.current) {
        setCurrentCity(data.location.name);
        setWeatherStatus(data.current.condition.text);
        setWeatherData(data.current);

        showAlert();

        // Reset the alert message after 3 seconds
        setTimeout(hideAlert, 7000);
      } else {
        throw new Error("Invalid weather data structure");
      }
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Could not fetch weather data. Please try again.");
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const stopwords = new Set([
    "a",
    "an",
    "the",
    "is",
    "of",
    "on",
    "for",
    "and",
    "or",
    "to",
    "in",
    "at",
    "with",
    "by",
    "that",
    "this",
    "it",
    "what",
    "which",
    "i",
    "you",
  ]);

  const getKeywords = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "") // Remove punctuation
      .split(" ") // Split into words
      .filter((word) => word && !stopwords.has(word)) // Remove stopwords
      .map((word) => word.trim()); // Remove extra spaces
  };

  const recommendDrinksByTemperature = () => {
    if (!weatherData) return products; // If weather data is not available, return all products

    const temperature = Math.round(weatherData.temp_c); // Get the current temperature

    // Recommend drinks based on temperature
    if (temperature > 25) {
      // Hot weather: recommend Ice Blended drinks
      return products.filter((product) => product.category === "Ice Blended");
    } else if (temperature < 15) {
      // Cold weather: recommend Hot Drinks
      return products.filter(
        (product) =>
          product.category === "Hot Drinks" || product.category === "Tea"
      );
    } else if (temperature >= 15 && temperature <= 25) {
      // Moderate weather: recommend Mocktails or Tea
      return products.filter(
        (product) =>
          product.category === "Mocktails" || product.category === "Non-Coffee"
      );
    }

    return products; // Fallback: return all products
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      // Send the user's message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputMessage, sentByUser: true },
      ]);

      // Clear input field
      setInputMessage("");

      const userKeywords = getKeywords(inputMessage);

      // Check for a matching pre-built question using keywords
      const matchedQuestion = preBuiltQuestions.find((item) => {
        const questionKeywords = getKeywords(item.question);
        // Check if any user keyword is included in the pre-built question
        return userKeywords.some((keyword) =>
          questionKeywords.includes(keyword)
        );
      });

      // Simulate AI response with a delay
      setTimeout(() => {
        const aiResponse = matchedQuestion
          ? matchedQuestion.answer
          : "I don't have the answer to your question. Please based on the reference question."; // Default response if no match found

        setMessages((prevMessages) => [
          ...prevMessages,
          { text: aiResponse, sentByUser: false },
        ]);
      }, 2000); // 1 second delay

      // Scroll to last message
      messagesRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleSendPreBuiltAnswer = (question, answer) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: question, sentByUser: true },
    ]);

    // Simulate AI response with a delay
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: answer, sentByUser: false },
      ]);
    }, 1000); // Delay in milliseconds (1000 ms = 1 second)

    messagesRef.current.scrollToEnd({ animated: true });
  };

  const handleAIIconClick = () => {
    setChatboxModalVisible(!isChatboxModalVisible);
    if (!isChatboxModalVisible) {
      setMessages([{ text: initialAIResponse, sentByUser: false }]); // Set initial AI message
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleAddToCart = (item) => {
    if (item) {
      setSelectedProduct(item);
      setCustomizationModalVisible(true); // Open customization modal
    } else {
      console.warn("Selected product is undefined");
    }
  };
  const handleLogout = async () => {
    const auth = getAuth(); // Get the Firebase Auth instance
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("isLoggedIn"); // Sign out the user
      // Perform any necessary logout logic here (e.g., clearing user data)

      // Navigate to the sign-in screen
      router.replace("/sign-in"); // Ensure this path matches your sign-in route
    } catch (error) {
      console.error("Error signing out: ", error); // Handle any errors
    }
  };

  const handleAddToCartWithCustomization = (customProduct) => {
    setCartItems((prevItems) => [...prevItems, customProduct]);
    console.log(
      `Added ${customProduct.name} to cart with customization: ${customProduct.customization}`
    );
  };
  const filteredProducts =
    selectedCategory === "Recommended"
      ? recommendDrinksByTemperature() // Get recommended drinks based on temperature
      : products
          .filter((product) =>
            product.name
              .toLowerCase()
              .includes(productSearchQuery.toLowerCase())
          )
          .filter(
            (product) =>
              selectedCategory === "All" ||
              product.category === selectedCategory
          )
          .sort(
            (a, b) => categoryOrder[a.category] - categoryOrder[b.category]
          );
  const calculateAverageRating = (ratings) => {
    const totalRatings = Object.values(ratings).reduce(
      (acc, count) => acc + count,
      0
    );
    if (totalRatings === 0) return 0; // Avoid division by zero

    const weightedSum = Object.keys(ratings).reduce((acc, key) => {
      return acc + key * ratings[key]; // Multiply rating by its count
    }, 0);

    return weightedSum / totalRatings; // Return average rating
  };

  const renderProduct = ({ item, index }) => {
    // Calculate the average rating from the rating object
    const averageRating = calculateAverageRating(item.rating || {});

    return (
      <View>
        {selectedCategory === "All" &&
        (index === 0 ||
          item.category !== filteredProducts[index - 1].category) ? (
          <Text style={styles.categoryHeader}>{item.category}</Text>
        ) : null}
        <TouchableOpacity
          style={styles.productItem} // Make the entire card clickable
          onPress={() => handleAddToCart(item)} // Open customization modal on card press
        >
          <Image
            source={{ uri: item.image }} // Use the image URL from Firestore
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{item.name}</Text>
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, index) => (
                  <Icon
                    key={index}
                    name={index < Math.round(averageRating) ? "star" : "star-o"}
                    size={15}
                    color="#caad13"
                    style={styles.star}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.productDescription}>{item.description}</Text>
            <Text style={styles.productPrice}>₱{item.price}</Text>
          </View>
          {/* Remove the addButton, since we want the whole card to be clickable */}
        </TouchableOpacity>
      </View>
    );
  };

  if (!fontsLoaded) {
    return null; // You can return a loading indicator here if needed
  }
  const renderMessage = ({ item: item1 }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: item1.sentByUser ? "flex-end" : "flex-start",
        marginVertical: 5,
      }}
    >
      {/* Only render the AI Profile Icon for AI's messages */}
      {!item1.sentByUser && (
        <Image
          source={AIProfileIcon}
          style={{
            width: 25,
            height: 25,
            borderRadius: 15,
            marginRight: 10, // For AI's messages
            marginBottom: 5,
          }}
        />
      )}

      {/* Message Bubble */}
      <View
        style={[
          styles.messageBubble,
          {
            alignSelf: item1.sentByUser ? "flex-end" : "flex-start",
            backgroundColor: item1.sentByUser ? "#4f3830" : "#e5dcd3",
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: item1.sentByUser ? "#fff" : "#333",
              fontFamily: "Montserrat_400Regular",
            },
          ]}
        >
          {item1.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ backgroundColor: "#cfc1b1" }} className="flex-1">
      <View style={styles.searchAndMenuContainer}>
        <SearchBar
          searchQuery={productSearchQuery} // This handles search for products
          setSearchQuery={setProductSearchQuery} // For product search
          cartCount={cartItems.length}
          onLogoutPress={handleLogout}
          cartItems={cartItems}
          setCartItems={setCartItems}
        />

        <DrinkMenu
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
        />
      </View>

      <View style={styles.weatherContainer}>
        {loading ? (
          <Text style={styles.weatherConditionText}>Loading...</Text>
        ) : error ? (
          <Text style={styles.weatherConditionText}>{error}</Text>
        ) : weatherData ? (
          <>
            <Text style={styles.weatherText}>{currentCity}</Text>
            <View style={styles.weatherInfoContainer}>
              <Text style={styles.temperatureText}>
                {Math.round(weatherData.temp_c)}°C
              </Text>
              <Text style={styles.weatherConditionText}>{weatherStatus}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.weatherConditionText}>
            Weather data not available
          </Text>
        )}
      </View>

      {showAIAlert && (
        <Animated.View
          style={{
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [500, 0], // From right (500) to original position (0)
                }),
              },
            ],
          }}
        >
          <Text style={styles.aiAlertText}>
            "Get ready to sip in style! LOKL recommends the best drinks for
            today's forecast, so you can stay refreshed and on-trend."
          </Text>
        </Animated.View>
      )}
      <View style={styles.contentContainer}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContainer}
        />
        <TouchableOpacity
          style={styles.aiIconContainer}
          onPress={handleAIIconClick}
        >
          <MaterialCommunityIcons
            name="frequently-asked-questions"
            size={30}
            color="#d1c2b4"
          />
        </TouchableOpacity>
      </View>
      <CustomizationModal
        visible={isCustomizationModalVisible}
        onClose={() => setCustomizationModalVisible(false)}
        onAddToCart={handleAddToCartWithCustomization}
        product={selectedProduct ? selectedProduct : {}}
        ingredients={selectedProduct ? selectedProduct.ingredients : []} // Pass ingredients to the modal
      />
      <Modal visible={isChatboxModalVisible} animationType="slide">
        <View style={styles.chatboxModalContainer}>
          <View style={styles.chatboxModalHeader}>
            <Text style={styles.chatboxModalTitle}>FAQ</Text>
            <TouchableOpacity
              style={styles.chatboxModalCloseButton}
              onPress={() => setChatboxModalVisible(false)}
            >
              <Feather name="minimize-2" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            ref={messagesRef}
            data={messages}
            keyExtractor={(item1, index) => index.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            style={{ flex: 1 }} // Ensure it grows to fill the available height
          />

          <View style={styles.preBuiltQuestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {preBuiltQuestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    handleSendPreBuiltAnswer(item.question, item.answer)
                  }
                  style={styles.preBuiltQuestionButton} // Apply a style for the button
                >
                  <Text style={styles.preBuiltQuestion}>{item.question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.chatboxModalInputContainer}>
            <TextInput
              style={styles.chatboxModalInput}
              placeholder="Type something..."
              value={inputMessage}
              onChangeText={setInputMessage}
            />
            <TouchableOpacity
              style={styles.chatboxModalSendButton}
              onPress={handleSendMessage}
            >
              <Icon
                name="send"
                size={20}
                style={styles.chatboxModalSendButtonText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  searchAndMenuContainer: {
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  listContainer: {
    paddingVertical: 10,
    alignItems: "center",
  },
  categoryHeader: {
    fontSize: 16,
    color: "#d1c2b4",
    backgroundColor: "#4f3830",
    fontFamily: "Montserrat_700Bold",
    marginBottom: 10,
    marginTop: 10,
    padding: 10,
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    textAlign: "center",
  },
  productItem: {
    flexDirection: "row",
    backgroundColor: "#e5dcd3",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: screenWidth - 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    alignItems: "flex-start",
    position: "relative",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    fontFamily: "Montserrat_700Bold",
  },
  ratingContainer: {
    flexDirection: "row",
  },
  star: {
    marginLeft: 5,
  },
  productDescription: {
    fontSize: 12,
    color: "#666",
    marginVertical: 12,
    marginRight: 10,
    fontFamily: "Montserrat_400Regular",
  },
  productPrice: {
    fontSize: 16,
    color: "#737373",
    fontFamily: "Montserrat_400Regular",
  },
  addButton: {
    backgroundColor: "#e5dcd3",
    padding: 10,
    borderRadius: 15,
    position: "absolute",
    bottom: 5,
    right: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    position: "relative", // add this line to make the AI icon position relative to this container
  },
  // ...
  aiIconContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#4f3830",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4, // use elevation for Android
    padding: 10,
  },
  chatboxModalContainer: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#cfc1b1",
    padding: 20,
  },

  messageList: {
    // Ensure it takes full width and use flex to grow
    flexGrow: 1, // This allows the FlatList to expand properly
    paddingBottom: 10, // Optional for some breathing space
  },
  chatboxModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  chatboxModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Montserrat_700Bold",
  },
  chatboxModalCloseButton: {
    padding: 10,
  },
  chatboxModalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 20, // Add this
  },
  chatboxModalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    backgroundColor: "#e5dcd3",
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
  },
  chatboxModalSendButton: {
    backgroundColor: "#4f3830",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chatboxModalSendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  messageBubble: {
    backgroundColor: "#4f3830", // Bubble color
    borderRadius: 15,
    padding: 10, // Adjusted padding for a better look
    marginVertical: 5,
    maxWidth: "80%", // Change to 80% to allow wrapping
    alignSelf: "flex-end", // To align to the right for user messages
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    fontFamily: "Montserrat_400Regular", // Elevation for Android shadow
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },

  preBuiltQuestionsContainer: {
    paddingVertical: 5, // Smaller vertical padding
  },
  preBuiltQuestion: {
    backgroundColor: "#e5dcd3",
    padding: 5, // Smaller padding
    borderRadius: 20, // Increased border radius for rounder borders
    marginVertical: 3, // Smaller vertical margin
    fontSize: 14,
    fontFamily: "Montserrat_400Regular", // Smaller font size
  },

  preBuiltQuestionButton: {
    backgroundColor: "#e5dcd3",
    padding: 2, // This can remain the same or be adjusted further
    borderRadius: 20, // Increased border radius for rounder borders
    marginRight: 5, // Smaller space between items
  },

  weatherContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#e5dcd3",
    borderRadius: 15,
    marginBottom: 10,
    marginRight: 15,
    marginLeft: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weatherInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  weatherText: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    color: "#333",
    marginBottom: 5,
  },
  weatherConditionText: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    color: "#4f3830",
    marginLeft: 10, // Added margin to create space
  },
  temperatureText: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    color: "#4f3830",
    marginRight: "10px",
  },
  aiAlertText: {
    color: "#4f3830",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    margin: 15,
  },

  // Other styles...
});

export default Home;
