# Deployment Guide

This project has two deployable pieces:

- **Frontend** — Next.js, deployed to **Vercel**.
- **Backend** — Django REST API + PostgreSQL, deployed to **Render** or **Railway**.

Deploy the backend first (the frontend needs its URL); then deploy the frontend
pointed at it; then go back and add the frontend's URL to the backend's CORS config.

```
┌─────────────────┐        HTTPS/JSON        ┌──────────────────────┐
│  Vercel          │ ───────────────────────▶ │  Render/Railway       │
│  Next.js frontend│ ◀─────────────────────── │  Django + gunicorn    │
└─────────────────┘                           │  + PostgreSQL          │
                                               └──────────────────────┘
                                                          │
                                                          ▼
                                               product images referenced
                                               by URL (Cloudinary/S3, or
                                               the frontend's own /public)
```

---

## 1. Backend — Render or Railway + PostgreSQL

The backend is a standard Django app (`backend/`) with a `Dockerfile`, or it can be
deployed without Docker using its `requirements.txt` directly — both platforms
support either.

### 1a. Create the PostgreSQL database

**Render:** New → PostgreSQL. Copy the "Internal Database URL" it gives you (starts
`postgres://...`).

**Railway:** New → Database → PostgreSQL. Railway exposes it to other services in
the same project as `${{Postgres.DATABASE_URL}}`.

### 1b. Create the web service

**Render (Docker):**

1. New → Web Service → connect this repo, set **Root Directory** to `backend`.
2. Render detects the `Dockerfile` automatically. Leave build/start commands blank
   (the Dockerfile's `ENTRYPOINT`/`CMD` handle migrate → collectstatic → gunicorn).
3. Add the environment variables from the table below.

**Render (native Python, no Docker):**

1. New → Web Service → Root Directory `backend`, Runtime: Python 3.
2. Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
3. Start command: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`

**Railway:**

1. New Project → Deploy from GitHub repo → set the service's **root directory** to
   `backend`. Railway will build the `Dockerfile` automatically.
2. Or, without Docker: set the build command and start command the same as the
   Render "native Python" option above (Railway exposes `$PORT` the same way).
3. Add the environment variables below in the service's Variables tab.

### 1c. Environment variables

| Variable | Value |
|---|---|
| `SECRET_KEY` | a long random string — generate with `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | your backend's hostname, e.g. `mrk-api.onrender.com` |
| `DATABASE_URL` | the PostgreSQL URL from step 1a |
| `CORS_ALLOWED_ORIGINS` | your Vercel frontend URL, e.g. `https://mrkexpressbd.vercel.app` |
| `VERCEL_DOMAIN` | same as above, without protocol also works (see `.env.example`) — kept as a separate var so preview-deploy domains can be added without touching `CORS_ALLOWED_ORIGINS` |
| `CSRF_TRUSTED_ORIGINS` | `https://<your-backend-domain>` (needed for the Django admin) |

Leave `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`,
`SECURE_HSTS_*` unset — they default to secure values whenever `DEBUG=False` (see
`backend/.env.example`).

Both Render and Railway terminate TLS at their edge and forward
`X-Forwarded-Proto`, which `backend/config/settings.py` already trusts
(`SECURE_PROXY_SSL_HEADER`), so `SECURE_SSL_REDIRECT` works correctly.

### 1d. First deploy checklist

After the first successful deploy:

```bash
# Render: use the Shell tab on the service. Railway: `railway run <cmd>` or its shell.
python manage.py createsuperuser
python manage.py seed_data   # optional: populate the starter catalog
```

Verify:
- `https://<backend-domain>/api/docs/` loads Swagger UI
- `https://<backend-domain>/admin/` loads the login page
- `https://<backend-domain>/api/v1/products/` returns JSON

---

## 2. Frontend — Vercel

1. Import the repo in Vercel. Set the **Root Directory** to the repo root (the
   Next.js app lives at the top level, not in a subfolder).
2. Framework preset: Next.js (auto-detected). Build/output settings: defaults.
3. Environment variable:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<backend-domain>/api/v1` |

4. Deploy. Once it's live, copy the Vercel URL (and any preview-deploy domain
   pattern you want to allow) back into the backend's `CORS_ALLOWED_ORIGINS` /
   `VERCEL_DOMAIN` env vars from step 1c, and redeploy the backend so CORS allows
   requests from it.

`next.config.js` already sets `images.unoptimized: true`, so no extra Vercel image
config is needed regardless of where product images are hosted.

---

## 3. Product images: Cloudinary or S3

`catalog.Product.images` (via `ProductImage.image`) and `catalog.Category.image`
are plain URL/path strings — not Django `ImageField`s — so there's no code change
needed to point them at cloud-hosted images: upload the file, paste the resulting
URL into the admin (or `backend/catalog/management/commands/seed_data.py`).

This matters because Render/Railway's filesystem is **ephemeral** — anything
written to local disk (e.g. a hypothetical future direct-upload feature) is lost on
every redeploy/restart. Don't rely on `MEDIA_ROOT` for anything you need to persist.

**Option A — Cloudinary (simplest for a few dozen product photos):**

1. Create a free Cloudinary account, upload images via their dashboard or the
   `cloudinary` CLI.
2. Use the resulting `https://res.cloudinary.com/<cloud>/...` URLs directly in the
   admin's Product/Category image fields.

**Option B — Amazon S3 (or an S3-compatible bucket, e.g. Cloudflare R2):**

1. Create a bucket, enable public read on the object prefix you'll use (or serve
   through CloudFront), upload images.
