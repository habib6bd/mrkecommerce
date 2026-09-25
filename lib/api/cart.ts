import { ServerCart } from "@/types/cart";
import { apiRequest } from "./client";
import { mapCart } from "./mappers";

export async function getCart(token: string): Promise<ServerCart> {
  const data = await apiRequest<unknown>("/cart/", { token });
  return mapCart(data);
}

export async function addCartItem(
  token: string,
  productId: number,
  quantity = 1
): Promise<ServerCart> {
  const data = await apiRequest<unknown>("/cart/", {
    method: "POST",
    token,
    body: { product_id: productId, quantity },
  });
  return mapCart(data);
}

export async function updateCartItem(
  token: string,
  itemId: number,
  quantity: number
): Promise<ServerCart> {
  const data = await apiRequest<unknown>(`/cart/items/${itemId}/`, {
    method: "PATCH",
    token,
    body: { quantity },
  });
  return mapCart(data);
}

export async function removeCartItem(token: string, itemId: number): Promise<ServerCart> {
  const data = await apiRequest<unknown>(`/cart/items/${itemId}/`, {
    method: "DELETE",
    token,
  });
  return mapCart(data);
}
