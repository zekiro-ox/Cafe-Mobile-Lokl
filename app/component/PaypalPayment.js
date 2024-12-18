import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
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
  const [timeoutTimestamp, setTimeoutTimestamp] = useState(null); // Store timeout expiry
  const [timeRemaining, setTimeRemaining] = useState(0); // Countdown timer
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
    setAlertVisible(true);
    setAlertMessage("Payment Successful!");
    setCancelAttempts(0); // Reset attempts after success
    onSuccess();
  };

  const onPaymentCancel = () => {
    const newCount = cancelAttempts + 1;
    setCancelAttempts(newCount);

    if (newCount >= 3) {
      const timeoutEnd = Date.now() + 10 * 60 * 1000; // Set 10-minute timeout
      setTimeoutTimestamp(timeoutEnd);
      setBlocked(true);
      setAlertMessage(
        "You are blocked for 10 minutes due to too many cancellations."
      );
    } else {
      setAlertMessage(`Payment Cancelled. Attempts left: ${3 - newCount}`);
    }

    setAlertVisible(true);
    onClose();
  };

  useEffect(() => {
    if (!blocked) {
      createPayment();
    } else if (timeoutTimestamp) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, timeoutTimestamp - Date.now());
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          setBlocked(false); // Unblock after timeout
          setCancelAttempts(0);
          setTimeoutTimestamp(null);
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer); // Cleanup on unmount
    }
  }, [blocked, timeoutTimestamp]);

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

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
            {timeoutTimestamp
              ? `You can retry in ${formatTime(timeRemaining)}`
              : "You can no longer proceed with the payment."}
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
