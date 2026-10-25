export const formatDA = (amount) =>
  `${Number(amount || 0).toLocaleString("fr-DZ")} DA`;

export const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return "—";
  return timestamp.toDate().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Algerian mobile numbers: 05/06/07 + 8 digits (also accepts +213 / 00213)
export const normalizePhone = (raw) => {
  const digits = (raw || "").replace(/[^\d+]/g, "");
  const local = digits.replace(/^(\+213|00213)/, "0");
  return /^0[567]\d{8}$/.test(local) ? local : null;
};

export const STATUS = {
  PENDING: { label: "En attente", emoji: "⏳", className: "border-yellow-400 text-yellow-700 bg-yellow-50" },
  ACCEPTED: { label: "Acceptée", emoji: "👍", className: "border-blue-400 text-blue-700 bg-blue-50" },
  PREPARING: { label: "En préparation", emoji: "🍳", className: "border-orange-400 text-orange-700 bg-orange-50" },
  READY: { label: "Prête (attend le livreur)", emoji: "📦", className: "border-purple-400 text-purple-700 bg-purple-50" },
  PICKEDUP: { label: "En livraison", emoji: "🛵", className: "border-indigo-400 text-indigo-700 bg-indigo-50" },
  COMPLETE: { label: "Livrée", emoji: "✅", className: "border-green-500 text-green-700 bg-green-50" },
  DECLINED: { label: "Refusée", emoji: "❌", className: "border-red-400 text-red-700 bg-red-50" },
};

export const ACTIVE_STATUSES = ["PENDING", "ACCEPTED", "PREPARING", "READY", "PICKEDUP"];

// Next step for the restaurant, from each status
export const NEXT_STEP = {
  ACCEPTED: { to: "PREPARING", label: "Commencer la préparation" },
  PREPARING: { to: "READY", label: "Commande prête" },
  // Normally done by the driver app; kept here so a restaurant without the app can finish the order
  READY: { to: "PICKEDUP", label: "Remise au livreur" },
  PICKEDUP: { to: "COMPLETE", label: "Marquer comme livrée" },
};
