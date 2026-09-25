import { CreateOrderPayload, Order } from "@/types/order";
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

export async function listOrders(token: string): Promise<Order[]> {
  const data = await apiRequest<unknown[]>("/orders/", { token });
  return data.map(mapOrder);
}

export async function getOrder(token: string, id: number | string): Promise<Order> {
  const data = await apiRequest<unknown>(`/orders/${id}/`, { token });
  return mapOrder(data);
}
