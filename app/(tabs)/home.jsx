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
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DrinkMenu from "../component/DrinkMenu";
import SearchBar from "../component/SearchBar";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFonts } from "expo-font";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { FontAwesome6 } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import AIProfileIcon from "../../assets/logo.png"; // Replace with your AI profile icon path

const products = [
  // Updated Coffee Products
  {
    id: "1",
    name: "Latte",
    price: "$4.50",
    description: "Smooth and creamy espresso with steamed milk.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Hot Drinks",
  },
  {
    id: "2",
    name: "Cappuccino",
    price: "$5.00",
    description: "Espresso topped with a layer of frothy milk.",
    image: require("../../assets/Rus.jpg"),
    rating: 5,
    category: "Hot Drinks",
  },
  {
    id: "3",
    name: "Espresso",
    price: "$3.00",
    description: "Strong and bold coffee brewed under pressure.",
    image: require("../../assets/Rus.jpg"),
    rating: 3,
    category: "Hot Drinks",
  },
  {
    id: "4",
    name: "Mocha",
    price: "$5.50",
    description: "Rich chocolate and espresso combined with steamed milk.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Hot Drinks",
  },
  {
    id: "5",
    name: "Green Tea",
    price: "$4.00",
    description: "Light and refreshing green tea with a hint of sweetness.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Tea",
  },
  {
    id: "6",
    name: "Black Coffee",
    price: "$2.50",
    description: "Simple and bold brewed coffee.",
    image: require("../../assets/Rus.jpg"),
    rating: 3,
    category: "Hot Drinks",
  },
  {
    id: "7",
    name: "Iced Coffee",
    price: "$4.00",
    description: "Chilled coffee served over ice for a refreshing drink.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Ice Blended",
  },
  {
    id: "8",
    name: "Caramel Macchiato",
    price: "$5.50",
    description: "Espresso with caramel syrup and steamed milk.",
    image: require("../../assets/Rus.jpg"),
    rating: 5,
    category: "Hot Drinks",
  },
  {
    id: "9",
    name: "Chai Latte",
    price: "$4.75",
    description: "Spiced tea with steamed milk and a touch of sweetness.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Tea",
  },
  {
    id: "10",
    name: "Affogato",
    price: "$6.00",
    description: "Vanilla ice cream topped with a shot of hot espresso.",
    image: require("../../assets/Rus.jpg"),
    rating: 5,
    category: "Hot Drinks",
  },

  // New Smoothies Products
  {
    id: "11",
    name: "Strawberry Banana Smoothie",
    price: "$5.00",
    description: "A blend of strawberries, bananas, and yogurt.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Ice Blended",
  },
  {
    id: "12",
    name: "Mango Smoothie",
    price: "$5.50",
    description: "Creamy mango smoothie with a touch of honey.",
    image: require("../../assets/Rus.jpg"),
    rating: 5,
    category: "Ice Blended",
  },
  {
    id: "13",
    name: "Berry Blast Smoothie",
    price: "$5.75",
    description: "A fruity mix of blueberries, raspberries, and strawberries.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Ice Blended",
  },
  {
    id: "14",
    name: "Green Smoothie",
    price: "$6.00",
    description: "A healthy blend of spinach, kale, and apple.",
    image: require("../../assets/Rus.jpg"),
    rating: 5,
    category: "Ice Blended",
  },

  // New Juices Products
  {
    id: "15",
    name: "Orange Juice",
    price: "$3.50",
    description: "Freshly squeezed orange juice.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Juices",
  },
  {
    id: "16",
    name: "Apple Juice",
    price: "$3.50",
    description: "Sweet and refreshing apple juice.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Juices",
  },
  {
    id: "17",
    name: "Carrot Juice",
    price: "$4.00",
    description: "Nutritious carrot juice with a hint of ginger.",
    image: require("../../assets/Rus.jpg"),
    rating: 5,
    category: "Juices",
  },
  {
    id: "18",
    name: "Pineapple Juice",
    price: "$4.00",
    description: "Tropical pineapple juice with a sweet flavor.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Juices",
  },

  // New Soda Products
  {
    id: "19",
    name: "Cola",
    price: "$2.00",
    description: "Classic cola with a fizzy kick.",
    image: require("../../assets/Rus.jpg"),
    rating: 3,
    category: "Soda",
  },
  {
    id: "20",
    name: "Lemonade",
    price: "$2.50",
    description: "Refreshing lemonade with a zesty twist.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Soda",
  },
  {
    id: "21",
    name: "Root Beer",
    price: "$2.50",
    description: "Smooth and creamy root beer.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Soda",
  },
  {
    id: "22",
    name: "Ginger Ale",
    price: "$2.75",
    description: "Spicy and refreshing ginger ale.",
    image: require("../../assets/Rus.jpg"),
    rating: 5,
    category: "Soda",
  },

  // New Mocktails Products
  {
    id: "23",
    name: "Virgin Mojito",
    price: "$4.50",
    description: "A refreshing blend of mint, lime, and soda water.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Mocktails",
  },
  {
    id: "24",
    name: "Fruit Punch",
    price: "$4.75",
    description: "A mix of tropical fruit juices with a hint of grenadine.",
    image: require("../../assets/Rus.jpg"),
    rating: 5,
    category: "Mocktails",
  },
  {
    id: "25",
    name: "Shirley Temple",
    price: "$4.00",
    description:
      "A classic mix of ginger ale, grenadine, and a splash of lime.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Mocktails",
  },
  {
    id: "26",
    name: "Nojito",
    price: "$4.50",
    description: "A non-alcoholic mojito with mint, lime, and soda water.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Mocktails",
  },

  // New Non-Coffee Products
  {
    id: "27",
    name: "Hot Chocolate",
    price: "$4.00",
    description: "Rich and creamy hot chocolate topped with whipped cream.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Non-Coffee",
  },
  {
    id: "28",
    name: "Vanilla Milkshake",
    price: "$5.00",
    description: "Smooth and creamy vanilla milkshake with whipped cream.",
    image: require("../../assets/Rus.jpg"),
    rating: 5,
    category: "Non-Coffee",
  },
  {
    id: "29",
    name: "Strawberry Milkshake",
    price: "$5.25",
    description: "A delicious milkshake made with fresh strawberries.",
    image: require("../../assets/Rus.jpg"),
    rating: 4,
    category: "Non-Coffee",
  },
  {
    id: "30",
    name: "Chocolate Milkshake",
    price: "$5.50",
    description: "Indulgent chocolate milkshake with a rich chocolate flavor.",
    image: require("../../assets/Rus.jpg"),
    rating: 5,
    category: "Non-Coffee",
  },
];

