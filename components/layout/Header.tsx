"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Category } from "@/types/category";
import { useAuth } from "@/store/AuthContext";
import { useShop } from "@/store/ShopContext";

export default function Header({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { cartCount, wishlistCount } = useShop();
  const { user, loading, logout } = useAuth();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-200 bg-brand-100/95 backdrop-blur">
      <div className="container-shop flex h-14 items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-black text-brand-700">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white">
            MRK
          </span>
          <span className="text-xl">MRKExpressBD</span>
        </Link>
        <form onSubmit={handleSearch} className="hidden flex-1 md:block">
          <div className="mx-auto flex max-w-2xl overflow-hidden rounded-full border border-brand-300 bg-white">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Product"
              className="w-full px-4 py-2 text-sm outline-none"
            />
            <button type="submit" className="bg-brand-600 px-4 text-white">
              ⌕
            </button>
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
          {!loading && user ? (
            <div className="group relative">
              <button className="rounded-lg bg-white px-3 py-2 text-sm font-bold">
                👤 {user.name || user.email.split("@")[0]}
              </button>
              <div className="invisible absolute right-0 top-full w-44 rounded-lg border bg-white p-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                <Link href="/profile" className="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-brand-50">
                  Profile
                </Link>
                <Link href="/orders" className="block rounded-md px-3 py-2 text-sm font-semibold hover:bg-brand-50">
                  My Orders
                </Link>
                {user.isStaff && (
                  <Link
                    href="/admin"
                    className="block rounded-md px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="rounded-lg bg-white px-3 py-2 text-sm font-bold">
              👤 Login
            </Link>
          )}
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
            <form onSubmit={handleSearch}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Product"
                className="w-full rounded-lg border px-3 py-2"
              />
            </form>
            <Link href="/products" className="block rounded-lg px-3 py-2 font-bold">
              Shop
            </Link>
            <Link href="/cart" className="block rounded-lg px-3 py-2 font-bold">
              Cart ({cartCount})
            </Link>
            <Link href="/wishlist" className="block rounded-lg px-3 py-2 font-bold">
              Wishlist ({wishlistCount})
            </Link>
            {!loading && user ? (
              <>
                <Link href="/profile" className="block rounded-lg px-3 py-2 font-bold">
                  Profile
                </Link>
                <Link href="/orders" className="block rounded-lg px-3 py-2 font-bold">
                  My Orders
                </Link>
                {user.isStaff && (
                  <Link href="/admin" className="block rounded-lg px-3 py-2 font-bold text-brand-700">
                    Admin Panel
                  </Link>
                )}
                <button onClick={logout} className="block w-full rounded-lg px-3 py-2 text-left font-bold text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="block rounded-lg px-3 py-2 font-bold">
                Login
              </Link>
            )}
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
