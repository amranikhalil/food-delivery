import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const input =
  "w-full px-3 py-2 text-gray-700 bg-transparent outline-none border-2 focus:border-green-500 shadow-sm rounded-lg";

const AddDishModal = ({ setIsActive, restaurantId }) => {
  const [dish, setDish] = useState({ name: "", price: "", category: "", image: "", description: "" });
  const [error, setError] = useState("");

  const set = (field) => (e) => setDish({ ...dish, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const price = Number(dish.price);
    if (!dish.name.trim()) return setError("Le nom est obligatoire.");
    if (!price || price <= 0) return setError("Le prix doit être un nombre (en DA).");

    await addDoc(collection(db, "dishes"), {
      name: dish.name.trim(),
      price,
      category: dish.category.trim(),
      image: dish.image.trim(),
      description: dish.description.trim(),
      restaurantId,
    });
    setIsActive(false);
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="fixed inset-0 w-full h-full bg-black opacity-60" onClick={() => setIsActive(false)}></div>
      <div className="flex items-center min-h-screen px-4 py-8">
        <div className="relative w-full max-w-lg p-6 mx-auto bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-2xl font-bold text-gray-800">Ajouter un plat</h4>
            <button className="p-2 text-gray-500 rounded-lg hover:bg-red-100 text-xl" onClick={() => setIsActive(false)}>
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input className={input} placeholder="Nom (ex : Chawarma poulet)" value={dish.name} onChange={set("name")} />
            <input className={input} placeholder="Prix en DA (ex : 450)" inputMode="numeric" value={dish.price} onChange={set("price")} />
            <input className={input} placeholder="Catégorie (ex : Sandwichs, Pizzas, Boissons)" value={dish.category} onChange={set("category")} />
            <input className={input} placeholder="Lien de l'image (optionnel)" value={dish.image} onChange={set("image")} />
            <input className={input} placeholder="Description (optionnel)" value={dish.description} onChange={set("description")} />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button className="w-full py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600">Ajouter</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDishModal;
