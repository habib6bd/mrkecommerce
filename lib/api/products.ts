import { ProductAdminPayload, ProductImage } from "@/types/admin";
import { Paginated, Product } from "@/types/product";
import { apiRequest, ApiRequestOptions } from "./client";
import { mapProduct, mapProductImage, toProductPayload } from "./mappers";

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
  options: Pick<ApiRequestOptions, "cache" | "next" | "token"> = {}
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

/** Product detail, plus the raw image records (with ids) needed to manage them. */
export async function getProductForAdmin(
  slug: string,
  token: string
): Promise<{ product: Product; images: ProductImage[] }> {
  const data = await apiRequest<{ images?: unknown[] }>(`/products/${slug}/`, { token });
  return {
    product: mapProduct(data),
    images: (data.images ?? []).map(mapProductImage),
  };
}

export async function createProduct(token: string, payload: ProductAdminPayload): Promise<Product> {
  const data = await apiRequest<{ slug: string }>("/products/", {
    method: "POST",
    token,
    body: toProductPayload(payload),
  });
  return getProduct(data.slug, { cache: "no-store" });
}

export async function updateProduct(
  token: string,
  slug: string,
  payload: Partial<ProductAdminPayload>
): Promise<Product> {
  const data = await apiRequest<{ slug: string }>(`/products/${slug}/`, {
    method: "PATCH",
    token,
    body: toProductPayload(payload),
  });
  return getProduct(data.slug, { cache: "no-store" });
}

export async function deleteProduct(token: string, slug: string): Promise<void> {
  await apiRequest<void>(`/products/${slug}/`, { method: "DELETE", token });
}

export async function addProductImage(
  token: string,
  productSlug: string,
  input: { image: string; altText?: string; order?: number }
): Promise<ProductImage> {
  const data = await apiRequest<unknown>("/product-images/", {
    method: "POST",
    token,
    body: {
      product: productSlug,
      image: input.image,
      alt_text: input.altText ?? "",
      order: input.order ?? 0,
    },
  });
  return mapProductImage(data);
}

export async function deleteProductImage(token: string, imageId: number): Promise<void> {
  await apiRequest<void>(`/product-images/${imageId}/`, { method: "DELETE", token });
}
