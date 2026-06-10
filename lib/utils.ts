import { Product } from "@/types/product";
export const formatPrice = (p: number) => `৳ ${p.toLocaleString("en-BD")}`;
export const getDiscountPercent = (p: Product) =>
  p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
export const getProductPrice = (p: Product) => p.discountPrice ?? p.price;
export const starText = (r: number) =>
  "★".repeat(Math.round(r)) + "☆".repeat(Math.max(0, 5 - Math.round(r)));
