import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { formatDA, formatDate, NEXT_STEP, STATUS } from "../../lib/format";

const button = "flex-1 py-3 rounded-xl font-bold text-base duration-150 disabled:opacity-50";

const OrderModal = ({ order, onClose }) => {
  const [saving, setSaving] = useState(false);
  const status = STATUS[order.status] || { label: order.status };
  const next = NEXT_STEP[order.status];
  const whatsapp = order.userPhoneNumber ? `https://wa.me/213${order.userPhoneNumber.slice(1)}` : null;

  const setStatus = async (newStatus) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });
    } catch (e) {
      console.error(e);
      alert("Erreur : le statut n'a pas pu être changé.");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="fixed inset-0 w-full h-full bg-black opacity-60" onClick={onClose}></div>
      <div className="flex items-center min-h-screen px-4 py-8">
        <div className="relative w-full max-w-2xl p-6 mx-auto bg-white rounded-2xl shadow-lg space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-2xl font-bold text-gray-800">
                Commande #{order.id.slice(0, 6).toUpperCase()}
              </h4>
              <p className="text-gray-500">{formatDate(order.createdAt)}</p>
            </div>
            <button className="p-2 text-gray-500 rounded-lg hover:bg-red-100 text-xl" onClick={onClose}>
              ✕
            </button>
          </div>

          <p className={`inline-block px-3 py-1 rounded-xl font-semibold border ${status.className}`}>
            {status.emoji} {status.label}
          </p>

          {/* Customer */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1">
            <p className="font-bold text-lg text-gray-800">{order.userFirstName} {order.userLastName}</p>
            <p className="text-gray-700">📍 {order.userAddress}</p>
            {order.note && <p className="text-gray-700">📝 {order.note}</p>}
            <div className="flex gap-2 pt-2">
              <a href={`tel:${order.userPhoneNumber}`} className="px-3 py-2 rounded-lg bg-white border font-semibold">
                📞 {order.userPhoneNumber}
              </a>
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-green-500 text-white font-semibold">
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            {(order.items || []).map((item) => (
              <div key={item.dishId} className="flex justify-between py-2 border-b text-lg">
                <span>
                  <span className="font-bold text-green-600">{item.quantity} ×</span> {item.name}
                </span>
                <span className="text-gray-600">{formatDA(item.price * item.quantity)}</span>
              </div>
            ))}
            {order.deliveryFee != null && (
              <div className="flex justify-between py-2 text-gray-500">
                <span>Livraison</span>
                <span>{formatDA(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 font-bold text-xl text-gray-800">
              <span>Total (espèces à la livraison)</span>
              <span>{formatDA(order.total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {order.status === "PENDING" && (
              <>
                <button disabled={saving} onClick={() => setStatus("ACCEPTED")} className={`${button} bg-green-500 text-white hover:bg-green-600`}>
                  Accepter
                </button>
                <button disabled={saving} onClick={() => setStatus("DECLINED")} className={`${button} bg-red-100 text-red-700 hover:bg-red-200`}>
                  Refuser
                </button>
              </>
            )}
            {next && (
              <button disabled={saving} onClick={() => setStatus(next.to)} className={`${button} bg-green-500 text-white hover:bg-green-600`}>
                {next.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
