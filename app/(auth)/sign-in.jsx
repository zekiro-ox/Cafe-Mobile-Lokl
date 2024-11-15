import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useRouter, Link } from "expo-router";
import { auth } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import Toast from "react-native-toast-message";
import CheckBox from "react-native-check-box";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export default function SignIn() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const router = useRouter();

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#675148" />;
  }

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem("isLoggedIn", "true");
      setLoading(false);
      Toast.show({
        type: "success",
        text1: "Logged in successfully!",
        text2: "Welcome back!",
      });
      router.replace("/home");
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Sign In Error",
        text2: error.message,
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Email Required",
        text2: "Please enter your email address.",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Toast.show({
        type: "success",
        text1: "Email Sent",
        text2: "Check your gmail inbox for the password reset link.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Reset Password Error",
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

      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
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

        <TouchableOpacity onPress={handleForgotPassword}>
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
          marginBottom: 20,
        }}
        onPress={handleSignIn}
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
            Sign In
          </Text>
        )}
      </TouchableOpacity>

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
