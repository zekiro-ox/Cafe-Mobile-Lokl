import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import CheckBox from "react-native-check-box";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function SignUp() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false); // State to handle checkbox value

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#675148" />;
  }

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
        Sign Up
      </Text>

      <TextInput
        placeholder="Email"
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

      <View style={{ position: "relative", width: "100%", marginBottom: 20 }}>
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
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

      {/* CheckBox for Terms and Conditions */}

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
        onPress={() => alert("Signed Up")}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "bold",
            fontFamily: "Montserrat_700Bold",
          }}
        >
          Sign Up
        </Text>
      </TouchableOpacity>

      {/* Already Have an Account Text */}
      <TouchableOpacity>
        <Link href="/sign-in">
          <Text
            style={{
              color: "#675148",
              fontFamily: "Montserrat_400Regular",
              fontSize: 16,
            }}
          >
            Already have an account?{" "}
            <Text style={{ fontWeight: "bold" }}>Sign In</Text>
          </Text>
        </Link>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
