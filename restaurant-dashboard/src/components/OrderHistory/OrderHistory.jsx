import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { RESTAURANT_ID } from "../../config";
import { formatDA } from "../../lib/format";
import OrderItem from "../Orders/OrderItem";

const isToday = (ts) => {
  if (!ts?.toDate) return false;
  return ts.toDate().toDateString() === new Date().toDateString();
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "orders"), where("restaurantId", "==", RESTAURANT_ID));
    return onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      all.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(all);
    });
  }, []);

  const today = orders.filter((o) => isToday(o.createdAt));
  const deliveredToday = today.filter((o) => o.status === "COMPLETE");
  const stats = [
    { label: "Commandes aujourd'hui", value: today.length },
    { label: "Livrées aujourd'hui", value: deliveredToday.length },
    { label: "Chiffre d'affaires du jour", value: formatDA(deliveredToday.reduce((s, o) => s + (o.total || 0), 0)) },
  ];

  return (
    <div className="max-w-screen-xl mx-auto pt-8 px-4 md:px-8">
      <h3 className="text-gray-800 text-3xl font-bold">Historique</h3>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm border p-4">
            <p className="text-gray-500 text-sm">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 relative h-max overflow-auto">
        <table className="w-full table-auto text-sm text-left">
          <thead className="text-gray-600 font-medium border-b">
            <tr>
              <th className="py-3 pr-6 text-base">Date</th>
              <th className="py-3 pr-6 text-base">N°</th>
              <th className="py-3 pr-6 text-base">Client</th>
              <th className="py-3 pr-6 text-base">Téléphone</th>
              <th className="py-3 pr-6 text-base">Total</th>
              <th className="py-3 pr-6 text-base">Statut</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 divide-y-2">
            {orders.map((order) => (
              <tr key={order.id}>
                <OrderItem order={order} />
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center text-gray-400 py-10">{"Aucune commande pour l'instant."}</p>}
      </div>
    </div>
  );
};

export default OrderHistory;
