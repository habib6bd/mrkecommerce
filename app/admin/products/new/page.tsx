"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductForm, { formValuesToPayload, ProductFormValues } from "@/components/admin/ProductForm";
import { listCategories } from "@/lib/api/categories";
import { ApiError } from "@/lib/api/client";
import { createProduct } from "@/lib/api/products";
import { flattenCategories } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";
import { Category } from "@/types/category";

export default function NewProductPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  async function handleSubmit(values: ProductFormValues) {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const product = await createProduct(token, formValuesToPayload(values));
      router.push(`/admin/products/${product.slug}/edit?created=1`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create product.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">New Product</h1>
      <ProductForm
        categories={flattenCategories(categories)}
        submitting={submitting}
        error={error}
        submitLabel="Create Product"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
