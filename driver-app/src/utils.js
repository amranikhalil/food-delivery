import { Linking } from "react-native";

export const formatDA = (amount) => `${Number(amount || 0).toLocaleString("fr-FR")} DA`;

export const hasCoords = (lat, lng) => typeof lat === "number" && typeof lng === "number";

export const callPhone = (phone) => phone && Linking.openURL(`tel:${phone}`);

// Algerian number 0XXXXXXXXX -> wa.me/213XXXXXXXXX
export const openWhatsApp = (phone) => phone && Linking.openURL(`https://wa.me/213${phone.slice(1)}`);

// Opens Google Maps with directions: uses GPS coordinates if the order has them, otherwise the written address
export const openDirections = (order) => {
  const destination = hasCoords(order.userLatitude, order.userLongitude)
    ? `${order.userLatitude},${order.userLongitude}`
    : order.userAddress;
  Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination || "")}`
  );
};

export const DRIVER_STATUSES = ["READY", "PICKEDUP"];
