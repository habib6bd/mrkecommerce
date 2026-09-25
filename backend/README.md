# MRK Ecommerce — Django API

A Django REST Framework backend for the MRK Ecommerce storefront (Phase 1). This
runs alongside the existing Next.js frontend without modifying it; the frontend
can be pointed at this API in a later phase.

## Stack

- Django 5 + Django REST Framework
- PostgreSQL in production, SQLite fallback for local dev (`DATABASE_URL`)
- `djangorestframework-simplejwt` for JWT auth (custom email-based `User` model)
- `django-filter` for product filtering
- `drf-spectacular` for OpenAPI/Swagger docs
- `django-cors-headers` for CORS
- `django-environ` for `.env` config

## Apps

- **accounts** — custom `User` (email login) and `Address`
- **catalog** — `Category` (with `parent` for subcategories), `Product`, `ProductImage`
- **orders** — `Cart`, `CartItem`, `Wishlist`, `Order`, `OrderItem`

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: set SECRET_KEY, and DATABASE_URL if using PostgreSQL
# (leave DATABASE_URL empty to use SQLite locally)

python manage.py migrate
python manage.py seed_data          # imports the storefront's dummy products/categories
python manage.py createsuperuser    # optional, for /admin access
python manage.py runserver
```

The API is served at `http://localhost:8000/api/v1/`.

## Environment variables (`.env`)

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True`/`False` |
| `ALLOWED_HOSTS` | comma-separated list |
| `DATABASE_URL` | e.g. `postgres://user:pass@host:5432/dbname`; empty = SQLite |
| `CORS_ALLOWED_ORIGINS` | comma-separated list, defaults to `http://localhost:3000` |
| `VERCEL_DOMAIN` | your deployed frontend domain, added to CORS automatically |
| `ACCESS_TOKEN_LIFETIME_MIN` | JWT access token lifetime in minutes |
| `REFRESH_TOKEN_LIFETIME_DAYS` | JWT refresh token lifetime in days |

## API overview

All endpoints are under `/api/v1/`.

### Auth (`/api/v1/auth/`)
- `POST register/` — create an account
- `POST login/` — obtain JWT access/refresh tokens (login with `email` + `password`)
- `POST refresh/` — refresh an access token
- `GET/PATCH me/` — view or update the current user's profile (auth required);
  the response includes a read-only `is_staff` flag the frontend uses to show
  the admin panel

### Categories (`/api/v1/categories/`)
- `GET /` — list top-level categories (with nested `subcategories`)
- `GET /<slug>/` — category detail (subcategories can also be read/written directly
  by their own slug — only the *list* endpoint is top-level-only)
- `POST /`, `PATCH /<slug>/`, `DELETE /<slug>/` — admin (`is_staff`) only

### Products (`/api/v1/products/`)
- `GET /` — paginated list; supports:
  - `search=` (name/description)
  - `category=<slug>`
  - `min_price=`, `max_price=` (checked against the discounted price when set)
  - `is_featured=true`
  - `ordering=price,-price,rating,-rating,created_at,-created_at,sold_count,-sold_count`
  - Public requests only see `is_active=true` products; an authenticated staff
    request sees everything (including deactivated products), so the admin UI
    can manage them.
- `GET /<slug>/` — product detail (same active/staff visibility rule)
- `GET /featured/` — featured products
- `POST /`, `PATCH /<slug>/`, `DELETE /<slug>/` — admin only

### Product images (`/api/v1/product-images/`, admin only)
- `POST /` — add an image to a product: `{ "product": "<product-slug>", "image": "<url>", "alt_text": "", "order": 0 }`
- `DELETE /<id>/` — remove an image
- Images are plain URL strings (see "Product images" in `../DEPLOYMENT.md`), not
  uploaded files — paste a path under `public/images/...` or a Cloudinary/S3 URL.

### Cart (`/api/v1/cart/`, auth required)
- `GET /` — current user's cart
- `POST /` — add an item (`product_id`, `quantity`)
- `PATCH /items/<id>/` — update item quantity
- `DELETE /items/<id>/` — remove item

### Wishlist (`/api/v1/wishlist/`, auth required)
- `GET /`, `POST /` (`product_id`), `DELETE /<id>/`

### Orders (`/api/v1/orders/`, auth required)
- `POST /` — create an order from the current cart (shipping details in body:
  `full_name`, `phone`, `address_line1`, `address_line2`, `city`, `state`,
  `postal_code`, `country`). Stock is validated and reduced inside a DB
  transaction; the cart is cleared afterwards. Payment method is fixed to
  Cash on Delivery for now.
- `GET /` — list orders. A regular user sees only their own; a staff user sees
  everyone's (supports `?status=pending|confirmed|shipped|delivered|cancelled`).
- `GET /<id>/` — order detail (same own-vs-all visibility rule)
- `PATCH /<id>/` — update `status`; admin only

### Admin summary (`/api/v1/admin/summary/`, admin only)
- `GET /` — dashboard counters: `product_count`, `active_product_count`,
  `low_stock_count` (active, stock ≤ 5), `category_count`, `order_count`,
  `pending_order_count`, `revenue_total` (sum of non-cancelled order totals).

## Docs

Interactive Swagger UI: `http://localhost:8000/api/docs/`
Raw OpenAPI schema: `http://localhost:8000/api/schema/`

## Admin

`http://localhost:8000/admin/` — all models are registered with list filters
and search.

To give a storefront account access to the **frontend's** `/admin` panel (product,
category and order management), mark them staff — either via the Django admin
(Users → check "Staff status") or:

```bash
python manage.py shell -c "
from django.contrib.auth import get_user_model
u = get_user_model().objects.get(email='someone@example.com')
u.is_staff = True
u.save()
"
```

`createsuperuser` sets this automatically for the account it creates.

## Tests

```bash
python manage.py test
```

Covers auth (register/login/me, `is_staff` visibility), product
listing/filtering/search/admin write access (including inactive-product
visibility), category management (including direct subcategory access),
product image CRUD, cart CRUD, wishlist CRUD, order creation (stock reduction,
transactional integrity, insufficient-stock/empty-cart handling), admin order
visibility/status updates, and the admin summary endpoint.

## Production

Static files are served by [whitenoise](http://whitenoise.evans.io/) (no separate
static host needed) and the app runs under `gunicorn`. Security headers
(HSTS, secure cookies, SSL redirect) turn on automatically whenever `DEBUG=False`;
see `.env.example` for the full list and how to override individual ones.

```bash
DEBUG=False python manage.py collectstatic --noinput
DEBUG=False gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

A `Dockerfile` is included (runs migrations + `collectstatic` on container start,
then `gunicorn`). See `../DEPLOYMENT.md` for a full deployment walkthrough
(Render/Railway + PostgreSQL), plus the Vercel frontend deploy and product-image
hosting.
