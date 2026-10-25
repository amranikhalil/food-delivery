import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { RESTAURANT_ID, DEFAULT_DELIVERY_FEE } from "../../config";

const FIELDS = [
  { name: "name", label: "Nom du restaurant", placeholder: "Ex : Chez Karim" },
  { name: "genre", label: "Type de cuisine", placeholder: "Ex : Fast-food, Pizzeria" },
  { name: "address", label: "Adresse", placeholder: "Ex : Rue Didouche Mourad, Alger" },
  { name: "phone", label: "Téléphone", placeholder: "Ex : 0550 12 34 56" },
  { name: "deliveryFee", label: "Frais de livraison (DA)", placeholder: String(DEFAULT_DELIVERY_FEE) },
  { name: "image", label: "Lien de la photo de couverture", placeholder: "https://…" },
];

const Settings = () => {
  const [data, setData] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "restaurants", RESTAURANT_ID)).then((snap) => {
      if (snap.exists()) setData(snap.data());
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const update = { ...data, deliveryFee: Number(data.deliveryFee) || 0 };
    // merge: also creates the restaurant if it doesn't exist yet
    await setDoc(doc(db, "restaurants", RESTAURANT_ID), update, { merge: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl pt-8 px-4 md:px-8">
      <h4 className="text-gray-800 text-3xl font-bold">Paramètres du restaurant</h4>
      <div className="mt-8 grid grid-cols-2 gap-6">
        {FIELDS.map((f) => (
          <label key={f.name} className="block rounded-2xl bg-white shadow-sm border p-5">
            <span className="text-lg font-bold text-gray-900">{f.label}</span>
            <input
              type="text"
              value={data[f.name] ?? ""}
              onChange={(e) => setData({ ...data, [f.name]: e.target.value })}
              placeholder={f.placeholder}
              className="w-full border border-gray-300 rounded-xl py-2 px-3 mt-3 focus:outline-none focus:ring focus:ring-green-200"
            />
          </label>
        ))}
      </div>
      <button className="mt-8 w-full py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600">
        {saved ? "Enregistré ✓" : "Enregistrer"}
      </button>
    </form>
  );
};

export default Settings;
