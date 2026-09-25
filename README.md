# MRKExpressBD Ecommerce Website

A clean, readable ecommerce marketplace built with:

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS
- A Django REST Framework API (`backend/`, see `backend/README.md`)
- JWT auth, server-side cart/wishlist/orders, guest cart with localStorage fallback

## Requirements

- Node.js 20.9.0+
- The Django API running (see `backend/README.md`) for any real data — without it,
  pages render with empty/error states instead of crashing.

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local if your API isn't at http://localhost:8000/api/v1
npm run dev
```

Open `http://localhost:3000`. Start the backend first (`cd backend && ... && python manage.py runserver`) so pages have data to show.

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # run the production build
npm run type-check   # tsc --noEmit
npm run format       # prettier --write .
```

## Architecture

```text
lib/api/
  client.ts       fetch wrapper: builds query strings, attaches Bearer tokens,
                   throws ApiError with a readable message on non-2xx/network failure
  token.ts        localStorage helpers for the JWT access/refresh tokens
  mappers.ts       snake_case (DRF) -> camelCase (frontend types) converters
  auth.ts, categories.ts, products.ts, cart.ts, wishlist.ts, orders.ts
                   one typed function per API resource, all funneled through client.ts

store/
  AuthContext.tsx  JWT session: hydrates from localStorage on load (refreshing the
                   access token once if it's expired), exposes login/register/logout/
                   updateProfile
  ShopContext.tsx  cart + wishlist, in two modes (see "Guest vs. logged-in" below)

types/             product.ts, category.ts, user.ts, cart.ts, order.ts — mirror the
                   DRF serializers field-for-field (camelCased)
```

Public catalog data (home page sections, category grid/sidebar, product list/detail)
is fetched in **Server Components** (`components/home/*`, `app/products/[slug]/page.tsx`)
using Next's `fetch` cache (`next: { revalidate }`), so the first paint has real data
and no client-side loading flash. The product **list** page is a client component
(`ProductFiltersClient`) because search/category/price/sort/pagination need to refetch
interactively; it debounces the search box, keeps filters in the URL (shareable /
back-button friendly), and shows skeleton/error/empty states.

Cart, wishlist, auth, checkout, and orders are necessarily client-side (they depend on
the JWT in localStorage and mutate state).

## Guest vs. logged-in cart/wishlist

- **Logged out:** cart/wishlist are arrays of full `Product` objects kept in
  `localStorage` (`mrk_guest_cart` / `mrk_guest_wishlist`), same as the original
  mock-data version.
- **Logged in:** cart/wishlist are fetched from and mutated through the Django API
  (`/cart/`, `/wishlist/`).
- **On login/register success:** `ShopContext` reads whatever was in the guest
  localStorage, replays each line as an API call (`POST /cart/`, `POST /wishlist/`),
  clears localStorage, then reloads the now-merged server cart/wishlist. A guest item
  that fails to merge (e.g. the product went out of stock) is skipped rather than
  aborting the whole merge.
- **On logout:** state resets to whatever's currently in (now-empty) localStorage.

Both modes expose the same shape to components (`CartLine`/`WishlistLine` in
`types/cart.ts`), so `ProductCard`, `CartClient`, etc. don't need to know which mode
is active.

## Auth & protected routes

`store/AuthContext.tsx` stores the JWT pair in localStorage and exposes `user`,
`token`, `loading`, `login`, `register`, `logout`, `updateProfile`. On mount it calls
`/auth/me/`; if the access token is expired it refreshes once via `/auth/refresh/`
before giving up and clearing the session.

`components/auth/RequireAuth.tsx` wraps `/checkout`, `/profile`, `/orders`, and
`/orders/[id]` — it shows a loading state while the session hydrates, then redirects
to `/login` if there's no user.

## Checkout & orders

Checkout (`/checkout`) posts the shipping form + the logged-in user's server cart to
`POST /orders/`, which validates stock and reduces it in a DB transaction, then clears
the cart server-side. On success the browser is redirected to
`/orders/{id}?success=1`, which shows a confirmation banner; `/orders/{id}` doubles as
the plain order-detail view. `/orders` lists the current user's order history.

Payment is Cash on Delivery only (per the backend), so the checkout form has no other
payment method to pick.

## Design decisions / simplifications

- **Delivery fee (৳80)** shown on the cart/checkout summary is a frontend-only
  display value — the backend order `total` is `subtotal` only (no shipping line
  item exists in the Phase 1 API). Noted here rather than silently mismatching what
  gets charged.
- **Product list pagination/sorting/filtering is client-fetched**, not
  server-rendered per query, since it needs to react instantly to typing/filter
  changes without full navigations. The category/home pages that don't need that
  interactivity stay server-rendered.
- **Home page "sections"** (Most Sold, Men's T-Shirt, ...) are a small hardcoded
  `{title, category}` list in `app/page.tsx`, same as the original mock data — the
  API doesn't model "featured sections," just categories and an `is_featured` flag
  (used by the `/products/featured/` endpoint, not currently surfaced on a page since
  the original design didn't have one either).
- **`data/products.ts` / `data/categories.ts` were deleted** — everything now comes
  from the API. `backend/catalog/management/commands/seed_data.py` seeds the same
  content so local dev looks identical to before.
- **Product IDs are numbers**, not the old `"p1"` string slugs, since they're now
  real DB primary keys.
- Images continue to be plain `/images/...` paths served from `public/`
  (`next.config.js` already sets `images.unoptimized: true`), since the seed data
  uses the same paths the frontend already had.

## Environment variables

See `.env.example`:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Git

`.gitignore` covers `node_modules/`, `.next/`, `.env*`, and the Django backend's
`venv/`, `*.sqlite3`, `staticfiles/`, `media/`.
