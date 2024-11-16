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
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";

// Custom toast configuration
const toastConfig = {
  success: ({ text1, text2 }) => (
    <View style={styles.toastContainer}>
      <Text style={styles.toastTitle}>{text1}</Text>
      <Text style={styles.toastMessage}>{text2}</Text>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={styles.toastContainer}>
      <Text style={styles.toastTitle}>{text1}</Text>
      <Text style={styles.toastMessage}>{text2}</Text>
    </View>
  ),
};

export default function SignUp() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.endsWith("@gmail.com");
  const isValidPassword = (password) =>
    /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,16}$/.test(password);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#675148" />;
  }

  const handleSignUp = async () => {
    if (!isValidEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address.",
      });
      return;
    }

    if (!isValidPassword(password)) {
      Toast.show({
        type: "error",
        text1: "Invalid Password",
        text2:
          "Password must be 12-16 characters with at least one special character.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Password Mismatch",
        text2: "Passwords do not match. Please try again.",
      });
      return;
    }

    const auth = getAuth();
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "customer", user.uid), {
        email: user.email,
        createdAt: new Date(),
      });

      Toast.show({
        type: "success",
        text1: "Account Created",
        text2: "A verification email has been sent to your Gmail address.",
      });

      setTimeout(() => {
        router.push("/home");
      }, 3000);
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Sign Up Error",
        text2: error.message,
      });
    }
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: "#cfc1b1" }}
      className="flex-1 items-center justify-center p-4"
    >
      <Image
        source={require("../../assets/logo.png")}
        style={{ width: 150, height: 150, marginBottom: 20 }}
        resizeMode="contain"
      />
      <Text
        style={{ fontFamily: "Montserrat_700Bold", color: "#675148" }}
        className="text-3xl font-extrabold mb-6"
      >
        Sign Up
      </Text>

      {/* Warning message with icon */}

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

      {/* Password input fields */}
      <View style={{ position: "relative", width: "100%", marginBottom: 5 }}>
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

      {/* Password instruction */}
      <Text
        style={{
          color: "#eee",
          fontSize: 10,
          marginBottom: 15,
          fontFamily: "Montserrat_400Regular",
        }}
      >
        Password must be 12-16 characters with at least one special character.
      </Text>

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

      <TouchableOpacity
        style={{
          backgroundColor: "#675148",
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 8,
          width: "100%",
          alignItems: "center",
          marginBottom: 20,
        }}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
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
        )}
      </TouchableOpacity>

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

      {/* Toast component */}
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
}

const styles = {
  toastContainer: {
    backgroundColor: "#4f3830",
    padding: 20,
    borderRadius: 8,
    margin: 10,
  },
  toastTitle: {
    color: "#d1c2b4",
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
  },
  toastMessage: {
    color: "#fff",
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
  },
};
