"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import { ApiError } from "@/lib/api/client";
import { createOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/store/AuthContext";
import { useShop } from "@/store/ShopContext";

const DELIVERY_FEE = 80;

function CheckoutForm() {
  const { token } = useAuth();
  const { cart, cartLoading, subtotal, clearCart } = useShop();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder(token, {
        fullName,
        phone,
        addressLine1,
        city,
        postalCode,
      });
      clearCart();
      router.push(`/orders/${order.id}?success=1`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (cartLoading && !cart.length) {
    return (
      <main className="container-shop py-4">
        <div className="card grid h-64 place-items-center">
          <p className="font-bold text-slate-500">Loading your cart…</p>
        </div>
      </main>
    );
  }

  if (!cart.length) {
    return (
      <main className="container-shop py-4">
        <div className="card p-10 text-center">
          <h1 className="text-2xl font-black">Your cart is empty</h1>
          <Link
            href="/products"
            className="mt-5 inline-block rounded-lg bg-brand-600 px-5 py-3 font-bold text-white"
          >
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-shop py-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="card p-5">
          <h1 className="text-2xl font-black">Checkout</h1>
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>
          )}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-lg border px-3 py-2"
              placeholder="Full name"
            />
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border px-3 py-2"
              placeholder="Phone number"
            />
            <input
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="rounded-lg border px-3 py-2 md:col-span-2"
              placeholder="Full address"
            />
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-lg border px-3 py-2"
              placeholder="City"
            />
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="rounded-lg border px-3 py-2"
              placeholder="Postal code"
            />
          </div>
          <h2 className="mt-8 font-black">Payment Method</h2>
          <div className="mt-3 rounded-lg border p-3 text-sm font-bold">
            <input type="radio" checked readOnly className="mr-2" />
            Cash on Delivery
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-lg bg-brand-600 px-6 py-3 font-black text-white disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place Order"}
          </button>
        </form>
        <aside className="card h-max p-5">
          <h2 className="text-xl font-black">Order Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <b>{formatPrice(subtotal)}</b>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <b>{formatPrice(DELIVERY_FEE)}</b>
            </div>
            <div className="flex justify-between border-t pt-3 text-lg">
              <span>Total</span>
              <b>{formatPrice(subtotal + DELIVERY_FEE)}</b>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutForm />
    </RequireAuth>
  );
}
