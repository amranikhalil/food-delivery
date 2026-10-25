import { useState } from "react";
import OrderItem from "./OrderItem";
import OrderModal from "./OrderModal";

const OrdersList = ({ orders, soundOn, onEnableSound }) => {
  const [selectedId, setSelectedId] = useState(null);
  // Look the order up in the live list, so the modal updates in real time
  const selectedOrder = orders.find((o) => o.id === selectedId);

  return (
    <>
      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedId(null)} />}
      <div className="max-w-screen-xl mx-auto pt-8 px-4 md:px-8">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-800 text-3xl font-bold">Commandes en cours</h3>
          <button
            onClick={onEnableSound}
            className={`px-4 py-2 rounded-xl font-semibold ${
              soundOn ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800 animate-pulse"
            }`}
          >
            {soundOn ? "🔔 Son activé" : "🔕 Activer le son des nouvelles commandes"}
          </button>
        </div>

        <div className="mt-10 relative h-max overflow-auto">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">🍽️</p>
              <h1 className="font-bold text-gray-500 text-xl">Aucune commande en cours</h1>
              <p className="text-gray-400">Les nouvelles commandes apparaîtront ici automatiquement.</p>
            </div>
          ) : (
            <table className="w-full table-auto text-sm text-left">
              <thead className="text-gray-600 font-medium border-b">
                <tr>
                  <th className="py-3 pr-6 text-base">Heure</th>
                  <th className="py-3 pr-6 text-base">N°</th>
                  <th className="py-3 pr-6 text-base">Client</th>
                  <th className="py-3 pr-6 text-base">Téléphone</th>
                  <th className="py-3 pr-6 text-base">Total</th>
                  <th className="py-3 pr-6 text-base">Statut</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 divide-y-2">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedId(order.id)}
                    className={`cursor-pointer hover:bg-green-50 ${order.status === "PENDING" ? "bg-yellow-50 font-semibold" : ""}`}
                  >
                    <OrderItem order={order} />
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersList;
