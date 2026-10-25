import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { formatDA } from "../../lib/format";

const MenuItem = ({ setIsActive, dishes }) => {
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
            <button
              onClick={() => handleRemove(item)}
              className="p-2 text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 duration-150 rounded-xl"
            >
              Supprimer
            </button>
          </li>
        ))}
        {dishes.length === 0 && <p className="text-gray-400 py-10 text-center">Aucun plat. Ajoute ton premier plat !</p>}
      </ul>
    </>
  );
};

export default MenuItem;
