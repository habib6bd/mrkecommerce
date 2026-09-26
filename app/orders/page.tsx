"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import { ApiError } from "@/lib/api/client";
import { listOrders } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";
import { Order } from "@/types/order";

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function OrdersList() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    listOrders(token)
      .then(setOrders)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load orders."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <main className="container-shop py-4">
      <section className="card p-4">
        <h1 className="mb-4 text-2xl font-black">My Orders</h1>
        {loading ? (
          <div className="grid h-48 place-items-center">
            <p className="font-bold text-slate-500">Loading your orders…</p>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-10 text-center font-bold text-red-600">{error}</div>
        ) : orders.length ? (
          <div className="divide-y">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-black">Order #{order.id}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black capitalize ${STATUS_STYLES[order.status]}`}
                  >
                    {order.status}
                  </span>
                  <span className="font-black text-brand-700">{formatPrice(order.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 p-10 text-center">
            <p className="font-bold text-slate-500">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-3 font-bold text-white"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersList />
    </RequireAuth>
  );
}
