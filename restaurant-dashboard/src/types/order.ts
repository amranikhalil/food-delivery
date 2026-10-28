import type { Timestamp } from "firebase/firestore";
import type { OrderStatus } from "@/lib/format";

export interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  userFirstName: string;
  userLastName: string;
  userPhoneNumber: string;
  userAddress: string;
  note: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "CASH_ON_DELIVERY";
  status: OrderStatus;
  createdAt: Timestamp}