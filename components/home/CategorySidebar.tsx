import Link from "next/link";
import { listCategories } from "@/lib/api/categories";

export default async function CategorySidebar() {
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  try {
    categories = await listCategories({ next: { revalidate: 300 } });
  } catch {
    return null;
  }

  return (
    <aside className="hidden w-52 shrink-0 rounded-xl border bg-white p-2 shadow-sm lg:block">
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/products?category=${c.slug}`}
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold hover:bg-brand-50 hover:text-brand-700"
        >
          <span>{c.name}</span>
          <span>›</span>
        </Link>
      ))}
    </aside>
  );
}
