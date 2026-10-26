import type { Dish, Restaurant } from "@/types/menu";

// Brand copy for the customer site. Values the restaurant can edit
// (address, phone, hours…) come from Firestore and override `defaults`.
export const BRAND = {
  name: "Benny's",
  tagline: "Street Food",
  since: 1970,
  headline: { start: "Burgers & tenders,", accent: "façon Benny's." },
  lead: "Burgers généreux, tenders croustillants et donettes de poulet farcies au fromage.",
  hero: {
    image: "/menu/tenders-10.png",
    alt: "Tenders 10 pièces avec frites et deux sauces",
    width: 455,
    height: 240,
  },
  infosTitle: "Passez nous voir.",
  defaults: {
    name: "Benny's",
    genre: "Street food",
    address: "Centre-ville",
    phone: "",
    hours: "Tous les jours · 11h – 23h",
    instagram: "bennys.dz",
    deliveryFee: 150,
  } satisfies Restaurant,
};

// The three prices under the hero buttons. Each shows the lowest price of the
// dishes it matches, so it stays right when prices change in the dashboard.
export const HERO_STATS: { label: string; match: (d: Dish) => boolean }[] = [
  { label: "Burgers dès", match: (d) => /burger/i.test(d.category) },
  { label: "Tenders ×10", match: (d) => /tenders\s*10/i.test(d.name) },
  { label: "Donette dès", match: (d) => /donette/i.test(d.name) },
];
