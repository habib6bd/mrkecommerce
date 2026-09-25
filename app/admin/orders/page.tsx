"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { listOrders, updateOrderStatus } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";
import { ORDER_STATUSES, Order, OrderStatus } from "@/types/order";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const fetchOrders = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    listOrders(token, statusFilter !== "all" ? { status: statusFilter } : {})
      .then(setOrders)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load orders."))
      .finally(() => setLoading(false));
  }, [token, statusFilter]);

  useEffect(fetchOrders, [fetchOrders]);

  async function handleStatusChange(order: Order, status: OrderStatus) {
    if (!token) return;
    setPendingId(order.id);
    try {
      const updated = await updateOrderStatus(token, order.id, { status });
      setOrders((items) => items.map((o) => (o.id === order.id ? updated : o)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to update order status.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Orders</h1>

      <div className="card flex flex-wrap gap-2 p-3">
        <button
          onClick={() => setStatusFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-black ${
            statusFilter === "all" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          All
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-black capitalize ${
              statusFilter === s ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading…</div>
        ) : error ? (
          <div className="p-10 text-center font-bold text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No orders found.</div>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className={pendingId === order.id ? "opacity-50" : ""}>
                  <td className="px-4 py-3 font-bold">#{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold">{order.userName || order.fullName}</p>
                    <p className="text-xs text-slate-500">{order.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="px-4 py-3 font-bold text-brand-700">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={pendingId === order.id}
                      onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                      className={`rounded-full border-0 px-2 py-1 text-xs font-black capitalize ${STATUS_STYLES[order.status]}`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="rounded-lg border px-3 py-1.5 text-xs font-bold hover:bg-brand-50"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
