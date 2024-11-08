import React, { useState, useEffect } from "react"; // Import useEffect
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { doc, updateDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "../config/firebase"; // Adjust the path as necessary
import { format } from "date-fns"; // Import date-fns for formatting

const ProfileModal = ({ visible, onClose, userProfile, onUpdateProfile }) => {
  console.log("ProfileModal userProfile:", userProfile);

  // Initialize state
  const [name, setName] = useState(userProfile.name || "");
  const [email, setEmail] = useState(userProfile.email || "No email provided");
  const [feedback, setFeedback] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Update email when userProfile changes
  useEffect(() => {
    setName(userProfile.name || "");
    setEmail(userProfile.email || "No email provided");
  }, [userProfile]);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid; // Get the current user's ID
      const userDocRef = doc(db, "customer", userId); // Reference to the user document

      try {
        // Update the user's name in Firestore
        await updateDoc(userDocRef, { name });
        onUpdateProfile({ name, email }); // Update local state
        setIsEditing(false); // Exit edit mode after saving
        onClose();
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };

  const handleSendFeedback = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userId = user.uid; // Get the current user's ID
      const userDocRef = doc(db, "customer", userId); // Reference to the user document

      try {
        // Update the user's feedback in Firestore
        await updateDoc(userDocRef, {
          feedback: feedback,
        });
        console.log("Feedback sent:", feedback);
        setFeedback(""); // Clear the feedback input
      } catch (error) {
        console.error("Error sending feedback: ", error);
      }
    }
  };

  if (!fontsLoaded) {
    return null; // You can return a loading indicator here if needed
  }

  // Format the createdAt timestamp
  const createdAtFormatted = userProfile.createdAt
    ? format(userProfile.createdAt.toDate(), "MMMM dd, yyyy 'at' hh:mm a")
    : "N/A"; // Default if no createdAt

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Profile</Text>

          <View style={styles.userInfoContainer}>
            <View style={styles.nameContainer}>
              {isEditing ? (
                <TextInput
                  style={styles.nameInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                />
              ) : (
                <Text style={styles.nameText}>{name || "Set your name"}</Text>
              )}
              <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                <Ionicons
                  name={isEditing ? "checkmark" : "pencil"}
                  size={20}
                  color="#737373"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.createdAtText}>
              Account created on: {createdAtFormatted}
            </Text>
          </View>

          <TextInput
            style={styles.feedbackInput}
            placeholder="Write your feedback..."
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendFeedback}
          >
            <Text style={styles.sendButtonText}>Send Feedback</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#e5dcd3",
    borderRadius: 20,
    padding: 20,
    alignItems: "flex-start",
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 15,
    textAlign: "center",
  },
  userInfoContainer: {
    width: "100%",
    marginBottom: 15,
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  nameText: {
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
    flex: 1,
  },
  nameInput: {
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  emailText: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 5,
    color: "#555",
  },
  createdAtText: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 10,
    color: "#777",
  },
  feedbackInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontFamily: "Montserrat_400Regular",
    height: 80,
  },
  sendButton: {
    backgroundColor: "#4f3830",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    width: "100%",
  },
  sendButtonText: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#4f3830",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#737373",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
  },
});

export default ProfileModal;