2. Use the resulting `https://<bucket>.s3.<region>.amazonaws.com/...` URLs the
   same way.

**Option C — keep images in the frontend's `public/images/`:**

This is what local dev and the seed data already do, and it works fine in
production too as long as you don't need non-developers uploading new product
photos — Vercel serves `public/` as static assets, no extra setup required. Switch
to A or B once product images need to be manageable without a code deploy.

**If you later want real file uploads through the Django admin** (turning `image`
into an `ImageField`), add `django-storages` + `boto3` (S3) or
`django-cloudinary-storage` (Cloudinary) to `backend/requirements.txt`, set
`STORAGES["default"]` in `backend/config/settings.py` to the relevant backend, and
add the provider's credentials as env vars. Not needed for the current schema.

---

## 4. CI

`.github/workflows/ci.yml` runs on every pull request:
- **backend-tests** — installs `backend/requirements.txt`, runs migrations against
  SQLite, runs `python manage.py test`.
- **frontend-checks** — `npm ci`, `npm run type-check`, `npm run build`.

Both must pass before merging. Nothing here deploys automatically; connect Vercel's
and Render's/Railway's own GitHub integration if you want deploys on merge/push.

---

## Alternative: static/standalone Next.js hosting

If you don't need Vercel specifically (e.g. deploying the frontend to a VPS or
cPanel Node.js host), the original standalone/static export instructions still
apply — the frontend only talks to the backend over `NEXT_PUBLIC_API_URL`, so
where it's hosted doesn't matter as long as that URL is reachable and CORS allows
it.

### cPanel Node.js hosting

If your cPanel supports Node.js, use a standalone build. Change `next.config.js`:

```js
/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

Then build and package:

```bash
npm run build

rm -rf deploy
mkdir deploy
cp -r .next/standalone/* deploy/
mkdir -p deploy/.next
cp -r .next/static deploy/.next/static
cp -r public deploy/public
```

Zip the `deploy` folder contents, upload to the cPanel Node.js app root, and set
`NEXT_PUBLIC_API_URL` in that host's environment variable settings.

### Static export

Only viable if you don't need the interactive/server-rendered parts that depend on
the API at request time (most of this app does, so this option is mostly for
reference):

```js
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
```

```bash
npm run build
```

Upload the `out/` folder contents to static hosting.
