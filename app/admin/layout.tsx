"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import RequireAdmin from "@/components/auth/RequireAdmin";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/products", label: "Products", icon: "🛍️" },
  { href: "/admin/categories", label: "Categories", icon: "🗂️" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
  }, [pathname]);

  return (
    <main className="container-shop py-4">
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="card h-max p-2 lg:sticky lg:top-20">
          <div className="px-3 py-2">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Admin Panel
            </p>
          </div>
          <nav className="space-y-1">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${
                    active
                      ? "bg-brand-600 text-white"
                      : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-2 border-t px-3 py-2">
            <Link href="/" className="text-xs font-bold text-slate-400 hover:text-brand-700">
              ← Back to store
            </Link>
          </div>
        </aside>
        <div ref={contentRef} className="min-w-0">
          {children}
        </div>
      </div>
    </main>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <AdminShell>{children}</AdminShell>
    </RequireAdmin>
  );
}
