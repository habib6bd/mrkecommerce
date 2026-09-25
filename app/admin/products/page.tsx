"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { deleteProduct, listProducts, updateProduct } from "@/lib/api/products";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";
import { Product } from "@/types/product";

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  const fetchProducts = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    listProducts({ search: search.trim() || undefined, page, ordering: "-created_at" }, { token })
      .then((data) => {
        setProducts(data.results);
        setCount(data.count);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load products."))
      .finally(() => setLoading(false));
  }, [token, search, page]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 250);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  async function handleToggleActive(product: Product) {
    if (!token) return;
    setPendingSlug(product.slug);
    try {
      const updated = await updateProduct(token, product.slug, { isActive: !product.isActive });
      setProducts((items) => items.map((p) => (p.slug === product.slug ? updated : p)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to update product.");
    } finally {
      setPendingSlug(null);
    }
  }

  async function handleDelete(product: Product) {
    if (!token) return;
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setPendingSlug(product.slug);
    try {
      await deleteProduct(token, product.slug);
      setProducts((items) => items.filter((p) => p.slug !== product.slug));
      setCount((c) => c - 1);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete product.");
    } finally {
      setPendingSlug(null);
    }
  }

  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black">Products</h1>
        <Link href="/admin/products/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white">
          + New Product
        </Link>
      </div>

      <div className="card p-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search products…"
          className="w-full max-w-sm rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading…</div>
        ) : error ? (
          <div className="p-10 text-center font-bold text-red-600">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No products found.</div>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className={pendingSlug === p.slug ? "opacity-50" : ""}>
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {p.images[0] && (
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                      )}
                    </div>
                    <span className="line-clamp-1 font-bold">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3 font-bold">{formatPrice(p.discountPrice ?? p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                          p.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                      {p.stock === 0 && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-black text-red-600">
                          Out of stock
                        </span>
                      )}
                      {p.isFeatured && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-700">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(p)}
                        disabled={pendingSlug === p.slug}
                        className="rounded-lg border px-3 py-1.5 text-xs font-bold hover:bg-brand-50 disabled:opacity-50"
                      >
                        {p.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <Link
                        href={`/admin/products/${p.slug}/edit`}
                        className="rounded-lg border px-3 py-1.5 text-xs font-bold hover:bg-brand-50"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={pendingSlug === p.slug}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
