"use client";
import { Product } from "@/types/product";
import { useShop } from "@/store/ShopContext";
export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <button
        onClick={() => addToCart(product)}
        className="rounded-xl bg-brand-600 px-6 py-3 font-black text-white"
      >
        Add to Cart
      </button>
      <button
        onClick={() => toggleWishlist(product)}
        className="rounded-xl border border-brand-600 px-6 py-3 font-black text-brand-700"
      >
        {isWishlisted(product.id) ? "Remove Wishlist" : "Add Wishlist"}
      </button>
    </div>
  );
}
