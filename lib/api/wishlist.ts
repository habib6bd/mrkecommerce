import { WishlistItem } from "@/types/cart";
import { apiRequest } from "./client";
import { mapWishlistItem } from "./mappers";

export async function listWishlist(token: string): Promise<WishlistItem[]> {
  const data = await apiRequest<unknown[]>("/wishlist/", { token });
  return data.map(mapWishlistItem);
}

export async function addWishlistItem(token: string, productId: number): Promise<WishlistItem> {
  const data = await apiRequest<unknown>("/wishlist/", {
    method: "POST",
    token,
    body: { product_id: productId },
  });
  return mapWishlistItem(data);
}

export async function removeWishlistItem(token: string, itemId: number): Promise<void> {
  await apiRequest<void>(`/wishlist/${itemId}/`, { method: "DELETE", token });
}
