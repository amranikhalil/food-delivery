import { useState } from "react";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { formatDA } from "../../lib/format";
import { uploadImage } from "../../lib/uploadImage";

const MenuItem = ({ setIsActive, dishes }) => {
  const [uploadingId, setUploadingId] = useState(null);

  const handlePhoto = async (dish, e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setUploadingId(dish.id);
    try {
      const image = await uploadImage(file);
      await updateDoc(doc(db, "dishes", dish.id), { image });
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const handleRemove = async (dish) => {
    if (!confirm(`Supprimer « ${dish.name} » du menu ?`)) return;
    await deleteDoc(doc(db, "dishes", dish.id));
  };

  return (
    <>
      <div className="items-start justify-between sm:flex">
        <h4 className="text-gray-800 text-3xl font-bold">Menu</h4>
        <button
          onClick={() => setIsActive(true)}
          className="inline-flex items-center gap-1 py-2 px-4 mt-2 font-semibold text-white bg-green-500 hover:bg-green-600 duration-150 rounded-xl sm:mt-0"
        >
          + Ajouter un plat
        </button>
      </div>
      <ul className="mt-10 divide-y">
        {dishes.map((item) => (
          <li key={item.id} className="py-5 flex items-center justify-between">
            <div className="flex gap-3 items-center">
              {item.image ? (
                <img src={item.image} alt="" className="flex-none w-20 h-20 rounded-xl object-cover" />
              ) : (
                <div className="flex-none w-20 h-20 rounded-xl bg-green-50 flex items-center justify-center text-3xl">
                  {item.emoji || "🍽️"}
                </div>
              )}
              <div>
                <span className="block text-lg text-gray-700 font-bold">{item.name}</span>
                {item.category && <span className="block text-sm text-gray-400">{item.category}</span>}
                <span className="block text-lg text-gray-600">{formatDA(item.price)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <label
                className={`p-2 text-sm font-semibold text-green-700 bg-green-100 hover:bg-green-200 duration-150 rounded-xl ${
                  uploadingId === item.id ? "opacity-60 pointer-events-none" : "cursor-pointer"
                }`}
              >
                {uploadingId === item.id ? "Envoi…" : "Changer la photo"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(item, e)} />
              </label>
              <button
                onClick={() => handleRemove(item)}
                className="p-2 text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 duration-150 rounded-xl"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
        {dishes.length === 0 && (
          <p className="text-gray-400 py-10 text-center">Aucun plat. Ajoute ton premier plat !</p>
        )}
      </ul>
    </>
  );
};

export default MenuItem;
