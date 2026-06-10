"use client";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { formatPrice, getDiscountPercent, getProductPrice, starText } from "@/lib/utils";
import { useShop } from "@/store/ShopContext";
export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const discount = getDiscountPercent(product);
  return (
    <div className="group relative rounded-xl border bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      {discount > 0 && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-red-500 px-2 py-1 text-[10px] font-black text-white">
          -{discount}%
        </span>
      )}
      <button
        onClick={() => toggleWishlist(product)}
        className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white text-sm shadow"
      >
        {isWishlisted(product.id) ? "♥" : "♡"}
      </button>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition group-hover:scale-105"
          />
        </div>
        <div className="pt-2">
          <h3 className="line-clamp-2 min-h-[38px] text-xs font-bold leading-5">{product.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-black text-brand-700">
              {formatPrice(getProductPrice(product))}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-amber-500">{starText(product.rating)}</span>
            <span className="text-slate-400">{product.soldCount} sold</span>
          </div>
        </div>
      </Link>
      <button
        onClick={() => addToCart(product)}
        className="mt-2 w-full rounded-lg bg-brand-600 px-3 py-2 text-xs font-black text-white"
      >
        Add to Cart
      </button>
    </div>
  );
}
