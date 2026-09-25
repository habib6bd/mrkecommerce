import { Paginated, Product } from "@/types/product";
import { apiRequest, ApiRequestOptions } from "./client";
import { mapProduct } from "./mappers";

export type ProductListParams = {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  ordering?: string;
  page?: number;
};

export async function listProducts(
  params: ProductListParams = {},
  options: Pick<ApiRequestOptions, "cache" | "next"> = {}
): Promise<Paginated<Product>> {
  const data = await apiRequest<Paginated<unknown>>("/products/", { params, ...options });
  return { ...data, results: data.results.map(mapProduct) };
}

export async function getProduct(
  slug: string,
  options: Pick<ApiRequestOptions, "cache" | "next"> = {}
): Promise<Product> {
  const data = await apiRequest<unknown>(`/products/${slug}/`, { ...options });
  return mapProduct(data);
}

export async function getFeaturedProducts(
  params: ProductListParams = {},
  options: Pick<ApiRequestOptions, "cache" | "next"> = {}
): Promise<Paginated<Product>> {
  const data = await apiRequest<Paginated<unknown>>("/products/featured/", { params, ...options });
  return { ...data, results: data.results.map(mapProduct) };
}
