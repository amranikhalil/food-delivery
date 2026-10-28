import { formatDA } from "@/lib/format";
import type { Order } from "@/types/order";
export function buildOrderMessage(order: Order): string {
     const { userFirstName, userPhoneNumber, userAddress, note, items, deliveryFee, total } = order;
      const itemLines = items
    .map((item) => `• ${item.quantity} × ${item.name} — ${formatDA(item.price * item.quantity)}`)
    .join("\n");
  const lines = [
    "🛎️ Nouvelle commande",
    `👤 ${userFirstName} — ${userPhoneNumber}`,
    `📍 ${userAddress}`,
    note ? `📝 ${note}` : null,
    "",
    itemLines,
    "",
    `Livraison : ${formatDA(deliveryFee)}`,
    `TOTAL : ${formatDA(total)} (paiement à la livraison)`,
  ];

  return lines.filter((line) => line !== null).join("\n");
  
}
