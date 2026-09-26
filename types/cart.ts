import { Product } from "./product";

export type ServerCartItem = {
  id: number;
  product: Product;
  quantity: number;
  lineTotal: number;
  addedAt: string;
};

export type ServerCart = {
  id: number;
  items: ServerCartItem[];
  total: number;
  updatedAt: string;
};

export type WishlistItem = {
  id: number;
  product: Product;
  addedAt: string;
};

/** Unified cart/wishlist line shape used by the UI in both guest and logged-in modes. */
export type CartLine = { id: string; product: Product; quantity: number };
export type WishlistLine = { id: string; product: Product };
