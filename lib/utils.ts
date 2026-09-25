import { Category } from "@/types/category";
import { Product } from "@/types/product";
export const formatPrice = (p: number) => `৳ ${p.toLocaleString("en-BD")}`;
export const getDiscountPercent = (p: Product) =>
  p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
export const getProductPrice = (p: Product) => p.discountPrice ?? p.price;
export const starText = (r: number) =>
  "★".repeat(Math.round(r)) + "☆".repeat(Math.max(0, 5 - Math.round(r)));

/** Flattens the category tree (as returned by the categories API) into a single
 * list for <select> options, indenting subcategories under their parent. */
export function flattenCategories(
  categories: Category[],
  depth = 0
): { id: number; slug: string; label: string }[] {
  return categories.flatMap((c) => [
    { id: c.id, slug: c.slug, label: `${"— ".repeat(depth)}${c.name}` },
    ...flattenCategories(c.subcategories, depth + 1),
  ]);
}
