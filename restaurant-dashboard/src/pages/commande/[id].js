import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { formatDA, STATUS } from "@/lib/format";

const STEPS = ["PENDING", "ACCEPTED", "PREPARING", "READY", "COMPLETE"];

export default function OrderTracking() {
  const { query } = useRouter();
  const [order, setOrder] = useState(undefined);

  useEffect(() => {
    if (!query.id) return;
    // Live updates: the page changes as soon as the restaurant updates the order
    return onSnapshot(doc(db, "orders", query.id), (snap) =>
      setOrder(snap.exists() ? { ...snap.data(), id: snap.id } : null)
    );
  }, [query.id]);

  if (order === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement…</div>;
  }
  if (order === null) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Commande introuvable.</div>;
  }

  const status = STATUS[order.status] || STATUS.PENDING;
  const stepIndex = STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <Head>
        <title>Suivi de commande</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="max-w-md mx-auto space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="text-5xl mb-2">{status.emoji}</div>
          <h1 className="text-2xl font-bold text-gray-800">{status.label}</h1>
          <p className="text-gray-500 mt-1">{order.restaurantName}</p>
          {order.status === "PENDING" && (
            <p className="text-sm text-gray-500 mt-3">
              Le restaurant va confirmer ta commande. Garde ton téléphone à portée de main.
            </p>
          )}
          {order.status === "DECLINED" && (
            <p className="text-sm text-gray-500 mt-3">
              Désolé, le restaurant ne peut pas préparer ta commande pour le moment.
            </p>
          )}
        </div>

        {order.status !== "DECLINED" && (
          <ol className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            {STEPS.map((s, i) => (
              <li key={s} className={`flex items-center gap-3 ${i <= stepIndex ? "text-gray-800" : "text-gray-300"}`}>
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    i <= stepIndex ? "bg-green-500 text-white" : "bg-gray-200"
                  }`}
                >
                  {i < stepIndex ? "✓" : i + 1}
                </span>
                {STATUS[s].label}
              </li>
            ))}
          </ol>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold text-gray-800 mb-2">Détails</h2>
          {(order.items || []).map((i) => (
            <div key={i.dishId} className="flex justify-between text-gray-700 py-0.5">
              <span>{i.quantity} × {i.name}</span>
              <span>{formatDA(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-gray-800 border-t mt-2 pt-2">
            <span>Total à payer à la livraison</span>
            <span>{formatDA(order.total)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">📍 {order.userAddress}</p>
        </div>

        <Link href="/" className="block text-center text-green-600 font-semibold">
          Commander à nouveau
        </Link>
      </div>
    </div>
  );
}
