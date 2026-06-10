# Deployment Guide

## Dynamic Next.js Deployment

Use this method if you plan to add:

- API routes
- Database
- Login system
- Admin panel
- Payment gateway
- Order management

Recommended platforms:

- Vercel
- VPS
- Render
- Railway
- Cloudways
- cPanel with Node.js support

## cPanel Node.js Hosting

If your cPanel supports Node.js, you can use a standalone build.

Change `next.config.js` to:

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

Then build:

```bash
npm run build
```

Create deploy folder:

```bash
rm -rf deploy
mkdir deploy

cp -r .next/standalone/* deploy/

mkdir -p deploy/.next
cp -r .next/static deploy/.next/static

cp -r public deploy/public
```

Zip the `deploy` folder contents and upload to the cPanel Node.js app root.

## Static Hosting

Static export is only recommended if you do not need backend features.

For static export, use:

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

Then:

```bash
npm run build
```

Upload the `out/` folder contents to static hosting.
