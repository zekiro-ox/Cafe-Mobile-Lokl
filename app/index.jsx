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
      router.push("/home");
      setIsLoggedIn(loggedIn === "true");
      setIsLoading(false);
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return null; // You can return a loading indicator here
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
    </SafeAreaView>
  );
}
