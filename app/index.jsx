import { StatusBar } from "expo-status-bar";
import { Text, View, Image } from "react-native";
import { Link } from "expo-router";
import { useFonts } from "expo-font";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { ActivityIndicator } from "react-native"; // Use this for loading indicator
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  // Load the Montserrat fonts
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  // Show loading spinner while fonts are loading
  if (!fontsLoaded) {
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
      <Link
        href="/sign-in"
        className="font-medium mt-4"
        style={{ fontFamily: "Montserrat_400Regular" }} // Applying the regular font here
      >
        Go to Sign-in
      </Link>
    </SafeAreaView>
  );
}
