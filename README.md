# MRKExpressBD Ecommerce

A full-stack ecommerce marketplace: a Next.js storefront backed by a Django REST
API.

- **Frontend** (this directory): Next.js 16 (App Router) + React 19 + TypeScript +
  Tailwind CSS + GSAP (for the admin dashboard's animated stats). JWT auth,
  server-side cart/wishlist/orders, guest cart with a localStorage fallback, and
  a staff-only admin panel for managing products/categories/orders.
- **Backend** (`backend/`): Django 5 + Django REST Framework + PostgreSQL (SQLite
  fallback for local dev). Custom email-login `User`, product catalog, cart,
  wishlist, orders. See `backend/README.md` for its API reference and setup.
- **CI**: `.github/workflows/ci.yml` runs backend tests and frontend
  type-check/build on every pull request.
- **Deploying**: see `DEPLOYMENT.md` (Vercel + Render/Railway + PostgreSQL +
  Cloudinary/S3 for product images).
- **How the API and frontend fit together**: see `API_WORKFLOW.md` for a
  full endpoint-by-endpoint, request/response walkthrough of every feature
  (auth, cart/wishlist merge, checkout, admin, password reset, …).

## Repository layout

```text
app/, components/, lib/, store/, types/, public/   → Next.js frontend (this README)
backend/                                            → Django REST API (backend/README.md)
.github/workflows/ci.yml                            → CI: backend tests + frontend build
DEPLOYMENT.md                                        → production deployment guide
API_WORKFLOW.md                                      → full API/frontend workflow reference
```

## Quick start (both parts)

You need both running locally for the frontend to show real data.

```bash
# 1. Backend — Django API on :8000
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_data          # starter categories/products
python manage.py createsuperuser    # optional, for /admin
python manage.py runserver
```

```bash
# 2. Frontend — Next.js on :3000 (separate terminal, repo root)
npm install
cp .env.example .env.local          # NEXT_PUBLIC_API_URL defaults to http://localhost:8000/api/v1
npm run dev
```

Open `http://localhost:3000`. The API itself is at `http://localhost:8000/api/v1/`,
its Swagger docs at `http://localhost:8000/api/docs/`, and its admin at
`http://localhost:8000/admin/`. Full details (env vars, endpoints, tests) are in
`backend/README.md`.

Requirements: Node.js 20.9.0+, Python 3.11+. Without the backend running, frontend
pages render with empty/error states instead of crashing — see "Architecture" below.

## Frontend scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # run the production build
npm run type-check   # tsc --noEmit
npm run format       # prettier --write .
```

Backend equivalents (`cd backend && source venv/bin/activate && ...`):
`python manage.py runserver`, `python manage.py test`, `python manage.py seed_data`.

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
before giving up and clearing the session. `logout` now calls `POST /auth/logout/`
to blacklist the refresh token server-side before clearing local storage (best-effort;
local tokens are cleared even if the request fails, e.g. while offline).

`components/auth/RequireAuth.tsx` wraps `/checkout`, `/profile`, `/orders`, and
`/orders/[id]` — it shows a loading state while the session hydrates, then redirects
to `/login` if there's no user.

`/forgot-password` and `/reset-password` implement the password reset flow:
the former posts an email to `/auth/password-reset/`, the latter reads `uid`/`token`
from the URL query string (the link emailed to the user) and posts them plus a new
password to `/auth/password-reset/confirm/`.

`/profile` also renders an address book backed by `/auth/addresses/` (list/create/
update/delete), scoped to the logged-in user.

## Checkout & orders

Checkout (`/checkout`) posts the shipping form + the logged-in user's server cart to
`POST /orders/`, which validates stock and reduces it in a DB transaction, then clears
the cart server-side. On success the browser is redirected to
`/orders/{id}?success=1`, which shows a confirmation banner; `/orders/{id}` doubles as
the plain order-detail view. `/orders` lists the current user's order history.

Payment is Cash on Delivery only (per the backend), so the checkout form has no other
payment method to pick.

## Admin panel (`/admin`)

A store admin — any user with `is_staff=True` on the backend (`createsuperuser`
sets this; see `backend/README.md` → Admin for promoting an existing account) —
gets an "Admin Panel" link in the header dropdown, leading to:

```text
/admin                          dashboard: revenue/orders/products/stock stat
                                 cards (gsap count-up animation), quick links
/admin/products                 searchable, paginated product table; activate/
                                 deactivate, edit, delete
/admin/products/new             create a product
/admin/products/[slug]/edit     edit a product + manage its images
/admin/categories               flat table (indented tree) with an inline
                                 create/edit form; supports subcategories
/admin/orders                   all orders, filterable by status, inline status
                                 change (pending → confirmed → shipped → …)
```

`components/auth/RequireAdmin.tsx` gates the whole `/admin` tree: it redirects
anonymous visitors to `/login`, and shows a plain "Not authorized" screen for a
logged-in non-staff user (rather than a confusing 404/blank page).

Product images are managed by URL (paste a `/images/...` path or a Cloudinary/S3
link) via `components/admin/ProductImageManager.tsx` — see "Product images" in
`DEPLOYMENT.md` for hosting options; there's no file upload widget since the
`ProductImage.image` field is a plain string, not a Django `ImageField`.

New backend endpoints added to support this (documented in `backend/README.md`):
`is_staff` on `/auth/me/`, `/product-images/` (admin CRUD), staff-only
visibility of inactive products and everyone's orders, `PATCH /orders/<id>/`
for status changes, and `/admin/summary/` for the dashboard stats. Two
pre-existing gaps were fixed while wiring this up: `CategoryViewSet` couldn't
reach a subcategory directly by its own slug (only top-level categories), and
`ProductViewSet` had no way for staff to see/manage deactivated products —
both are covered by new tests.

## Bug fix: product detail images

While building the admin image manager we found that `mapProduct` (in
`lib/api/mappers.ts`) assumed `images` was always a `string[]`, but the product
**detail** endpoint actually returns nested `{id, image, alt_text, order}`
objects (only the **list** endpoint returns bare URL strings) — so product
detail pages were rendering a broken image. Fixed by normalizing both shapes to
URL strings in the mapper.

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

Frontend (`.env.example`, repo root):

```text
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Backend (`backend/.env.example`) — see `backend/README.md` for the full table
(database, JWT lifetimes, CORS) and `DEPLOYMENT.md` for production-only settings
(security headers, `CSRF_TRUSTED_ORIGINS`, etc.).

## CI

`.github/workflows/ci.yml` runs on every pull request:
- `backend-tests` — installs `backend/requirements.txt`, runs migrations, runs
  `python manage.py test`.
- `frontend-checks` — `npm ci`, `npm run type-check`, `npm run build`.

## Deployment

See `DEPLOYMENT.md`: frontend on Vercel, backend + PostgreSQL on Render or
Railway (Dockerfile included, gunicorn + whitenoise), product images on
Cloudinary/S3 (or kept in `public/images/` — no code change needed either way).

## Git

`.gitignore` covers `node_modules/`, `.next/`, `.env*`, `*.tsbuildinfo`, and the
Django backend's `venv/`, `*.sqlite3`, `staticfiles/`, `media/`.
