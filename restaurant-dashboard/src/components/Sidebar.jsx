import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { navigation } from "../data/navigation";
import Orders from "./Orders/Orders";
import OrderHistory from "./OrderHistory/OrderHistory";
import Menu from "./Menu/Menu";
import Settings from "./Settings/Settings";
import { db } from "../firebase/firebase";
import { RESTAURANT_ID } from "../config";

const Sidebar = () => {
  const [active, setActive] = useState(0);
  const [restaurant, setRestaurant] = useState({});

  useEffect(() => {
    return onSnapshot(doc(db, "restaurants", RESTAURANT_ID), (snap) => {
      if (snap.exists()) setRestaurant({ ...snap.data(), id: snap.id });
    });
  }, []);

  return (
    <div className="flex h-screen">
      <div className="flex-none w-3/12">
        <nav className="fixed top-0 left-0 w-full h-full border-r bg-white space-y-10 sm:w-80">
          <div className="flex flex-col h-full">
            <div className="h-20 flex items-center px-8">
              <p className="font-bold text-2xl">Tableau de bord</p>
            </div>
            <div className="flex-1 flex flex-col h-full overflow-auto">
              <ul className="px-4 text-sm font-medium flex-1">
                {navigation.map((item, index) => (
                  <li key={index} onClick={() => setActive(index)}>
                    <div
                      className={`my-3 cursor-pointer flex items-center gap-x-2 text-gray-700 text-base p-2 rounded-xl hover:bg-green-100 active:bg-green-400 duration-150 ${
                        active === index ? "bg-green-100 border-l-4 border-b-4 border-green-500" : ""
                      }`}
                    >
                      <div className="text-gray-500">{item.icon}</div>
                      {item.name}
                    </div>
                  </li>
                ))}
              </ul>
              <div>
                <div className="px-4 pb-4">
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-x-2 text-green-700 font-semibold text-base p-2 rounded-xl hover:bg-green-100 duration-150"
                  >
                    🌐 Voir le site client ↗
                  </Link>
                </div>
                <div className="py-4 px-4 border-t">
                  <div className="flex items-center gap-x-4">
                    {restaurant.image ? (
                      <img src={restaurant.image} alt="" className="w-16 h-16 object-cover rounded-full" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-2xl">🍽️</div>
                    )}
                    <span className="block text-gray-700 text-base font-bold">{restaurant.name || "Mon restaurant"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="flex-auto w-64">
        {active === 0 && <Orders />}
        {active === 1 && <Menu />}
        {active === 2 && <OrderHistory />}
        {active === 3 && <Settings />}
      </div>
    </div>
  );
};

export default Sidebar;
