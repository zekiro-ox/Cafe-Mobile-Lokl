import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { WebView } from "react-native-webview";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import CustomAlert from "./CustomAlert";

const PayPalPayment = ({ amount, onClose, onSuccess }) => {
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [cancelAttempts, setCancelAttempts] = useState(0); // Track cancellations
  const [blocked, setBlocked] = useState(false); // Block payment after 3 cancellations
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const getAccessToken = async () => {
    const response = await fetch(
      "https://api.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            btoa(
              "AQYRyn1hXbYHQqrsIUkFc31If2qw7hto_aCxP6UzNzoFvVgUfjAJvmT5KWlRIctfDwibqjjkqzU8438J:EOprl9JZy25DFJf_imvzKYBfA3LpZCV1HiJiTgCEVfIFn95ytJhD837NIGxYdo9QSEp4hIXzRoNEiOog"
            ),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );

    const data = await response.json();
    return data.access_token;
  };

  const createPayment = async () => {
    if (blocked) return; // Stop payment creation if blocked
    const accessToken = await getAccessToken();
    const response = await fetch(
      "https://api.sandbox.paypal.com/v1/payments/payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "sale",
          payer: { payment_method: "paypal" },
          transactions: [
            {
              amount: { total: amount.toString(), currency: "PHP" },
              description: "Your transaction description",
            },
          ],
          redirect_urls: {
            return_url: "https://example.com/success",
            cancel_url: "https://example.com/cancel",
          },
        }),
      }
    );

    const data = await response.json();
    const approvalUrl = data.links.find(
      (link) => link.rel === "approval_url"
    ).href;
    setPaymentUrl(approvalUrl);
    setLoading(false);
  };

  const onPaymentSuccess = () => {
    console.log("Payment successful"); // Debug log
    setAlertVisible(true);
    setAlertMessage("Payment Successful!");
    onSuccess();
  };

  const onPaymentCancel = () => {
    console.log("Payment cancelled"); // Debug log
    setCancelAttempts((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setBlocked(true); // Block further payments after 3 attempts
        setAlertMessage("You have exceeded the maximum cancellation attempts.");
      } else {
        setAlertMessage(`Payment Cancelled. Attempts left: ${3 - newCount}`);
      }
      setAlertVisible(true);
      return newCount;
    });
    onClose();
  };

  React.useEffect(() => {
    if (!blocked) {
      createPayment();
    }
  }, [blocked]);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>PayPal Payment is Loading...</Text>
        </View>
      ) : paymentUrl && !blocked ? (
        <WebView
          style={{ flex: 1 }}
          source={{ uri: paymentUrl }}
          onNavigationStateChange={(navState) => {
            if (navState.url.includes("success")) {
              onPaymentSuccess();
            } else if (navState.url.includes("cancel")) {
              onPaymentCancel();
            }
          }}
        />
      ) : (
        <View style={styles.blockedContainer}>
          <Text style={styles.blockedText}>
            You can no longer proceed with the payment.
          </Text>
        </View>
      )}
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e5dcd3",
  },
  loadingText: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    color: "#4f3830",
  },
  blockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8d7da",
  },
  blockedText: {
    fontSize: 18,
    fontFamily: "Montserrat_700Bold",
    color: "#721c24",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default PayPalPayment;
