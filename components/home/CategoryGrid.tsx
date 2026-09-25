import Image from "next/image";
import Link from "next/link";
import { listCategories } from "@/lib/api/categories";

export default async function CategoryGrid() {
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  try {
    categories = await listCategories({ next: { revalidate: 300 } });
  } catch {
    return null;
  }

  return (
    <section className="card">
      <div className="section-title">
        <h2 className="text-sm font-black">Categories</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4 lg:grid-cols-8">
        {categories.slice(0, 8).map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="rounded-xl border bg-brand-50 p-2 text-center transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-lg">
              <Image src={c.image} alt={c.name} fill className="object-cover" />
            </div>
            <p className="mt-2 text-xs font-bold">{c.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
