import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { RESTAURANT_ID } from "../../config";
import AddDishModal from "./AddDishModal";
import MenuItem from "./MenuItem";

const Menu = () => {
  const [isActive, setIsActive] = useState(false);
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "dishes"), where("restaurantId", "==", RESTAURANT_ID));
    return onSnapshot(q, (snap) => setDishes(snap.docs.map((d) => ({ ...d.data(), id: d.id }))));
  }, []);

  return (
    <div className="max-w-4xl pt-8 px-4 md:px-8">
      {isActive && <AddDishModal setIsActive={setIsActive} restaurantId={RESTAURANT_ID} />}
      <MenuItem setIsActive={setIsActive} dishes={dishes} />
    </div>
  );
};

export default Menu;
