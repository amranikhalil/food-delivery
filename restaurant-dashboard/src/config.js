// One restaurant per site: the Firestore id of the restaurant document.
export const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || "demo";

// Default delivery fee (DA) if the restaurant document doesn't set one.
export const DEFAULT_DELIVERY_FEE = 150;
