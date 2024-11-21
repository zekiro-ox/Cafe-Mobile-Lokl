import { StatusBar } from "expo-status-bar";
import { Text, View, Image } from "react-native";
import { Link, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { ActivityIndicator } from "react-native"; // Use this for loading indicator
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
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
}; // Ensure you have the correct path

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await AsyncStorage.getItem("isLoggedIn");
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          if (user.emailVerified) {
            setIsLoggedIn(true);
            router.replace("/home");
          } else {
            Toast.show({
              type: "error",
              text1: "Email Not Verified",
              text2: "Please verify your email before logging in.",
            });
            setIsLoggedIn(false);
            router.replace("/sign-in");
          }
        } else if (loggedIn === "true") {
          router.replace("/home");
        } else {
          router.replace("/sign-in");
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#675148" />;
  }

  // Show loading spinner while fonts are loading or while checking login status
  if (!fontsLoaded || isLoggedIn === null) {
    return <ActivityIndicator size="large" color="#675148" />;
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: "#cfc1b1" }}
      className="flex-1 items-center justify-center"
    >
      <Image
        source={require("../assets/logo.png")}
        className="w-60 h-60 mb-4"
        resizeMode="contain"
      />
      <Text
        style={{ color: "#675148", fontFamily: "Montserrat_700Bold" }}
        className="text-4xl font-extrabold"
      >
        Lokl
      </Text>
      <StatusBar style="auto" />
      {!isLoggedIn && (
        <Link
          href="/sign-in"
          className="font-medium mt-4"
          style={{ fontFamily: "Montserrat_400Regular" }} // Applying the regular font here
        >
          Go to Sign-in
        </Link>
      )}
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
