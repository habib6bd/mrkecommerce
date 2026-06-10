"use client";
import { useMemo, useState } from "react";
import ProductGrid from "@/components/product/ProductGrid";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { getProductPrice } from "@/lib/utils";
export default function ProductFiltersClient() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [maxPrice, setMaxPrice] = useState(5000);
  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const t = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(t) || p.category.includes(t));
    }
    list = list.filter((p) => getProductPrice(p) <= maxPrice);
    if (sort === "latest") list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === "price-low") list.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    if (sort === "price-high") list.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    if (sort === "popular") list.sort((a, b) => b.soldCount - a.soldCount);
    return list;
  }, [search, category, sort, maxPrice]);
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
        <label className="mt-4 block text-sm font-bold">Max Price: ৳ {maxPrice}</label>
        <input
          type="range"
          min="100"
          max="5000"
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
          <p className="text-sm text-slate-500">{filtered.length} items found</p>
        </div>
        {filtered.length ? (
          <ProductGrid products={filtered} />
        ) : (
          <div className="rounded-xl bg-slate-50 p-10 text-center font-bold text-slate-500">
            No products found.
          </div>
        )}
      </section>
    </div>
  );
}
