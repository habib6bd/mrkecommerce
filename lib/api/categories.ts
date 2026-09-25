import { Category } from "@/types/category";
import { apiRequest, ApiRequestOptions } from "./client";
import { mapCategory } from "./mappers";

export async function listCategories(options: Pick<ApiRequestOptions, "cache" | "next"> = {}): Promise<Category[]> {
  const data = await apiRequest<unknown[]>("/categories/", { ...options });
  return data.map(mapCategory);
}

export async function getCategory(
  slug: string,
  options: Pick<ApiRequestOptions, "cache" | "next"> = {}
): Promise<Category> {
  const data = await apiRequest<unknown>(`/categories/${slug}/`, { ...options });
  return mapCategory(data);
}
