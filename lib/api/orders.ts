import { UpdateOrderStatusPayload } from "@/types/admin";
import { CreateOrderPayload, Order, OrderStatus } from "@/types/order";
import { apiRequest } from "./client";
import { mapOrder, toOrderPayload } from "./mappers";

export async function createOrder(token: string, payload: CreateOrderPayload): Promise<Order> {
  const data = await apiRequest<unknown>("/orders/", {
    method: "POST",
    token,
    body: toOrderPayload(payload),
  });
  return mapOrder(data);
}

/** Returns the current user's own orders, or every order when the user is staff. */
export async function listOrders(token: string, params: { status?: OrderStatus } = {}): Promise<Order[]> {
  const data = await apiRequest<unknown[]>("/orders/", { token, params });
  return data.map(mapOrder);
}

export async function getOrder(token: string, id: number | string): Promise<Order> {
  const data = await apiRequest<unknown>(`/orders/${id}/`, { token });
  return mapOrder(data);
}

export async function updateOrderStatus(
  token: string,
  id: number | string,
  payload: UpdateOrderStatusPayload
): Promise<Order> {
  const data = await apiRequest<unknown>(`/orders/${id}/`, {
    method: "PATCH",
    token,
    body: payload,
  });
  return mapOrder(data);
}
