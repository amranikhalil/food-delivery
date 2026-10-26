import { collection, doc, getDoc, getDocs, query, where, type DocumentData } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { RESTAURANT_ID, DEFAULT_DELIVERY_FEE } from "@/config";
import { BRAND } from "@/data/brand";
import menu from "@/data/menu.json";
import type { Dish, MenuSection, Restaurant } from "@/types/menu";

const str = (v: unknown, fallback = ""): string => (typeof v === "string" && v.trim() ? v.trim() : fallback);

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "menu";

/** Same ids as the seed script writes, so orders made from the fallback menu stay valid. */
export const FALLBACK_DISHES: Dish[] = menu.categories.flatMap((cat, ci) =>
  cat.items.map((item, i) => ({
    id: `${RESTAURANT_ID}-${item.slug}`,
    name: item.name,
    price: item.price,
    description: item.description,
    category: cat.name,
    image: item.image,
    emoji: "",
    order: ci * 100 + i,
  }))
);

export const toDish = (id: string, data: DocumentData): Dish => ({
  id,
  name: str(data.name, "Plat"),
  price: Number(data.price) || 0,
  description: str(data.description),
  category: str(data.category, "Menu"),
  image: str(data.image),
  emoji: str(data.emoji),
  order: typeof data.order === "number" ? data.order : null,
});

export const toRestaurant = (data: DocumentData | undefined): Restaurant => {
  const d = BRAND.defaults;
  if (!data) return d;
  return {
    name: str(data.name, d.name),
    genre: str(data.genre, d.genre),
    address: str(data.address, d.address),
    phone: str(data.phone, d.phone),
    hours: str(data.hours, d.hours),
    instagram: str(data.instagram, d.instagram).replace(/^@/, ""),
    deliveryFee: Number(data.deliveryFee ?? DEFAULT_DELIVERY_FEE) || 0,
  };
};

const sortDishes = (dishes: Dish[]): Dish[] =>
  [...dishes].sort(
    (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.name.localeCompare(b.name, "fr")
  );

/** Groups dishes by category, in menu order. Sections alternate list / cards like the printed menu. */
export const toSections = (dishes: Dish[]): MenuSection[] => {
  // Grouped by slug, so "Pizzas" and "pizzas " end up in the same section
  const groups = new Map<string, { name: string; dishes: Dish[] }>();
  sortDishes(dishes).forEach((d) => {
    const slug = slugify(d.category);
    const group = groups.get(slug) || { name: d.category, dishes: [] };
    group.dishes.push(d);
    groups.set(slug, group);
  });
  return Array.from(groups, ([slug, group], i) => ({
    name: group.name,
    slug: slug === "top" || slug === "infos" ? `menu-${slug}` : slug,
    layout: i % 2 === 0 ? "list" : "cards",
    dishes: group.dishes,
  }));
};

export interface MenuData {
  restaurant: Restaurant;
  dishes: Dish[];
  /** false when Firestore could not be reached and the built-in menu is shown */
  live: boolean;
}

const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
  Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);

/** Loads the restaurant and its menu. Never throws: falls back to the built-in menu. */
export async function fetchMenu(timeoutMs = 6000): Promise<MenuData> {
  try {
    const [resSnap, dishSnap] = await withTimeout(
      Promise.all([
        getDoc(doc(db, "restaurants", RESTAURANT_ID)),
        getDocs(query(collection(db, "dishes"), where("restaurantId", "==", RESTAURANT_ID))),
      ]),
      timeoutMs
    );
    const dishes = dishSnap.docs.map((d) => toDish(d.id, d.data()));
    return {
      restaurant: toRestaurant(resSnap.exists() ? resSnap.data() : undefined),
      dishes: dishes.length ? dishes : FALLBACK_DISHES,
      live: true,
    };
  } catch (e) {
    console.warn("[menu] Firestore unavailable, using the built-in menu.", e);
    return { restaurant: toRestaurant(undefined), dishes: FALLBACK_DISHES, live: false };
  }
}

export const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, "")}`;
