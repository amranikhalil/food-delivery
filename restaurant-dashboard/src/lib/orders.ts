import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { RESTAURANT_ID } from "@/config";
import { normalizePhone } from "@/lib/format";
import type { CartLine, Restaurant } from "@/types/menu";

export interface CustomerForm {
  name: string;
  phone: string;
  address: string;
  note: string;
}

const SAVED_CUSTOMER_KEY = "customer";

export const loadSavedCustomer = (): Partial<CustomerForm> => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_CUSTOMER_KEY) || "{}") || {};
  } catch {
    return {};
  }
};

/** Returns an error message, or null when the form is valid. */
export const validateCustomer = (form: CustomerForm, itemCount: number): string | null => {
  if (!form.name.trim()) return "Indique ton nom.";
  if (!normalizePhone(form.phone)) return "Numéro invalide. Exemple : 0550 12 34 56";
  if (!form.address.trim()) return "Indique ton adresse de livraison.";
  if (itemCount === 0) return "Ton panier est vide.";
  return null;
};

/** Writes the order (cash on delivery) and returns its id. */
export async function placeOrder(form: CustomerForm, lines: CartLine[], restaurant: Restaurant): Promise<string> {
  const items = lines.map(({ dishId, name, price, quantity }) => ({ dishId, name, price, quantity }));
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = restaurant.deliveryFee;

  const orderRef = doc(collection(db, "orders"));
  const batch = writeBatch(db);
  batch.set(orderRef, {
    restaurantId: RESTAURANT_ID,
    restaurantName: restaurant.name,
    restaurantAddress: restaurant.address,
    userFirstName: form.name.trim(),
    userLastName: "",
    userPhoneNumber: normalizePhone(form.phone),
    userAddress: form.address.trim(),
    note: form.note.trim(),
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    paymentMethod: "CASH_ON_DELIVERY",
    status: "PENDING",
    createdAt: serverTimestamp(),
  });
  // Same format as the mobile apps, so they keep working
  items.forEach((item) => {
    batch.set(doc(db, "orderDishes", `${orderRef.id}_${item.dishId}`), {
      orderId: orderRef.id,
      dishId: item.dishId,
      quantity: item.quantity,
    });
  });
  await batch.commit();

  try {
    localStorage.setItem(
      SAVED_CUSTOMER_KEY,
      JSON.stringify({ name: form.name, phone: form.phone, address: form.address })
    );
  } catch {}
  return orderRef.id;
}
export async function notifyRestaurant(orderId: string){
   fetch("/api/notify-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
    keepalive: true,
  }).catch(() => {});
}
