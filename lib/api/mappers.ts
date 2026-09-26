import { AdminSummary, CategoryAdminPayload, ProductAdminPayload, ProductImage } from "@/types/admin";
import { Category } from "@/types/category";
import { ServerCart, ServerCartItem, WishlistItem } from "@/types/cart";
import { CreateOrderPayload, Order, OrderItem } from "@/types/order";
import { Product } from "@/types/product";
import { Address, User } from "@/types/user";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Product list responses return `images` as URL strings; the detail response
 * returns nested {id, image, alt_text, order} objects. Normalize both to URLs. */
function extractImageUrls(images: any): string[] {
  if (!Array.isArray(images)) return [];
  return images.map((img) => (typeof img === "string" ? img : img.image));
}

export function mapProduct(raw: any): Product {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    category: raw.category,
    price: Number(raw.price),
    discountPrice: raw.discount_price !== null && raw.discount_price !== undefined ? Number(raw.discount_price) : null,
    rating: Number(raw.rating),
    reviewCount: raw.review_count,
    images: extractImageUrls(raw.images),
    inStock: raw.in_stock,
    stock: raw.stock,
    shortDescription: raw.short_description ?? "",
    description: raw.description ?? "",
    colors: raw.colors ?? [],
    sizes: raw.sizes ?? [],
    soldCount: raw.sold_count,
    isFeatured: raw.is_featured,
    isActive: Boolean(raw.is_active),
    createdAt: raw.created_at,
  };
}

export function mapProductImage(raw: any): ProductImage {
  return {
    id: raw.id,
    image: raw.image,
    altText: raw.alt_text ?? "",
    order: raw.order,
  };
}

export function mapCategory(raw: any): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    image: raw.image ?? "",
    parent: raw.parent,
    subcategories: (raw.subcategories ?? []).map(mapCategory),
  };
}

export function mapAddress(raw: any): Address {
  return {
    id: raw.id,
    fullName: raw.full_name,
    phone: raw.phone,
    line1: raw.line1,
    line2: raw.line2 ?? "",
    city: raw.city,
    state: raw.state ?? "",
    postalCode: raw.postal_code ?? "",
    country: raw.country,
    isDefault: raw.is_default,
    createdAt: raw.created_at,
  };
}

export function mapUser(raw: any): User {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name ?? "",
    phone: raw.phone ?? "",
    addresses: (raw.addresses ?? []).map(mapAddress),
    dateJoined: raw.date_joined,
    isStaff: Boolean(raw.is_staff),
  };
}

export function mapCartItem(raw: any): ServerCartItem {
  return {
    id: raw.id,
    product: mapProduct(raw.product),
    quantity: raw.quantity,
    lineTotal: Number(raw.line_total),
    addedAt: raw.added_at,
  };
}

export function mapCart(raw: any): ServerCart {
  return {
    id: raw.id,
    items: (raw.items ?? []).map(mapCartItem),
    total: Number(raw.total),
    updatedAt: raw.updated_at,
  };
}

export function mapWishlistItem(raw: any): WishlistItem {
  return {
    id: raw.id,
    product: mapProduct(raw.product),
    addedAt: raw.added_at,
  };
}

export function mapOrderItem(raw: any): OrderItem {
  return {
    id: raw.id,
    product: raw.product,
    productName: raw.product_name,
    unitPrice: Number(raw.unit_price),
    quantity: raw.quantity,
    lineTotal: Number(raw.line_total),
  };
}

export function mapOrder(raw: any): Order {
  return {
    id: raw.id,
    status: raw.status,
    paymentMethod: raw.payment_method,
    fullName: raw.full_name,
    phone: raw.phone,
    addressLine1: raw.address_line1,
    addressLine2: raw.address_line2 ?? "",
    city: raw.city,
    state: raw.state ?? "",
    postalCode: raw.postal_code ?? "",
    country: raw.country,
    subtotal: Number(raw.subtotal),
    total: Number(raw.total),
    items: (raw.items ?? []).map(mapOrderItem),
    userEmail: raw.user_email ?? "",
    userName: raw.user_name ?? "",
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export function toOrderPayload(payload: CreateOrderPayload) {
  return {
    full_name: payload.fullName,
    phone: payload.phone,
    address_line1: payload.addressLine1,
    address_line2: payload.addressLine2 ?? "",
    city: payload.city,
    state: payload.state ?? "",
    postal_code: payload.postalCode ?? "",
    country: payload.country ?? "Bangladesh",
  };
}

export function toProductPayload(payload: Partial<ProductAdminPayload>) {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.slug !== undefined) body.slug = payload.slug;
  if (payload.categoryId !== undefined) body.category = payload.categoryId;
  if (payload.price !== undefined) body.price = payload.price;
  if (payload.discountPrice !== undefined) body.discount_price = payload.discountPrice;
  if (payload.rating !== undefined) body.rating = payload.rating;
  if (payload.reviewCount !== undefined) body.review_count = payload.reviewCount;
  if (payload.stock !== undefined) body.stock = payload.stock;
  if (payload.shortDescription !== undefined) body.short_description = payload.shortDescription;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.colors !== undefined) body.colors = payload.colors;
  if (payload.sizes !== undefined) body.sizes = payload.sizes;
  if (payload.soldCount !== undefined) body.sold_count = payload.soldCount;
  if (payload.isFeatured !== undefined) body.is_featured = payload.isFeatured;
  if (payload.isActive !== undefined) body.is_active = payload.isActive;
  return body;
}

export function toCategoryPayload(payload: Partial<CategoryAdminPayload>) {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.slug !== undefined) body.slug = payload.slug;
  if (payload.image !== undefined) body.image = payload.image;
  if (payload.parent !== undefined) body.parent = payload.parent;
  return body;
}

export function mapAdminSummary(raw: any): AdminSummary {
  return {
    productCount: raw.product_count,
    activeProductCount: raw.active_product_count,
    lowStockCount: raw.low_stock_count,
    categoryCount: raw.category_count,
    orderCount: raw.order_count,
    pendingOrderCount: raw.pending_order_count,
    revenueTotal: Number(raw.revenue_total),
  };
}
