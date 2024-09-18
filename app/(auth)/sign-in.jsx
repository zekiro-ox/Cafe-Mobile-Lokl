import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import CheckBox from "react-native-check-box";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router"; // Import useRouter

export default function SignIn() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isChecked, setIsChecked] = useState(false); // State to handle checkbox value
  const [loading, setLoading] = useState(false); // State to handle loading

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const router = useRouter(); // Get the router object

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#675148" />;
  }

  const handleSignIn = () => {
    setLoading(true);

    // Dummy credentials
    const dummyEmail = "user@example.com";
    const dummyPassword = "password";

    // Simple authentication check
    if (email === dummyEmail && password === dummyPassword) {
      setLoading(false);
      // Simulate successful login
      Alert.alert("Success", "Logged in successfully!");
      // Navigate to home screen using router
      router.push("/home");
    } else {
      setLoading(false);
      // Show error message
      Alert.alert("Error", "Invalid email or password");
    }
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: "#cfc1b1" }}
      className="flex-1 items-center justify-center p-4"
    >
      <Image
        source={require("../../assets/logo.png")}
        style={{
          width: 150,
          height: 150,
          marginBottom: 20,
        }}
        resizeMode="contain"
      />
      <Text
        style={{ fontFamily: "Montserrat_700Bold", color: "#675148" }}
        className="text-3xl font-extrabold mb-8"
      >
        Sign In
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        className="w-full p-3 mb-4 text-base rounded-lg drop-shadow-lg shadow-lg"
        style={{
          backgroundColor: "#fff",
          borderColor: "#ccc",
          borderWidth: 1,
          color: "#333",
          fontFamily: "Montserrat_400Regular",
        }}
        keyboardType="email-address"
      />

      <View style={{ position: "relative", width: "100%", marginBottom: 20 }}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={!isPasswordVisible}
          className="w-full p-3 text-base rounded-lg drop-shadow-lg shadow-lg"
          style={{
            backgroundColor: "#fff",
            borderColor: "#ccc",
            borderWidth: 1,
            color: "#333",
            fontFamily: "Montserrat_400Regular",
            paddingRight: 50,
          }}
        />

        <TouchableOpacity
          style={{ position: "absolute", right: 10, top: 15 }}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <MaterialIcons
            name={isPasswordVisible ? "visibility" : "visibility-off"}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password and Remember Me Row */}
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        {/* CheckBox for Remember Me */}
        <CheckBox
          style={{ flex: 1, padding: 0, color: "#675148" }}
          onClick={() => setIsChecked(!isChecked)}
          isChecked={isChecked}
          rightText={"Remember Me"}
          rightTextStyle={{
            color: "#675148",
            fontFamily: "Montserrat_400Regular",
          }}
        />

        {/* Forgot Password Text */}
        <TouchableOpacity onPress={() => Alert.alert("Forgot Password")}>
          <Text
            style={{ color: "#675148", fontFamily: "Montserrat_400Regular" }}
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: "#675148",
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 8,
          width: "100%",
          alignItems: "center",
          marginBottom: 20, // Add margin to separate from the new text
        }}
        onPress={handleSignIn}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "bold",
            fontFamily: "Montserrat_700Bold",
          }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      {/* Don't Have an Account Yet Text */}
      <TouchableOpacity>
        <Link href="/sign-up">
          <Text
            style={{
              color: "#675148",
              fontFamily: "Montserrat_400Regular",
              fontSize: 16,
            }}
          >
            Don't have an account yet?{" "}
            <Text style={{ fontWeight: "bold" }}>Sign Up</Text>
          </Text>
        </Link>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
