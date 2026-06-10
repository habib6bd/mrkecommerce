"use client";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import { useShop } from "@/store/ShopContext";
export default function WishlistPage() {
  const { wishlist } = useShop();
  return (
    <main className="container-shop py-4">
      <section className="card p-4">
        <h1 className="mb-4 text-2xl font-black">Wishlist</h1>
        {wishlist.length ? (
          <ProductGrid products={wishlist} />
        ) : (
          <div className="rounded-xl bg-slate-50 p-10 text-center">
            <p className="font-bold text-slate-500">Your wishlist is empty.</p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-3 font-bold text-white"
            >
              Browse Products
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
