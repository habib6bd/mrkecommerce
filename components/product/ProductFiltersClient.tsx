"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductGrid from "@/components/product/ProductGrid";
import { ApiError } from "@/lib/api/client";
import { listProducts } from "@/lib/api/products";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

const SORT_TO_ORDERING: Record<string, string> = {
  latest: "-created_at",
  popular: "-sold_count",
  "price-low": "price",
  "price-high": "-price",
};

const MAX_PRICE_CEILING = 5000;

export default function ProductFiltersClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "latest");
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("max_price")) || MAX_PRICE_CEILING);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [products, setProducts] = useState<Product[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const fetchProducts = useCallback(() => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    listProducts({
      search: search.trim() || undefined,
      category: category !== "all" ? category : undefined,
      max_price: maxPrice < MAX_PRICE_CEILING ? maxPrice : undefined,
      ordering: SORT_TO_ORDERING[sort],
      page,
    })
      .then((data) => {
        if (requestId !== requestIdRef.current) return;
        setProducts(data.results);
        setCount(data.count);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof ApiError ? err.message : "Failed to load products. Please try again.");
        setProducts([]);
        setCount(0);
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      });
  }, [search, category, maxPrice, sort, page]);

  // Debounce search input; run filter/sort/page changes immediately.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchProducts, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, maxPrice, sort, page]);

  // Keep the URL shareable/bookmarkable.
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category !== "all") params.set("category", category);
    if (maxPrice < MAX_PRICE_CEILING) params.set("max_price", String(maxPrice));
    if (sort !== "latest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : "/products", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, maxPrice, sort, page]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, maxPrice, sort]);

  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="card h-max p-4">
        <h2 className="font-black">Filters</h2>
        <label className="mt-4 block text-sm font-bold">Search</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Search products"
        />
        <label className="mt-4 block text-sm font-bold">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="mt-4 block text-sm font-bold">
          Max Price: ৳ {maxPrice >= MAX_PRICE_CEILING ? `${MAX_PRICE_CEILING}+` : maxPrice}
        </label>
        <input
          type="range"
          min="100"
          max={MAX_PRICE_CEILING}
          step="100"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-2 w-full"
        />
        <label className="mt-4 block text-sm font-bold">Sort</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="latest">Latest</option>
          <option value="popular">Popularity</option>
          <option value="price-low">Price Low to High</option>
          <option value="price-high">Price High to Low</option>
        </select>
      </aside>
      <section className="card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-black">Products</h1>
          {!loading && !error && <p className="text-sm text-slate-500">{count} items found</p>}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border bg-white p-2">
                <div className="aspect-square rounded-lg bg-slate-100" />
                <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-10 text-center">
            <p className="font-bold text-red-600">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 rounded-lg bg-brand-600 px-5 py-2 font-bold text-white"
            >
              Retry
            </button>
          </div>
        ) : products.length ? (
          <>
            <ProductGrid products={products} />
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
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
          </>
        ) : (
          <div className="rounded-xl bg-slate-50 p-10 text-center font-bold text-slate-500">
            No products found.
          </div>
        )}
      </section>
    </div>
  );
}
