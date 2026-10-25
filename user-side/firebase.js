import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import {
  setPersistence,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


const firebaseConfig = {
  apiKey: "AIzaSyBJcwDzUMNJLKzAEyvRwACMYOrUS1u3oR0",
  authDomain: "food-delivery-e0cba.firebaseapp.com",
  projectId: "food-delivery-e0cba",
  storageBucket: "food-delivery-e0cba.appspot.com",
  messagingSenderId: "595569381333",
  appId: "1:595569381333:web:6872be5d474cf64473775c",
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

//init database
// Long polling: more reliable connection on Android phones/emulators
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });


