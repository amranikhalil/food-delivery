export interface Dish {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  emoji: string;
  /** Position in the menu. Dishes added from the dashboard have none and go last. */
  order: number | null;
}

export interface Restaurant {
  name: string;
  genre: string;
  address: string;
  phone: string;
  hours: string;
  instagram: string;
  deliveryFee: number;
}

export type SectionLayout = "list" | "cards";

export interface MenuSection {
  name: string;
  slug: string;
  layout: SectionLayout;
  dishes: Dish[];
}

export interface CartLine {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  emoji: string;
}
