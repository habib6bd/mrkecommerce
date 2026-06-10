"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartItem, Product } from "@/types/product";
import { getProductPrice } from "@/lib/utils";
type Ctx = {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, q: number) => void;
  toggleWishlist: (p: Product) => void;
  isWishlisted: (id: string) => boolean;
  cartCount: number;
  wishlistCount: number;
  subtotal: number;
  clearCart: () => void;
};
const ShopContext = createContext<Ctx | null>(null);
export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  useEffect(() => {
    const c = localStorage.getItem("cart");
    const w = localStorage.getItem("wishlist");
    if (c) setCart(JSON.parse(c));
    if (w) setWishlist(JSON.parse(w));
  }, []);
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);
  const addToCart = (p: Product) =>
    setCart((items) => {
      const e = items.find((i) => i.product.id === p.id);
      return e
        ? items.map((i) => (i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...items, { product: p, quantity: 1 }];
    });
  const removeFromCart = (id: string) =>
    setCart((items) => items.filter((i) => i.product.id !== id));
  const updateQuantity = (id: string, q: number) =>
    q <= 0
      ? removeFromCart(id)
      : setCart((items) => items.map((i) => (i.product.id === id ? { ...i, quantity: q } : i)));
  const toggleWishlist = (p: Product) =>
    setWishlist((items) =>
      items.some((i) => i.id === p.id) ? items.filter((i) => i.id !== p.id) : [...items, p]
    );
  const isWishlisted = (id: string) => wishlist.some((i) => i.id === id);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const wishlistCount = wishlist.length;
  const subtotal = cart.reduce((s, i) => s + getProductPrice(i.product) * i.quantity, 0);
  const clearCart = () => setCart([]);
  const value = useMemo(
    () => ({
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleWishlist,
      isWishlisted,
      cartCount,
      wishlistCount,
      subtotal,
      clearCart,
    }),
    [cart, wishlist, cartCount, wishlistCount, subtotal]
  );
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
export function useShop() {
  const c = useContext(ShopContext);
  if (!c) throw new Error("useShop must be used inside ShopProvider");
  return c;
}
