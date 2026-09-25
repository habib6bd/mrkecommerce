"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import StatCard from "@/components/admin/StatCard";
import { ApiError } from "@/lib/api/client";
import { getAdminSummary } from "@/lib/api/admin";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";
import { AdminSummary } from "@/types/admin";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getAdminSummary(token)
      .then(setSummary)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!summary || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".stat-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.06 }
    );
  }, [summary]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white">
            + New Product
          </Link>
          <Link href="/admin/categories" className="rounded-lg border px-4 py-2 text-sm font-bold">
            + New Category
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse p-4" />
          ))}
        </div>
      ) : error ? (
        <div className="card p-10 text-center font-bold text-red-600">{error}</div>
      ) : summary ? (
        <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard label="Revenue" value={summary.revenueTotal} format={formatPrice} accent="green" />
          <StatCard label="Orders" value={summary.orderCount} accent="brand" />
          <StatCard
            label="Pending Orders"
            value={summary.pendingOrderCount}
            accent="amber"
            hint="need action"
          />
          <StatCard label="Products" value={summary.productCount} accent="brand" />
          <StatCard
            label="Active Products"
            value={summary.activeProductCount}
            accent="green"
          />
          <StatCard
            label="Low Stock"
            value={summary.lowStockCount}
            accent="red"
            hint="≤ 5 in stock"
          />
          <StatCard label="Categories" value={summary.categoryCount} accent="brand" />
        </div>
      ) : null}

      <div className="card p-5">
        <h2 className="font-black">Quick links</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Link href="/admin/products" className="rounded-xl border p-4 text-sm font-bold hover:bg-brand-50">
            Manage Products →
          </Link>
          <Link href="/admin/categories" className="rounded-xl border p-4 text-sm font-bold hover:bg-brand-50">
            Manage Categories →
          </Link>
          <Link href="/admin/orders" className="rounded-xl border p-4 text-sm font-bold hover:bg-brand-50">
            Manage Orders →
          </Link>
        </div>
      </div>
    </div>
  );
}
