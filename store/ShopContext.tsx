"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as cartApi from "@/lib/api/cart";
import * as wishlistApi from "@/lib/api/wishlist";
import { getProductPrice } from "@/lib/utils";
import { CartLine, WishlistLine } from "@/types/cart";
import { Product } from "@/types/product";
import { useAuth } from "./AuthContext";

const CART_KEY = "mrk_guest_cart";
const WISHLIST_KEY = "mrk_guest_wishlist";

type Ctx = {
  cart: CartLine[];
  wishlist: WishlistLine[];
  cartLoading: boolean;
  wishlistLoading: boolean;
  cartError: string | null;
  addToCart: (p: Product, quantity?: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, q: number) => Promise<void>;
  toggleWishlist: (p: Product) => Promise<void>;
  isWishlisted: (id: number) => boolean;
  cartCount: number;
  wishlistCount: number;
  subtotal: number;
  clearCart: () => void;
};

const ShopContext = createContext<Ctx | null>(null);

function readGuestCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readGuestWishlist(): WishlistLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { token, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<WishlistLine[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const mergedForToken = useRef<string | null>(null);

  // Persist guest cart/wishlist to localStorage (only while logged out).
  useEffect(() => {
    if (token || authLoading) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, token, authLoading]);
  useEffect(() => {
    if (token || authLoading) return;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, token, authLoading]);

  const loadServerState = useCallback(async (authToken: string) => {
    setCartLoading(true);
    setWishlistLoading(true);
    try {
      const [serverCart, serverWishlist] = await Promise.all([
        cartApi.getCart(authToken),
        wishlistApi.listWishlist(authToken),
      ]);
      setCart(serverCart.items.map((i) => ({ id: String(i.id), product: i.product, quantity: i.quantity })));
      setWishlist(serverWishlist.map((i) => ({ id: String(i.id), product: i.product })));
      setCartError(null);
    } catch (err) {
      setCartError(err instanceof Error ? err.message : "Failed to load your cart.");
    } finally {
      setCartLoading(false);
      setWishlistLoading(false);
    }
  }, []);

  // Guest -> read localStorage. Fresh login -> merge guest cart/wishlist into the server, then load.
  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      mergedForToken.current = null;
      setCart(readGuestCart());
      setWishlist(readGuestWishlist());
      return;
    }

    if (mergedForToken.current === token) return;
    mergedForToken.current = token;

    async function mergeAndLoad(authToken: string) {
      const guestCart = readGuestCart();
      const guestWishlist = readGuestWishlist();
      setCartLoading(true);
      setWishlistLoading(true);
      try {
        for (const line of guestCart) {
          try {
            await cartApi.addCartItem(authToken, line.product.id, line.quantity);
          } catch {
            // e.g. the product went out of stock/was removed; skip it
          }
        }
        for (const line of guestWishlist) {
          try {
            await wishlistApi.addWishlistItem(authToken, line.product.id);
          } catch {
            // already wishlisted server-side, or product unavailable; ignore
          }
        }
      } finally {
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(WISHLIST_KEY);
      }
      await loadServerState(authToken);
    }

    mergeAndLoad(token).catch(() => {
      setCartLoading(false);
      setWishlistLoading(false);
      setCartError("Failed to sync your cart. Please refresh the page.");
    });
  }, [token, authLoading, loadServerState]);

  const addToCart = useCallback(
    async (product: Product, quantity = 1) => {
      if (token) {
        setCartLoading(true);
        try {
          const serverCart = await cartApi.addCartItem(token, product.id, quantity);
          setCart(serverCart.items.map((i) => ({ id: String(i.id), product: i.product, quantity: i.quantity })));
          setCartError(null);
        } catch (err) {
          setCartError(err instanceof Error ? err.message : "Failed to add item to cart.");
        } finally {
          setCartLoading(false);
        }
        return;
      }
      setCart((items) => {
        const id = String(product.id);
        const existing = items.find((i) => i.id === id);
        return existing
          ? items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + quantity } : i))
          : [...items, { id, product, quantity }];
      });
    },
    [token]
  );

  const removeFromCart = useCallback(
    async (lineId: string) => {
      if (token) {
        setCartLoading(true);
        try {
          const serverCart = await cartApi.removeCartItem(token, Number(lineId));
          setCart(serverCart.items.map((i) => ({ id: String(i.id), product: i.product, quantity: i.quantity })));
          setCartError(null);
        } catch (err) {
          setCartError(err instanceof Error ? err.message : "Failed to remove item.");
        } finally {
          setCartLoading(false);
        }
        return;
      }
      setCart((items) => items.filter((i) => i.id !== lineId));
    },
    [token]
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(lineId);
        return;
      }
      if (token) {
        setCartLoading(true);
        try {
          const serverCart = await cartApi.updateCartItem(token, Number(lineId), quantity);
          setCart(serverCart.items.map((i) => ({ id: String(i.id), product: i.product, quantity: i.quantity })));
          setCartError(null);
        } catch (err) {
          setCartError(err instanceof Error ? err.message : "Failed to update quantity.");
        } finally {
          setCartLoading(false);
        }
        return;
      }
      setCart((items) => items.map((i) => (i.id === lineId ? { ...i, quantity } : i)));
    },
    [token, removeFromCart]
  );

  const toggleWishlist = useCallback(
    async (product: Product) => {
      if (token) {
        const existing = wishlist.find((w) => w.product.id === product.id);
        setWishlistLoading(true);
        try {
          if (existing) {
            await wishlistApi.removeWishlistItem(token, Number(existing.id));
            setWishlist((items) => items.filter((i) => i.id !== existing.id));
          } else {
            const created = await wishlistApi.addWishlistItem(token, product.id);
            setWishlist((items) => [...items, { id: String(created.id), product: created.product }]);
          }
        } catch {
          // best effort; leave state unchanged on failure
        } finally {
          setWishlistLoading(false);
        }
        return;
      }
      setWishlist((items) => {
        const id = String(product.id);
        return items.some((i) => i.id === id) ? items.filter((i) => i.id !== id) : [...items, { id, product }];
      });
    },
    [token, wishlist]
  );

  const isWishlisted = useCallback((id: number) => wishlist.some((i) => i.product.id === id), [wishlist]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const wishlistCount = wishlist.length;
  const subtotal = cart.reduce((s, i) => s + getProductPrice(i.product) * i.quantity, 0);

  const clearCart = useCallback(() => {
    setCart([]);
    if (!token) localStorage.removeItem(CART_KEY);
  }, [token]);

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      cartLoading,
      wishlistLoading,
      cartError,
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
    [
      cart,
      wishlist,
      cartLoading,
      wishlistLoading,
      cartError,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleWishlist,
      isWishlisted,
      cartCount,
      wishlistCount,
      subtotal,
      clearCart,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const c = useContext(ShopContext);
  if (!c) throw new Error("useShop must be used inside ShopProvider");
  return c;
}
