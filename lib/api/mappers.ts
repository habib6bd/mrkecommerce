import { Category } from "@/types/category";
import { ServerCart, ServerCartItem, WishlistItem } from "@/types/cart";
import { CreateOrderPayload, Order, OrderItem } from "@/types/order";
import { Product } from "@/types/product";
import { Address, User } from "@/types/user";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
    images: raw.images ?? [],
    inStock: raw.in_stock,
    stock: raw.stock,
    shortDescription: raw.short_description ?? "",
    description: raw.description ?? "",
    colors: raw.colors ?? [],
    sizes: raw.sizes ?? [],
    soldCount: raw.sold_count,
    isFeatured: raw.is_featured,
    createdAt: raw.created_at,
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
