"use client";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import { ApiError } from "@/lib/api/client";
import { getOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";
import { Order } from "@/types/order";

function OrderDetail() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "1";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getOrder(token, params.id)
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load this order."))
      .finally(() => setLoading(false));
  }, [token, params.id]);

  if (loading) {
    return (
      <main className="container-shop py-4">
        <div className="card grid h-64 place-items-center">
          <p className="font-bold text-slate-500">Loading order…</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="container-shop py-4">
        <div className="card p-10 text-center">
          <p className="font-bold text-red-600">{error ?? "Order not found."}</p>
          <Link href="/orders" className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-3 font-bold text-white">
            Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-shop py-4">
      {isSuccess && (
        <div className="card mb-4 border-2 border-green-200 bg-green-50 p-5 text-center">
          <p className="text-2xl">✅</p>
          <h1 className="mt-2 text-xl font-black text-green-700">Order placed successfully!</h1>
          <p className="mt-1 text-sm text-green-700">
            Thank you, {order.fullName}. We&apos;ll deliver via Cash on Delivery.
          </p>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Order #{order.id}</h2>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black capitalize text-brand-700">
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
          <div className="mt-5 divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-bold">{item.productName}</p>
                  <p className="text-sm text-slate-500">
                    {formatPrice(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <p className="font-black text-brand-700">{formatPrice(item.lineTotal)}</p>
              </div>
            ))}
          </div>
        </section>
        <aside className="card h-max space-y-4 p-5">
          <div>
            <h3 className="font-black">Shipping Address</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {order.fullName}
              <br />
              {order.phone}
              <br />
              {order.addressLine1}
              {order.addressLine2 ? `, ${order.addressLine2}` : ""}
              <br />
              {order.city}
              {order.postalCode ? `, ${order.postalCode}` : ""}
              <br />
              {order.country}
            </p>
          </div>
          <div>
            <h3 className="font-black">Payment</h3>
            <p className="mt-2 text-sm text-slate-600">Cash on Delivery</p>
          </div>
          <div className="border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <b>{formatPrice(order.subtotal)}</b>
            </div>
            <div className="mt-2 flex justify-between text-lg">
              <span>Total</span>
              <b>{formatPrice(order.total)}</b>
            </div>
          </div>
          <Link href="/orders" className="block text-center text-sm font-bold text-brand-700">
            ← Back to My Orders
          </Link>
        </aside>
      </div>
    </main>
  );
}

export default function OrderDetailPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="container-shop py-4"><div className="card h-64 animate-pulse" /></div>}>
        <OrderDetail />
      </Suspense>
    </RequireAuth>
  );
}
