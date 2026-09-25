"use client";
import { useState } from "react";
import { Product } from "@/types/product";
import { useShop } from "@/store/ShopContext";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const [adding, setAdding] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddToCart() {
    setAdding(true);
    setError(null);
    try {
      await addToCart(product);
    } catch {
      setError("Failed to add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleWishlist() {
    setWishlistPending(true);
    try {
      await toggleWishlist(product);
    } finally {
      setWishlistPending(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleAddToCart}
          disabled={adding || !product.inStock}
          className="rounded-xl bg-brand-600 px-6 py-3 font-black text-white disabled:opacity-50"
        >
          {!product.inStock ? "Out of Stock" : adding ? "Adding…" : "Add to Cart"}
        </button>
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistPending}
          className="rounded-xl border border-brand-600 px-6 py-3 font-black text-brand-700 disabled:opacity-50"
        >
          {isWishlisted(product.id) ? "Remove Wishlist" : "Add Wishlist"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-bold text-red-600">{error}</p>}
    </div>
  );
}
