export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  id: number;
  product: number | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  id: number;
  status: OrderStatus;
  paymentMethod: "cod";
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  subtotal: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderPayload = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
};
