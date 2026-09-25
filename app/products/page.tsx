import { Suspense } from "react";
import ProductFiltersClient from "@/components/product/ProductFiltersClient";
import { listCategories } from "@/lib/api/categories";

export default async function ProductsPage() {
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  try {
    categories = await listCategories({ next: { revalidate: 300 } });
  } catch {
    // handled inside the client component with a client-side retry
  }

  return (
    <main className="container-shop py-4">
      <Suspense fallback={<div className="card h-64 animate-pulse" />}>
        <ProductFiltersClient categories={categories} />
      </Suspense>
    </main>
  );
}
