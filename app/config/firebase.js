// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZ9wcj0Fp1wWWiXuZy_-ksUHyk3tgFWzM",
  authDomain: "lokl-9d6a5.firebaseapp.com",
  projectId: "lokl-9d6a5",
  storageBucket: "lokl-9d6a5.appspot.com",
  messagingSenderId: "774328469407",
  appId: "1:774328469407:web:efda13942cad6adefb1faa",
  measurementId: "G-GKGXJJL0DC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { db, auth };
