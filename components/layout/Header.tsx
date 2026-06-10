"use client";
import Link from "next/link";
import { useState } from "react";
import { categories } from "@/data/categories";
import { useShop } from "@/store/ShopContext";
export default function Header() {
  const [open, setOpen] = useState(false);
  const { cartCount, wishlistCount } = useShop();
  return (
    <header className="sticky top-0 z-50 border-b border-brand-200 bg-brand-100/95 backdrop-blur">
      <div className="container-shop flex h-14 items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-black text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white">
            MRK
          </span>
          <span className="text-xl">MRKExpressBD</span>
        </Link>
        <form className="hidden flex-1 md:block">
          <div className="mx-auto flex max-w-2xl overflow-hidden rounded-full border border-brand-300 bg-white">
            <input placeholder="Search Product" className="w-full px-4 py-2 text-sm outline-none" />
            <button className="bg-brand-600 px-4 text-white">⌕</button>
          </div>
        </form>
        <nav className="ml-auto hidden items-center gap-2 md:flex">
          <Link href="/products" className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white">
            Shop
          </Link>
          <Link href="/wishlist" className="rounded-lg bg-white px-3 py-2 text-sm font-bold">
            ♡ {wishlistCount}
          </Link>
          <Link href="/cart" className="rounded-lg bg-white px-3 py-2 text-sm font-bold">
            🛒 {cartCount}
          </Link>
          <Link href="/login" className="rounded-lg bg-white px-3 py-2 text-sm font-bold">
            👤
          </Link>
        </nav>
        <button
          onClick={() => setOpen(!open)}
          className="ml-auto rounded-lg bg-white px-3 py-2 font-bold md:hidden"
        >
          ☰
        </button>
      </div>
      {open && (
        <div className="border-t bg-white md:hidden">
          <div className="container-shop space-y-2 py-3">
            <input placeholder="Search Product" className="w-full rounded-lg border px-3 py-2" />
            <Link href="/products" className="block rounded-lg px-3 py-2 font-bold">
              Shop
            </Link>
            <Link href="/cart" className="block rounded-lg px-3 py-2 font-bold">
              Cart ({cartCount})
            </Link>
            <Link href="/wishlist" className="block rounded-lg px-3 py-2 font-bold">
              Wishlist ({wishlistCount})
            </Link>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {categories.slice(0, 8).map((c) => (
                <Link
                  key={c.slug}
                  href={`/products?category=${c.slug}`}
                  className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
