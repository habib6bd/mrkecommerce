"use client";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, getProductPrice } from "@/lib/utils";
import { useShop } from "@/store/ShopContext";
export default function CartClient() {
  const { cart, removeFromCart, updateQuantity, subtotal } = useShop();
  if (!cart.length)
    return (
      <div className="card p-10 text-center">
        <h1 className="text-2xl font-black">Your cart is empty</h1>
        <Link
          href="/products"
          className="mt-5 inline-block rounded-lg bg-brand-600 px-5 py-3 font-bold text-white"
        >
          Start Shopping
        </Link>
      </div>
    );
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="card divide-y">
        {cart.map((item) => (
          <div key={item.product.id} className="flex gap-4 p-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-black">{item.product.name}</h2>
              <p className="mt-1 font-black text-brand-700">
                {formatPrice(getProductPrice(item.product))}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="h-8 w-8 rounded border"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="h-8 w-8 rounded border"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="ml-3 text-sm font-bold text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="card h-max p-5">
        <h2 className="text-xl font-black">Order Summary</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <b>{formatPrice(subtotal)}</b>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <b>{formatPrice(80)}</b>
          </div>
          <div className="flex justify-between border-t pt-3 text-lg">
            <span>Total</span>
            <b>{formatPrice(subtotal + 80)}</b>
          </div>
        </div>
        <Link
          href="/checkout"
          className="mt-5 block rounded-lg bg-brand-600 px-5 py-3 text-center font-black text-white"
        >
          Checkout
        </Link>
      </aside>
    </div>
  );
}
