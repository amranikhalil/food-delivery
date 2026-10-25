import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { RESTAURANT_ID, DEFAULT_DELIVERY_FEE } from "@/config";
import { formatDA, normalizePhone } from "@/lib/format";

const SAVED_CUSTOMER_KEY = "customer";

const loadSavedCustomer = () => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_CUSTOMER_KEY)) || {};
  } catch {
    return {};
  }
};

export default function CustomerMenu() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cart, setCart] = useState({}); // dishId -> quantity
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setForm((f) => ({ ...f, ...loadSavedCustomer() }));

    const load = async () => {
      try {
        const resSnap = await getDoc(doc(db, "restaurants", RESTAURANT_ID));
        if (!resSnap.exists()) {
          setLoadError("Restaurant introuvable. As-tu lancé « npm run seed » ?");
          return;
        }
        setRestaurant({ ...resSnap.data(), id: resSnap.id });

        const dishSnap = await getDocs(
          query(collection(db, "dishes"), where("restaurantId", "==", RESTAURANT_ID))
        );
        setDishes(dishSnap.docs.map((d) => ({ ...d.data(), id: d.id })));
      } catch (e) {
        console.error(e);
        setLoadError("Impossible de charger le menu. Vérifie ta connexion internet.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const groups = {};
    dishes.forEach((d) => {
      const cat = d.category || "Menu";
      (groups[cat] = groups[cat] || []).push(d);
    });
    return Object.entries(groups);
  }, [dishes]);

  const cartItems = dishes
    .filter((d) => cart[d.id] > 0)
    .map((d) => ({ dishId: d.id, name: d.name, price: Number(d.price) || 0, quantity: cart[d.id] }));
  const itemCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = Number(restaurant?.deliveryFee ?? DEFAULT_DELIVERY_FEE);
  const total = subtotal + deliveryFee;

  const changeQty = (id, delta) =>
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + delta) }));

  const submitOrder = async (e) => {
    e.preventDefault();
    setFormError("");
    const phone = normalizePhone(form.phone);
    if (!form.name.trim()) return setFormError("Indique ton nom.");
    if (!phone) return setFormError("Numéro invalide. Exemple : 0550 12 34 56");
    if (!form.address.trim()) return setFormError("Indique ton adresse de livraison.");
    if (itemCount === 0) return setFormError("Ton panier est vide.");

    setSending(true);
    try {
      const orderRef = doc(collection(db, "orders"));
      const batch = writeBatch(db);
      batch.set(orderRef, {
        restaurantId: RESTAURANT_ID,
        restaurantName: restaurant.name || "",
        restaurantAddress: restaurant.address || "",
        userFirstName: form.name.trim(),
        userLastName: "",
        userPhoneNumber: phone,
        userAddress: form.address.trim(),
        note: form.note.trim(),
        items: cartItems,
        subtotal,
        deliveryFee,
        total,
        paymentMethod: "CASH_ON_DELIVERY",
        status: "PENDING",
        createdAt: serverTimestamp(),
      });
      // Same format as the mobile apps, so they keep working
      cartItems.forEach((item) => {
        batch.set(doc(db, "orderDishes", `${orderRef.id}_${item.dishId}`), {
          orderId: orderRef.id,
          dishId: item.dishId,
          quantity: item.quantity,
        });
      });
      await batch.commit();

      try {
        localStorage.setItem(
          SAVED_CUSTOMER_KEY,
          JSON.stringify({ name: form.name, phone: form.phone, address: form.address })
        );
      } catch {}
      router.push(`/commande/${orderRef.id}`);
    } catch (err) {
      console.error(err);
      setFormError("La commande n'a pas pu être envoyée. Réessaie.");
      setSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement du menu…</div>;
  }
  if (loadError) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-center text-red-600">{loadError}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Head>
        <title>{`${restaurant.name} – Commander en ligne`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Restaurant header */}
      <header className="bg-white shadow-sm">
        {restaurant.image && (
          <img src={restaurant.image} alt="" className="w-full h-40 object-cover" />
        )}
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">{restaurant.name}</h1>
          {restaurant.genre && <p className="text-gray-500">{restaurant.genre}</p>}
          {restaurant.address && <p className="text-sm text-gray-500 mt-1">📍 {restaurant.address}</p>}
          <div className="flex flex-wrap gap-2 mt-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">💵 Paiement à la livraison</span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">🛵 Livraison {formatDA(deliveryFee)}</span>
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                📞 {restaurant.phone}
              </a>
            )}
          </div>
        </div>
      </header>

      {!checkout ? (
        <main className="max-w-2xl mx-auto px-4 py-4">
          {dishes.length === 0 && (
            <p className="text-center text-gray-500 py-10">Le menu est vide pour le moment.</p>
          )}
          {categories.map(([category, items]) => (
            <section key={category} className="mb-6">
              <h2 className="text-lg font-bold text-gray-700 mb-2">{category}</h2>
              <ul className="space-y-3">
                {items.map((dish) => (
                  <li key={dish.id} className="bg-white rounded-xl shadow-sm p-3 flex gap-3 items-center">
                    {dish.image ? (
                      <img src={dish.image} alt="" className="w-20 h-20 rounded-lg object-cover flex-none" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-green-50 flex items-center justify-center text-3xl flex-none">
                        {dish.emoji || "🍽️"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{dish.name}</p>
                      {dish.description && <p className="text-sm text-gray-500 line-clamp-2">{dish.description}</p>}
                      <p className="font-bold text-green-600 mt-1">{formatDA(dish.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-none">
                      {cart[dish.id] > 0 && (
                        <>
                          <button
                            onClick={() => changeQty(dish.id, -1)}
                            className="w-9 h-9 rounded-full border-2 border-green-500 text-green-600 font-bold text-lg"
                            aria-label="Retirer"
                          >
                            −
                          </button>
                          <span className="w-5 text-center font-bold">{cart[dish.id]}</span>
                        </>
                      )}
                      <button
                        onClick={() => changeQty(dish.id, 1)}
                        className="w-9 h-9 rounded-full bg-green-500 text-white font-bold text-lg"
                        aria-label="Ajouter"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </main>
      ) : (
        <main className="max-w-2xl mx-auto px-4 py-4">
          <button onClick={() => setCheckout(false)} className="text-green-600 font-semibold mb-4">
            ← Retour au menu
          </button>

          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <h2 className="font-bold text-gray-800 mb-3">Ta commande</h2>
            {cartItems.map((i) => (
              <div key={i.dishId} className="flex justify-between py-1 text-gray-700">
                <span>{i.quantity} × {i.name}</span>
                <span>{formatDA(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between py-1 text-gray-500 border-t mt-2 pt-2">
              <span>Livraison</span>
              <span>{formatDA(deliveryFee)}</span>
            </div>
            <div className="flex justify-between py-1 font-bold text-lg text-gray-800">
              <span>Total</span>
              <span>{formatDA(total)}</span>
            </div>
          </div>

          <form onSubmit={submitOrder} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <h2 className="font-bold text-gray-800">Livraison</h2>
            <input
              className="w-full border-2 rounded-lg px-3 py-2 focus:border-green-500 outline-none"
              placeholder="Ton nom"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="w-full border-2 rounded-lg px-3 py-2 focus:border-green-500 outline-none"
              placeholder="Téléphone (ex : 0550 12 34 56)"
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="w-full border-2 rounded-lg px-3 py-2 focus:border-green-500 outline-none"
              placeholder="Adresse (quartier, rue, bâtiment)"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <textarea
              className="w-full border-2 rounded-lg px-3 py-2 focus:border-green-500 outline-none"
              placeholder="Repère ou remarque (ex : à côté de la pharmacie, sans oignon…)"
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
            <p className="text-sm text-gray-600">💵 Tu paies en espèces à la livraison.</p>
            {formError && <p className="text-red-600 text-sm">{formError}</p>}
            <button
              disabled={sending}
              className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-lg disabled:opacity-60"
            >
              {sending ? "Envoi…" : `Commander · ${formatDA(total)}`}
            </button>
          </form>
        </main>
      )}

      {/* Sticky cart bar */}
      {!checkout && itemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white border-t shadow-lg">
          <button
            onClick={() => {
              setCheckout(true);
              window.scrollTo(0, 0);
            }}
            className="max-w-2xl mx-auto w-full flex justify-between items-center py-3 px-4 rounded-xl bg-green-500 text-white font-bold"
          >
            <span className="bg-green-700 rounded-lg px-2">{itemCount}</span>
            <span>Voir le panier</span>
            <span>{formatDA(subtotal)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
