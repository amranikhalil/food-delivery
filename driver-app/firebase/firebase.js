import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Same Firebase project as restaurant-dashboard/.env.local
// (a Firebase web config is not secret: access is controlled by Firestore rules)
const firebaseConfig = {
  apiKey: "AIzaSyDxWslqIFCc8oarY6dm_h5aLlcXZu3gCgA",
  authDomain: "delivery-app-9afec.firebaseapp.com",
  projectId: "delivery-app-9afec",
  storageBucket: "delivery-app-9afec.firebasestorage.app",
  messagingSenderId: "445319642367",
  appId: "1:445319642367:web:14f95030d672442b08e0ca",
};

// Must match NEXT_PUBLIC_RESTAURANT_ID in the dashboard
export const RESTAURANT_ID = "demo";

const app = initializeApp(firebaseConfig);

// Long polling: more reliable connection on Android phones/emulators
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
