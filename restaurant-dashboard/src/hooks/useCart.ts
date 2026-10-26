import { useCallback, useEffect, useMemo, useState } from "react";
import type { CartLine, Dish } from "@/types/menu";

const STORAGE_KEY = "cart";

type Quantities = Record<string, number>;

/** Cart kept in sessionStorage, so a page refresh doesn't empty it. */
export function useCart(dishes: Dish[]) {
  const [qty, setQty] = useState<Quantities>({});

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
      if (saved && typeof saved === "object") setQty(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(qty));
    } catch {}
  }, [qty]);

  const change = useCallback(
    (id: string, delta: number) =>
      setQty((q) => {
        const next = { ...q, [id]: Math.max(0, Math.min(99, (q[id] || 0) + delta)) };
        if (!next[id]) delete next[id];
        return next;
      }),
    []
  );

  const clear = useCallback(() => setQty({}), []);

  const lines: CartLine[] = useMemo(
    () =>
      dishes
        .filter((d) => qty[d.id] > 0)
        .map((d) => ({
          dishId: d.id,
          name: d.name,
          price: d.price,
          quantity: qty[d.id],
          image: d.image,
          emoji: d.emoji,
        })),
    [dishes, qty]
  );

  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  return { qty, lines, count, subtotal, add: (id: string) => change(id, 1), remove: (id: string) => change(id, -1), clear };
}

export type Cart = ReturnType<typeof useCart>;
