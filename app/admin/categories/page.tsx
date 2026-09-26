"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/lib/api/categories";
import { ApiError } from "@/lib/api/client";
import { flattenCategories } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";
import { Category } from "@/types/category";

type FormState = {
  id: number | null;
  name: string;
  slug: string;
  image: string;
  parent: number | "";
};

const EMPTY_FORM: FormState = { id: null, name: "", slug: "", image: "", parent: "" };

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    setError(null);
    listCategories()
      .then(setCategories)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load categories."))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  const flat = flattenCategories(categories);

  function openCreateForm() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(c: Category, parentId: number | "") {
    setForm({ id: c.id, name: c.name, slug: c.slug, image: c.image, parent: parentId });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        image: form.image.trim(),
        parent: form.parent === "" ? null : form.parent,
      };
      if (form.id) {
        const existing = flat.find((c) => c.id === form.id);
        if (existing) await updateCategory(token, existing.slug, payload);
      } else {
        await createCategory(token, payload);
      }
      setShowForm(false);
      refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(c: Category) {
    if (!token) return;
    if (!confirm(`Delete "${c.name}"? Subcategories and products in it will need reassigning first.`))
      return;
    setPendingSlug(c.slug);
    try {
      await deleteCategory(token, c.slug);
      refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete category.");
    } finally {
      setPendingSlug(null);
    }
  }

  function renderRows(items: Category[], depth = 0): React.ReactNode[] {
    return items.flatMap((c) => [
      <tr key={c.id}>
        <td className="flex items-center gap-3 px-4 py-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            {c.image && <Image src={c.image} alt={c.name} fill className="object-cover" />}
          </div>
          <span className="font-bold" style={{ paddingLeft: depth * 16 }}>
            {depth > 0 && "— "}
            {c.name}
          </span>
        </td>
        <td className="px-4 py-3 text-slate-500">{c.slug}</td>
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => openEditForm(c, depth > 0 ? findParentId(categories, c.id) : "")}
              className="rounded-lg border px-3 py-1.5 text-xs font-bold hover:bg-brand-50"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(c)}
              disabled={pendingSlug === c.slug}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>,
      ...renderRows(c.subcategories, depth + 1),
    ]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black">Categories</h1>
        <button
          onClick={openCreateForm}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white"
        >
          + New Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4 p-5">
          <h2 className="font-black">{form.id ? "Edit Category" : "New Category"}</h2>
          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{formError}</p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-2 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="auto-generated from name if left blank"
                className="mt-2 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold">Image URL</label>
              <input
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="/images/categories/example.jpg"
                className="mt-2 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold">Parent category</label>
              <select
                value={form.parent}
                onChange={(e) =>
                  setForm((f) => ({ ...f, parent: e.target.value ? Number(e.target.value) : "" }))
                }
                className="mt-2 w-full rounded-lg border px-3 py-2"
              >
                <option value="">None (top-level)</option>
                {flat
                  .filter((c) => c.id !== form.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-6 py-2.5 font-black text-white disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border px-6 py-2.5 font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading…</div>
        ) : error ? (
          <div className="p-10 text-center font-bold text-red-600">{error}</div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No categories yet.</div>
        ) : (
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">{renderRows(categories)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function findParentId(categories: Category[], childId: number): number | "" {
  for (const c of categories) {
    if (c.subcategories.some((s) => s.id === childId)) return c.id;
    const nested = findParentId(c.subcategories, childId);
    if (nested !== "") return nested;
  }
  return "";
}
