import { CategoryAdminPayload } from "@/types/admin";
import { Category } from "@/types/category";
import { apiRequest, ApiRequestOptions } from "./client";
import { mapCategory, toCategoryPayload } from "./mappers";

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

export async function createCategory(token: string, payload: CategoryAdminPayload): Promise<Category> {
  const data = await apiRequest<unknown>("/categories/", {
    method: "POST",
    token,
    body: toCategoryPayload(payload),
  });
  return mapCategory(data);
}

export async function updateCategory(
  token: string,
  slug: string,
  payload: Partial<CategoryAdminPayload>
): Promise<Category> {
  const data = await apiRequest<unknown>(`/categories/${slug}/`, {
    method: "PATCH",
    token,
    body: toCategoryPayload(payload),
  });
  return mapCategory(data);
}

export async function deleteCategory(token: string, slug: string): Promise<void> {
  await apiRequest<void>(`/categories/${slug}/`, { method: "DELETE", token });
}
