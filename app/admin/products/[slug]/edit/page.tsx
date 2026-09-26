"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ProductForm, { formValuesToPayload, ProductFormValues } from "@/components/admin/ProductForm";
import ProductImageManager from "@/components/admin/ProductImageManager";
import { listCategories } from "@/lib/api/categories";
import { ApiError } from "@/lib/api/client";
import { deleteProduct, getProductForAdmin, updateProduct } from "@/lib/api/products";
import { flattenCategories } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";
import { ProductImage } from "@/types/admin";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

function EditProductPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "1";

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getProductForAdmin(params.slug, token)
      .then(({ product, images }) => {
        setProduct(product);
        setImages(images);
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Failed to load product."))
      .finally(() => setLoading(false));
  }, [token, params.slug]);

  async function handleSubmit(values: ProductFormValues) {
    if (!token || !product) return;
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateProduct(token, product.slug, formValuesToPayload(values));
      setProduct(updated);
      setSaved(true);
      if (updated.slug !== product.slug) {
        router.replace(`/admin/products/${updated.slug}/edit`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!token || !product) return;
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(token, product.slug);
      router.push("/admin/products");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete product.");
    }
  }

  if (loading || categoriesLoading) {
    return <div className="card p-10 text-center text-slate-500">Loading…</div>;
  }

  if (loadError || !product) {
    return <div className="card p-10 text-center font-bold text-red-600">{loadError ?? "Product not found."}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black">Edit Product</h1>
        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
        >
          Delete Product
        </button>
      </div>

      {justCreated && (
        <p className="rounded-lg bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
          Product created. Add some images below.
        </p>
      )}
      {saved && (
        <p className="rounded-lg bg-green-50 px-4 py-2 text-sm font-bold text-green-700">Saved.</p>
      )}

      <ProductForm
        categories={flattenCategories(categories)}
        initial={{
          name: product.name,
          slug: product.slug,
          categoryId: flattenCategories(categories).find((c) => c.slug === product.category)?.id ?? "",
          price: String(product.price),
          discountPrice: product.discountPrice !== null ? String(product.discountPrice) : "",
          stock: String(product.stock),
          shortDescription: product.shortDescription,
          description: product.description,
          colors: product.colors.join(", "),
          sizes: product.sizes.join(", "),
          rating: String(product.rating),
          reviewCount: String(product.reviewCount),
          soldCount: String(product.soldCount),
          isFeatured: product.isFeatured,
          isActive: product.isActive,
        }}
        submitting={submitting}
        error={error}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
      />

      <ProductImageManager productSlug={product.slug} images={images} onImagesChange={setImages} />
    </div>
  );
}

export default function EditProductPageWrapper() {
  return (
    <Suspense fallback={<div className="card h-64 animate-pulse" />}>
      <EditProductPage />
    </Suspense>
  );
}
