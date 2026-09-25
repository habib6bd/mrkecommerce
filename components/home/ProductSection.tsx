import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import { listProducts } from "@/lib/api/products";

export default async function ProductSection({ title, category }: { title: string; category: string }) {
  let products: Awaited<ReturnType<typeof listProducts>>["results"] = [];
  try {
    const data =
      category === "all"
        ? await listProducts({ ordering: "-sold_count" }, { next: { revalidate: 60 } })
        : await listProducts({ category, ordering: "-sold_count" }, { next: { revalidate: 60 } });
    products = data.results.slice(0, category === "all" ? 12 : 6);
  } catch {
    return null;
  }

  if (!products.length) return null;

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
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