const { width: screenWidth } = Dimensions.get("window");

const Home = () => {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [isChatboxModalVisible, setChatboxModalVisible] = useState(false);
  const [messages, setMessages] = useState([]); // State to store messages
  const [inputMessage, setInputMessage] = useState(""); // State to hold input message
  const messagesRef = React.useRef();
  const initialAIResponse = "Hello! How can I assist you today?";
  const preBuiltQuestions = [
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

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputMessage, sentByUser: true },
      ]);

      // Clear input field
      setInputMessage("");

      // Simulate AI response with a delay
      setTimeout(() => {
        // Here you can generate an AI response or just return a default message
        const aiResponse = "Tanong mo kay Badaran baka alam nya"; // Replace with actual AI logic.
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: aiResponse, sentByUser: false },
        ]);
      }, 1000); // Delay in milliseconds (1000 ms = 1 second)

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
    setCartItems((prevItems) => [...prevItems, item]);
    console.log(`Added ${item.name} to cart`);
  };

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(
      (product) =>
        selectedCategory === "All" || product.category === selectedCategory
    );

  const renderProduct = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={item.image} style={styles.productImage} />
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <Icon
                key={index}
                name={index < item.rating ? "star" : "star-o"}
                size={15}
                color="#caad13"
                style={styles.star}
              />
            ))}
          </View>
        </View>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <MaterialIcons name="add-shopping-cart" size={24} color="#4f3830" />
      </TouchableOpacity>
    </View>
  );

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
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={cartItems.length}
        />
        <DrinkMenu
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
        />
      </View>
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
          <FontAwesome6 name="robot" size={30} color="#d1c2b4" />
        </TouchableOpacity>
      </View>
      <Modal visible={isChatboxModalVisible} animationType="slide">
        <View style={styles.chatboxModalContainer}>
          <View style={styles.chatboxModalHeader}>
            <Text style={styles.chatboxModalTitle}>Ask LokAI</Text>
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
    marginVertical: 5,
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

  // Other styles...
});

export default Home;
