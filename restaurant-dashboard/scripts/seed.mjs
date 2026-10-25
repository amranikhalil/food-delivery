// Fills Firestore with a demo restaurant and menu.
// Run: npm run seed   (reads the Firebase config from .env.local)
// Safe to run several times: it overwrites the same documents.
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, writeBatch } from "firebase/firestore";

const env = process.env;
if (!env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error("❌ .env.local manquant ou incomplet (voir .env.local.example).");
  process.exit(1);
}

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);
const RESTAURANT_ID = env.NEXT_PUBLIC_RESTAURANT_ID || "demo";

const restaurant = {
  name: "Chez Karim",
  genre: "Fast-food · Pizzeria",
  address: "Centre-ville",
  phone: "0550 00 00 00",
  deliveryFee: 150,
  image: "",
};

const dishes = [
  { category: "Sandwichs", emoji: "🌯", name: "Chawarma poulet", price: 400, description: "Poulet mariné, frites, sauce blanche" },
  { category: "Sandwichs", emoji: "🌯", name: "Chawarma viande", price: 500, description: "Viande, frites, sauce harissa" },
  { category: "Sandwichs", emoji: "🥙", name: "Tacos poulet", price: 550, description: "Poulet, frites, sauce fromagère" },
  { category: "Sandwichs", emoji: "🍔", name: "Burger classique", price: 450, description: "Steak, cheddar, salade, tomate" },
  { category: "Pizzas", emoji: "🍕", name: "Pizza Margherita", price: 600, description: "Tomate, mozzarella, olives" },
  { category: "Pizzas", emoji: "🍕", name: "Pizza Thon", price: 750, description: "Tomate, mozzarella, thon, oignons" },
  { category: "Pizzas", emoji: "🍕", name: "Pizza Viande hachée", price: 850, description: "Viande hachée, poivrons, fromage" },
  { category: "Accompagnements", emoji: "🍟", name: "Frites", price: 150, description: "Portion de frites maison" },
  { category: "Boissons", emoji: "🥤", name: "Soda 33 cl", price: 100, description: "" },
  { category: "Boissons", emoji: "💧", name: "Eau minérale 50 cl", price: 50, description: "" },
];

await setDoc(doc(db, "restaurants", RESTAURANT_ID), restaurant, { merge: true });

const batch = writeBatch(db);
dishes.forEach((dish, i) => {
  batch.set(doc(db, "dishes", `${RESTAURANT_ID}-dish-${i + 1}`), { ...dish, image: "", restaurantId: RESTAURANT_ID });
});
await batch.commit();

console.log(`✅ Restaurant « ${restaurant.name} » (id: ${RESTAURANT_ID}) et ${dishes.length} plats ajoutés.`);
process.exit(0);
