import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { RESTAURANT_ID } from "../../config";
import { ACTIVE_STATUSES } from "../../lib/format";
import OrdersList from "./OrdersList";

const byNewest = (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);

// Short "ding" with the Web Audio API (no sound file needed)
const playDing = (audioCtx) => {
  if (!audioCtx) return;
  [880, 1320].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const start = audioCtx.currentTime + i * 0.25;
    gain.gain.setValueAtTime(0.3, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
    osc.start(start);
    osc.stop(start + 0.4);
  });
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef(null);
  const knownIds = useRef(null);

  useEffect(() => {
    // Filter by restaurant only, then sort/filter here: no Firestore index needed
    const q = query(collection(db, "orders"), where("restaurantId", "==", RESTAURANT_ID));

    return onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      const active = all.filter((o) => ACTIVE_STATUSES.includes(o.status)).sort(byNewest);

      const pendingIds = all.filter((o) => o.status === "PENDING").map((o) => o.id);
      if (knownIds.current) {
        const isNew = pendingIds.some((id) => !knownIds.current.has(id));
        if (isNew) playDing(audioRef.current);
      }
      knownIds.current = new Set(pendingIds);

      setOrders(active);
      const pendingCount = pendingIds.length;
      document.title = pendingCount > 0 ? `(${pendingCount}) Nouvelles commandes` : "Tableau de bord";
    });
  }, []);

  // Browsers only allow sound after a click, so the restaurant turns it on once
  const enableSound = () => {
    audioRef.current = audioRef.current || new (window.AudioContext || window.webkitAudioContext)();
    audioRef.current.resume();
    playDing(audioRef.current);
    setSoundOn(true);
  };

  return <OrdersList orders={orders} soundOn={soundOn} onEnableSound={enableSound} />;
};

export default Orders;
