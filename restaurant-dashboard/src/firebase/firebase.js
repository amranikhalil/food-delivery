import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your own Firebase project, set in .env.local (see .env.local.example)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error("Firebase n'est pas configuré : copie .env.local.example en .env.local et remplis-le.");
}

export const app = getApps()[0] || initializeApp(firebaseConfig);
export const db = getFirestore(app);
