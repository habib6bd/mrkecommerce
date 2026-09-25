"use client";
import { useState } from "react";
import { ProductAdminPayload } from "@/types/admin";

type CategoryOption = { id: number; slug: string; label: string };

export type ProductFormValues = {
  name: string;
  slug: string;
  categoryId: number | "";
  price: string;
  discountPrice: string;
  stock: string;
  shortDescription: string;
  description: string;
  colors: string;
  sizes: string;
  rating: string;
  reviewCount: string;
  soldCount: string;
  isFeatured: boolean;
  isActive: boolean;
};

export const emptyProductForm: ProductFormValues = {
  name: "",
  slug: "",
  categoryId: "",
  price: "",
  discountPrice: "",
  stock: "0",
  shortDescription: "",
  description: "",
  colors: "",
  sizes: "",
  rating: "0",
  reviewCount: "0",
  soldCount: "0",
  isFeatured: false,
  isActive: true,
};

function toList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function formValuesToPayload(values: ProductFormValues): ProductAdminPayload {
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || undefined,
    categoryId: Number(values.categoryId),
    price: Number(values.price),
    discountPrice: values.discountPrice.trim() ? Number(values.discountPrice) : null,
    stock: Number(values.stock) || 0,
    shortDescription: values.shortDescription.trim(),
    description: values.description.trim(),
    colors: toList(values.colors),
    sizes: toList(values.sizes),
    rating: Number(values.rating) || 0,
    reviewCount: Number(values.reviewCount) || 0,
    soldCount: Number(values.soldCount) || 0,
    isFeatured: values.isFeatured,
    isActive: values.isActive,
  };
}

export default function ProductForm({
  categories,
  initial,
  submitting,
  error,
  submitLabel,
  onSubmit,
}: {
  categories: CategoryOption[];
  initial?: Partial<ProductFormValues>;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => void;
}) {
  const [values, setValues] = useState<ProductFormValues>({ ...emptyProductForm, ...initial });

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-5">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-bold">Name *</label>
          <input
            required
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className="mt-2 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-bold">Slug</label>
          <input
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="auto-generated from name if left blank"
            className="mt-2 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-bold">Category *</label>
          <select
            required
            value={values.categoryId}
            onChange={(e) => set("categoryId", e.target.value ? Number(e.target.value) : "")}
            className="mt-2 w-full rounded-lg border px-3 py-2"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold">Price *</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={values.price}
              onChange={(e) => set("price", e.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-bold">Discount Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.discountPrice}
              onChange={(e) => set("discountPrice", e.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold">Stock *</label>
          <input
            required
            type="number"
            min="0"
            value={values.stock}
            onChange={(e) => set("stock", e.target.value)}
            className="mt-2 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-bold">Short description</label>
          <input
            value={values.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
            className="mt-2 w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className="mt-2 w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-bold">Colors (comma-separated)</label>
          <input
            value={values.colors}
            onChange={(e) => set("colors", e.target.value)}
            placeholder="Black, White, Gray"
            className="mt-2 w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-bold">Sizes (comma-separated)</label>
          <input
            value={values.sizes}
            onChange={(e) => set("sizes", e.target.value)}
            placeholder="S, M, L, XL"
            className="mt-2 w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      <details className="rounded-lg border p-3">
        <summary className="cursor-pointer text-sm font-bold text-slate-600">
          Advanced (rating & counts)
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-bold">Rating (0–5)</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={values.rating}
              onChange={(e) => set("rating", e.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-bold">Review count</label>
            <input
              type="number"
              min="0"
              value={values.reviewCount}
              onChange={(e) => set("reviewCount", e.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-bold">Sold count</label>
            <input
              type="number"
              min="0"
              value={values.soldCount}
              onChange={(e) => set("soldCount", e.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>
      </details>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={values.isFeatured}
            onChange={(e) => set("isFeatured", e.target.checked)}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
          />
          Active (visible in store)
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-brand-600 px-6 py-3 font-black text-white disabled:opacity-60"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
