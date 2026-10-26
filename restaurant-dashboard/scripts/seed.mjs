// Fills Firestore with a demo restaurant and menu.
// Run: npm run seed   (reads the Firebase config from .env.local)
// Safe to run several times: it overwrites the same documents.
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, writeBatch } from "firebase/firestore";
import menu from "../src/data/menu.json" with { type: "json" };

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

// Same menu as the website's built-in fallback (src/data/menu.json)
const restaurant = {
  name: "Benny's",
  genre: "Street food · Since 1970",
  address: "Centre-ville",
  phone: "0550 00 00 00",
  hours: "Tous les jours · 11h – 23h",
  instagram: "bennys.dz",
  deliveryFee: 150,
  image: "",
};

const dishes = menu.categories.flatMap((cat, ci) =>
  cat.items.map((item, i) => ({
    id: `${RESTAURANT_ID}-${item.slug}`,
    data: {
      name: item.name,
      price: item.price,
      description: item.description,
      category: cat.name,
      image: item.image,
      emoji: "",
      order: ci * 100 + i,
      restaurantId: RESTAURANT_ID,
    },
  }))
);

await setDoc(doc(db, "restaurants", RESTAURANT_ID), restaurant, { merge: true });

const batch = writeBatch(db);
// Remove the dishes of the previous demo menu ("-dish-1" … "-dish-10")
for (let i = 1; i <= 10; i++) batch.delete(doc(db, "dishes", `${RESTAURANT_ID}-dish-${i}`));
dishes.forEach(({ id, data }) => batch.set(doc(db, "dishes", id), data));
await batch.commit();

console.log(`✅ Restaurant « ${restaurant.name} » (id: ${RESTAURANT_ID}) et ${dishes.length} plats ajoutés.`);
process.exit(0);
