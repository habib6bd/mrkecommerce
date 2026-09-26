# API Workflow Guide

This document explains, end to end, how the Next.js frontend and the Django
REST API backend work together in this project — every endpoint, what calls
it, and the exact request/response flow for each feature. It's meant for any
developer (including future-you) to read once and understand the whole
system, and to spot anything that needs correcting.

For setup/run instructions see the root [README.md](README.md) and
[backend/README.md](backend/README.md). This file is about *behavior*, not
installation.

## Contents

- [Architecture at a glance](#architecture-at-a-glance)
- [Request/response conventions](#requestresponse-conventions)
- [Authentication](#authentication)
- [Password reset](#password-reset)
- [Address book](#address-book)
- [Catalog: categories & products](#catalog-categories--products)
- [Cart & wishlist (guest + logged-in)](#cart--wishlist-guest--logged-in)
- [Checkout & orders](#checkout--orders)
- [Admin panel](#admin-panel)
- [Error handling conventions](#error-handling-conventions)
- [Full endpoint reference](#full-endpoint-reference)

---

## Architecture at a glance

```
┌─────────────────────────┐        HTTPS / JSON        ┌──────────────────────────┐
│   Next.js frontend       │ ─────────────────────────▶ │   Django REST backend    │
│   (app/, lib/api/,       │ ◀───────────────────────── │   (accounts/, catalog/,  │
│    store/)                │                            │    orders/)              │
└─────────────────────────┘                             └──────────────────────────┘
```

- **Backend**: Django 5 + Django REST Framework, JWT auth
  (`djangorestframework-simplejwt`), SQLite (dev) / PostgreSQL (prod).
  All endpoints are namespaced under `/api/v1/`.
- **Frontend**: Next.js App Router. All server communication goes through a
  single typed layer in `lib/api/` — components never call `fetch` directly.
- **State**: two React contexts wrap the whole app
  (`app/layout.tsx` → `AuthProvider` → `ShopProvider`):
  - `store/AuthContext.tsx` — current user, JWT tokens, login/register/logout.
  - `store/ShopContext.tsx` — cart & wishlist (works for guests via
    `localStorage`, and for logged-in users via the API).

### Frontend API layer (`lib/api/`)

| File | Responsibility |
|---|---|
| `client.ts` | The one `apiRequest()` function every other file calls. Builds the URL, attaches the `Authorization: Bearer <token>` header, parses JSON, throws `ApiError` on non-2xx. |
| `token.ts` | Reads/writes the JWT pair to `localStorage`. |
| `mappers.ts` | Converts backend snake_case JSON into frontend camelCase types (`mapUser`, `mapProduct`, `mapOrder`, …) and back for write payloads. |
| `auth.ts` | Register, login, refresh, logout, profile, password reset, addresses. |
| `categories.ts`, `products.ts` | Catalog reads (+ admin writes in `admin.ts`). |
| `cart.ts`, `wishlist.ts` | Cart/wishlist reads & writes for logged-in users. |
| `orders.ts` | Create order (checkout), list/get orders, admin status update. |
| `admin.ts` | Product/category/image CRUD, dashboard summary — all admin-only. |

Every function in these files: builds a request via `apiRequest`, and maps
the raw JSON through a `mapX` function from `mappers.ts` before returning it
to components. Components only ever see the camelCase, frontend-shaped
types in `types/`.

---

## Request/response conventions

- Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api/v1`).
- Content type: `application/json` both ways.
- Auth: `Authorization: Bearer <access_token>` header on any endpoint that
  needs a user (added automatically by `apiRequest` when a `token` is
  passed in).
- Pagination: list endpoints that support it return
  `{ count, next, previous, results: [...] }` (DRF's `PageNumberPagination`,
  12 per page). Endpoints scoped to "my own stuff" (cart, wishlist,
  addresses, admin dashboard) return a plain array/object instead — no
  pagination, since the row count is always small.
- Field naming: **backend is snake_case, frontend is camelCase.** The
  `mappers.ts` functions are the only place this translation happens —
  never invent a second translation elsewhere.

---

## Authentication

### Registration → login → session hydration

```
Browser                          Frontend (AuthContext)              Backend
  │  fills /register form                │                              │
  │──────────────────────────────────────▶ register()                   │
  │                                       │──POST /auth/register/──────▶│ create user
  │                                       │◀──────── 201 user ──────────│
  │                                       │──POST /auth/login/─────────▶│ verify password
  │                                       │◀── 200 {access, refresh} ───│ issue JWT pair
  │                                       │ store tokens in localStorage │
  │                                       │──GET /auth/me/ (Bearer)────▶│
  │                                       │◀──────── 200 user ──────────│
  │  redirected to "next" page            │ setUser() / setToken()       │
```

- `RegisterView` (`accounts/views.py`) just creates the `User` row —
  it does **not** log the user in. `AuthContext.register()` calls
  `registerUser()` then immediately calls its own `login()` so the UX is
  "register → straight into the app".
- `LoginView` is a subclass of simplejwt's `TokenObtainPairView` using
  `email` instead of `username` (`EmailTokenObtainPairSerializer`). The
  access token's payload is customized to embed `email` and `name` claims.
- On every full page load, `AuthProvider`'s `useEffect` calls `GET /auth/me/`
  with whatever access token is in `localStorage`. If that 401s (expired
  access token) it tries `POST /auth/refresh/` once with the stored refresh
  token; if that also fails, tokens are cleared and the user is logged out.
  This is the **only** place token refresh happens — there's no automatic
  retry-on-401 interceptor in `apiRequest`, so a request made mid-session
  with an expired token will fail once and the component has to handle it
  (in practice, access tokens live 60 minutes, so this is rarely hit).

### Logout

```
"Logout" button (Header.tsx)
  │
  ▼
AuthContext.logout()
  │──POST /auth/logout/ { refresh } (Bearer <access>) ──▶ backend blacklists the refresh token
  │  (best-effort: local tokens are cleared even if this call fails, e.g. offline)
  ▼
clearTokens() + setUser(null) + setToken(null)
  │
  ▼
dispatch "mrk:auth-logout" window event (ShopContext resets to guest state)
```

`LogoutView` (`accounts/views.py`) calls
`RefreshToken(refresh).blacklist()`, which inserts a row into
`token_blacklist`'s outstanding/blacklisted tables
(`rest_framework_simplejwt.token_blacklist` app). Any future
`POST /auth/refresh/` with that same refresh token now returns 401 — so a
stolen/leaked refresh token can't be replayed after logout.

### Rate limiting

`register/`, `login/`, `password-reset/`, and `password-reset/confirm/` all
set `throttle_classes = [ScopedRateThrottle]` / `throttle_scope = "auth"`.
The rate is `AUTH_THROTTLE_RATE` (default `10/min`), keyed by client IP for
anonymous requests. Every other endpoint is unaffected. This exists purely
to slow down credential-stuffing / spam-registration attempts; a normal
user will never notice it.

---

## Password reset

This is a classic "forgot password" flow using Django's built-in,
stateless token generator — no extra database table needed.

```
/forgot-password page                                    Backend
  │  user enters email                                       │
  │──POST /auth/password-reset/ { email } ───────────────────▶│
  │                                                            │ user exists?
  │                                                            │   yes → build uid/token,
  │                                                            │         email a link:
  │                                                            │   FRONTEND_URL/reset-password
  │                                                            │     ?uid=...&token=...
  │                                                            │   no  → do nothing
  │◀── 200 "If an account exists..." (always this message) ───│
  │                                                            │
  user clicks emailed link → /reset-password?uid=&token=
  │  enters new password twice                                │
  │──POST /auth/password-reset/confirm/ ─────────────────────▶│
  │   { uid, token, new_password }                             │ decode uid → user
  │                                                            │ default_token_generator
  │                                                            │   .check_token(user, token)
  │                                                            │ valid → set_password(), save
  │◀── 200 "Password has been reset." or 400 invalid/expired ──│
  │  redirected to /login after 2s                             │
```

Key points:
- **Anti-enumeration by design**: `PasswordResetRequestView` always returns
  the same `200 {"detail": "..."}` response whether or not the email is
  registered — the only visible difference is whether an email actually
  gets sent, which an attacker can't observe. Don't "fix" this to return a
  404 for unknown emails; that would reintroduce the leak.
- `uid` is the user's PK, urlsafe-base64-encoded
  (`urlsafe_base64_encode(force_bytes(user.pk))`).
- `token` is generated by Django's `default_token_generator`
  (`django.contrib.auth.tokens`), which is a signed hash of the user's PK,
  password hash, and last-login timestamp. **It naturally invalidates
  itself the moment the password changes** — that's why
  `test_confirm_reset_token_cannot_be_reused` passes: the first confirm
  changes the password, so the same token fails `check_token` on a second
  attempt.
- Emails are sent via `django.core.mail.send_mail` with
  `fail_silently=True` — a broken SMTP config won't crash the request, it
  just silently fails to deliver (check `EMAIL_HOST`/`EMAIL_BACKEND` if
  users report never receiving the email).
- **Dev vs prod email delivery**: if `EMAIL_HOST` is unset, Django's
  console backend prints the email (including the reset link) to the
  backend's stdout — that's how you test this flow locally without a real
  mail server. Set `EMAIL_HOST`/`EMAIL_HOST_USER`/`EMAIL_HOST_PASSWORD` in
  production to send real email via SMTP.
- **`FRONTEND_URL`** (backend env var) must point at wherever the frontend
  is actually deployed, or the emailed link will point at
  `localhost:3000` in production. See the note at the bottom of
  [backend/README.md](backend/README.md).

---

## Address book

Straightforward per-user CRUD, no surprises:

- `AddressViewSet.get_queryset()` filters to `Address.objects.filter(user=request.user)`
  — a user can never see or modify another user's address. Attempting to
  `PATCH`/`DELETE` someone else's address ID returns **404**, not 403 (DRF's
  default behavior for "outside your queryset" — it looks like it doesn't
  exist, rather than confirming it exists but isn't yours).
- `perform_create` auto-attaches `user=request.user` — the frontend never
  sends a user ID.
- Frontend: the address book lives on `/profile` (`app/profile/page.tsx`,
  `AddressBook` component). It loads the list on mount via `listAddresses()`,
  and does full round-trips (no optimistic updates) on create/update/delete
  — the response from the server always overwrites local state, so the UI
  never drifts from what's actually saved.

---

## Catalog: categories & products

Read paths are public; writes are admin-only via `IsAdminOrReadOnly`
(`catalog/permissions.py` — allows any `GET/HEAD/OPTIONS`, requires
`request.user.is_staff` for anything else).

```
Home page / product list page
  │──GET /categories/ ─────────▶ top-level categories, each with nested
  │                              `subcategories` (one query via
  │                              prefetch, see CategoryViewSet)
  │
  │──GET /products/?search=&category=&min_price=&max_price=
  │     &is_featured=&ordering=&page= ─────────▶ paginated product list
  │
  │──GET /products/<slug>/ ────▶ single product, full detail serializer
  │                              (includes ordered images, full description)
```

- **Active/staff visibility rule** (important, easy to break by accident):
  `ProductViewSet.get_queryset()` filters to `is_active=True` for everyone
  *except* an authenticated staff user, who sees all products including
  deactivated ones. This is what lets the admin product list show
  deactivated products while the public storefront hides them — if you
  change this queryset, check both `app/products/page.tsx` and
  `app/admin/products/page.tsx` still behave correctly.
- Product images: list responses return `images` as a flat array of URL
  strings; the detail response returns the full nested
  `{ id, image, alt_text, order }` objects (ordering matters for the
  product gallery). `mappers.ts`'s `extractImageUrls()` normalizes both
  shapes into `string[]` so `Product.images` in the frontend is always
  just URLs — the admin UI uses the separate `/product-images/` endpoint
  when it needs the full objects (see Admin panel below).

---

## Cart & wishlist (guest + logged-in)

This is the most stateful part of the frontend. `ShopContext` runs in one
of two modes, switching automatically based on whether `AuthContext` has a
token:

**Guest mode** (no token): cart/wishlist live entirely in
`localStorage` (`mrk_guest_cart` / `mrk_guest_wishlist`). No API calls at
all — `addToCart`/`toggleWishlist`/etc. just mutate React state directly.

**Logged-in mode** (token present): every mutation is a real API call
(`POST /cart/`, `PATCH /cart/items/<id>/`, `DELETE /cart/items/<id>/`,
`POST /wishlist/`, `DELETE /wishlist/<id>/`), and the response's full
`CartSerializer`/`WishlistSerializer` payload replaces local state — so the
frontend cart is always a mirror of the server's, never something computed
client-side.

**The transition (guest → logged-in) is the part worth understanding
carefully** — it only runs once per fresh login, guarded by
`mergedForToken.current`:

```
User was browsing as a guest with 2 items in localStorage cart, then logs in
  │
  ▼
ShopContext's useEffect sees `token` change → mergeAndLoad(token):
  │
  │  for each guest cart line:
  │──POST /cart/ { product: id, quantity } (Bearer) ──▶ backend upserts
  │     (CartView.post: get_or_create CartItem, or add to existing quantity
  │      if that product's already in the user's server cart)
  │     — if this 400s (e.g. product now out of stock), that one line is
  │       silently skipped; the rest still merge
  │
  │  same for each guest wishlist line → POST /wishlist/
  │     (silently skipped if already wishlisted, via the model's unique
  │      constraint returning a 400)
  │
  │  localStorage.removeItem(guest cart/wishlist keys)
  │
  │  loadServerState(token) → GET /cart/ + GET /wishlist/ in parallel
  │     → this is now the source of truth
```

If you're debugging "my cart looks wrong right after logging in", this
merge is almost always where to look — check the Network tab for which
`POST /cart/` calls 400'd during merge.

**Line IDs**: `CartLine`/`WishlistLine.id` is a `string` in both modes, but
it means different things — in guest mode it's `String(product.id)`
(since there's no server-side line row yet); in logged-in mode it's
`String(cartItem.id)` / `String(wishlistItem.id)` (the actual DB row ID).
Components (`CartClient`, etc.) treat it as an opaque string either way and
never need to know which.

---

## Checkout & orders

```
/checkout page                                          Backend
  │  fills shipping form, submits
  │──POST /orders/ (Bearer) ───────────────────────────▶│
  │   { full_name, phone, address_line1, address_line2,   │ loads user's server Cart
  │     city, state, postal_code, country }                │ for each item: check
  │                                                         │   stock >= quantity
  │                                                         │   (400 "Insufficient
  │                                                         │    stock for X" if not —
  │                                                         │    whole request rejected,
  │                                                         │    nothing partially applied)
  │                                                         │ in one DB transaction:
  │                                                         │   create Order + OrderItems
  │                                                         │   (unit_price snapshot =
  │                                                         │    discount_price or price
  │                                                         │    AT THE TIME OF ORDER)
  │                                                         │   decrement product.stock
  │                                                         │   increment product.sold_count
  │                                                         │   clear the cart
  │◀── 201 order ──────────────────────────────────────────│
  │  redirect to /orders/{id}?success=1
```

- **Note**: `POST /orders/` requires an existing server-side cart — this
  only works for logged-in users (checkout is behind `RequireAuth`).
  There's no guest checkout; a guest is prompted to log in first.
- The stock check + decrement happen inside `transaction.atomic()`, so a
  race between two simultaneous checkouts on the last unit of a product
  can't oversell — whichever transaction commits first wins;  the loser's
  `product.stock < item.quantity` check (re-read within the transaction)
  fails and the whole order 400s.
- `OrderItem.unit_price`/`product_name` are copied at order time, not
  looked up live — so if you later change a product's price or rename it,
  past orders still show what the customer actually paid/ordered.
- `/orders` (list) and `/orders/{id}` (detail) both use
  `OrderViewSet.get_queryset()`: a normal user sees only their own orders;
  a staff user sees every order (this is what powers `/admin/orders`).
- Order status updates (`PATCH /orders/{id}/`) are admin-only
  (`get_permissions()` returns `IsAdminUser` for update actions
  specifically — read access stays at the ordinary `IsAuthenticated`
  level).

---

## Admin panel

Everything under `/admin/*` in the frontend is gated by
`components/auth/RequireAdmin.tsx`, which redirects away if
`user.isStaff` is false (this is a **UI convenience only** — the real
enforcement is server-side `IsAdminUser`/`IsAdminOrReadOnly` on every
write endpoint; never rely on the frontend guard alone for security).

| Admin page | Talks to |
|---|---|
| `/admin` (dashboard) | `GET /admin/summary/` — product/category/order counts, low-stock count, revenue total |
| `/admin/products` | `GET/POST/PATCH/DELETE /products/` (admin sees inactive products too) |
| `/admin/products/[slug]/edit` | same, plus `/product-images/` for the image manager |
| `/admin/categories` | `GET/POST/PATCH/DELETE /categories/` |
| `/admin/orders` | `GET /orders/` (all orders, since staff bypasses the user filter) + `PATCH /orders/{id}/` for status changes |

`lib/api/admin.ts` holds all the admin-only write calls; `mappers.ts`'s
`toProductPayload`/`toCategoryPayload` build the snake_case bodies from
partial frontend input (only fields that are actually set get included, so
a `PATCH` never accidentally overwrites a field with `undefined`).

---

## Error handling conventions

- Every non-2xx response is thrown from `apiRequest()` as an `ApiError`
  (`lib/api/client.ts`), which carries `.status` and `.data` (the raw JSON
  body) alongside a human-readable `.message`.
- `extractErrorMessage()` tries, in order: a top-level `detail` string
  (DRF's standard format for permission/auth/throttle errors), then the
  first field's first validation error message (DRF's standard format for
  serializer `.is_valid()` failures, e.g.
  `{"email": ["This field is required."]}`), then falls back to a generic
  "Request failed with status N".
- Components catch `ApiError` specifically and show `err.message`;
  anything else (network failure, JSON parse failure) falls back to a
  generic message. See any page's `handleSubmit` for the pattern, e.g.
  `app/login/page.tsx`.
- A `429` (throttled) on login/register/password-reset will surface via
  this same path — DRF's default throttle response body is
  `{"detail": "Request was throttled. Expected available in N seconds."}`,
  which `extractErrorMessage` picks up automatically.

---

## Full endpoint reference

All paths are relative to `/api/v1/`.

### Auth (`accounts/`)
| Method & path | Auth | Throttled | Notes |
|---|---|---|---|
| `POST auth/register/` | none | ✅ | create account |
| `POST auth/login/` | none | ✅ | `{email, password}` → `{access, refresh}` |
| `POST auth/refresh/` | none | — | `{refresh}` → `{access}` (rotates + blacklists old refresh) |
| `POST auth/logout/` | required | — | `{refresh}` → blacklists it, `205` |
| `GET/PATCH auth/me/` | required | — | profile; `PATCH` only accepts `name`/`phone` |
| `POST auth/password-reset/` | none | ✅ | `{email}` → always generic `200` |
| `POST auth/password-reset/confirm/` | none | ✅ | `{uid, token, new_password}` |
| `GET/POST auth/addresses/` | required | — | list / create, scoped to caller |
| `GET/PATCH/DELETE auth/addresses/{id}/` | required | — | scoped to caller (404 if not yours) |

### Catalog (`catalog/`)
| Method & path | Auth | Notes |
|---|---|---|
| `GET categories/` | none | top-level + nested subcategories |
| `GET/POST/PATCH/DELETE categories/{slug}/` | admin for writes | |
| `GET products/` | none | paginated, filterable, searchable, orderable |
| `GET products/featured/` | none | |
| `GET/POST/PATCH/DELETE products/{slug}/` | admin for writes | active/staff visibility rule applies |
| `GET/POST/PATCH/DELETE product-images/` | admin only | `?product=<slug>` filter |

### Cart, wishlist, orders (`orders/`)
| Method & path | Auth | Notes |
|---|---|---|
| `GET/POST cart/` | required | `POST` upserts (adds to existing line's quantity) |
| `PATCH/DELETE cart/items/{id}/` | required | scoped to caller's cart |
| `GET/POST wishlist/` | required | |
| `DELETE wishlist/{id}/` | required | |
| `GET orders/` | required | own orders, or all orders if staff |
| `GET orders/{id}/` | required | own, or any if staff |
| `POST orders/` | required | checkout — creates order from current cart |
| `PATCH orders/{id}/` | admin only | status update |
| `GET admin/summary/` | admin only | dashboard stats |

---

*Found something in this doc that doesn't match the code, or a corner case
it misses? Update this file alongside the code change — it should always
describe what the code actually does, not what it was originally designed
to do.*
