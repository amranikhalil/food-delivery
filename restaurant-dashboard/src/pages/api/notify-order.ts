
import type { NextApiRequest, NextApiResponse } from "next";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { buildOrderMessage } from "@/lib/orderMessage";
import type { Order } from "@/types/order";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Accepter uniquement POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. Vérifier orderId
    const { orderId } = req.body;

    if (typeof orderId !== "string" || orderId.trim() === "") {
      return res.status(400).json({ error: "Missing orderId" });
    }

    // 3. Vérifier la configuration Telegram
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Telegram environment variables missing");
      return res.status(500).json({ error: "Server not configured" });
    }

    // 4. Récupérer la commande depuis Firestore
    const snapshot = await getDoc(doc(db, "orders", orderId));

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = snapshot.data() as Order;

    // 5. Envoyer la notification Telegram
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: buildOrderMessage(order),
        }),
      }
    );

    if (!telegramRes.ok) {
      console.error("Telegram error:", await telegramRes.text());
      return res.status(502).json({ error: "Telegram notification failed" });
    }

    // 6. Confirmer le succès
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Order notification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
