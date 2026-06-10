import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import { products } from "@/data/products";
export default function ProductSection({ title, category }: { title: string; category: string }) {
  const list =
    category === "all"
      ? [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 12)
      : products
          .filter((p) => p.category === category)
          .concat(products.filter((p) => p.category !== category))
          .slice(0, 6);
  return (
    <section className="card">
      <div className="section-title">
        <h2 className="flex items-center gap-2 text-sm font-black">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-xs text-white">
            ✓
          </span>
          {title}
        </h2>
        <Link
          href={category === "all" ? "/products" : `/products?category=${category}`}
          className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700"
        >
          View More ›
        </Link>
      </div>
      <div className="p-3">
        <ProductGrid products={list} />
      </div>
    </section>
  );
}
