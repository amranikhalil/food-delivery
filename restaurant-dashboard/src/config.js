// One restaurant per site: the Firestore id of the restaurant document.
export const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || "demo";

// Default delivery fee (DA) if the restaurant document doesn't set one.
export const DEFAULT_DELIVERY_FEE = 150;

// Cloudinary account used to upload dish photos (unsigned upload preset).
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
