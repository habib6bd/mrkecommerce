import { OrderStatus } from "./order";

export type ProductImage = {
  id: number;
  image: string;
  altText: string;
  order: number;
};

export type ProductAdminPayload = {
  name: string;
  slug?: string;
  categoryId: number;
  price: number;
  discountPrice?: number | null;
  rating?: number;
  reviewCount?: number;
  stock: number;
  shortDescription?: string;
  description?: string;
  colors?: string[];
  sizes?: string[];
  soldCount?: number;
  isFeatured?: boolean;
  isActive?: boolean;
};

export type CategoryAdminPayload = {
  name: string;
  slug?: string;
  image?: string;
  parent?: number | null;
};

export type UpdateOrderStatusPayload = {
  status: OrderStatus;
};

export type AdminSummary = {
  productCount: number;
  activeProductCount: number;
  lowStockCount: number;
  categoryCount: number;
  orderCount: number;
  pendingOrderCount: number;
  revenueTotal: number;
};
