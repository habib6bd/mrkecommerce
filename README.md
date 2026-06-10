# MRKExpressBD Ecommerce Website

A clean, readable, and easy-to-edit ecommerce marketplace project built with:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- App Router
- Local dummy data
- Cart and wishlist with React Context + localStorage

The design is inspired by a modern green-themed marketplace layout with:

- Responsive navbar
- Search bar
- Category sidebar
- Hero slider
- Category cards
- Product sections
- Product listing with filters
- Product details
- Cart
- Wishlist
- Checkout UI
- Login/Register UI
- Footer

## Requirements

Use Node.js 20.9.0 or newer.

Check your Node version:

```bash
node -v
```

## Install

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

## Start Production Server

```bash
npm run start
```

## Format Code

```bash
npm run format
```

## Check TypeScript

```bash
npm run type-check
```

## Important Git Rule

Do not upload `node_modules`.

The `.gitignore` file already ignores:

```text
node_modules/
.next/
out/
.env
.vercel/
*.log
```

## Main Editable Files

Most of the website content can be edited from:

```text
data/products.ts
data/categories.ts
components/layout/Header.tsx
components/layout/Footer.tsx
tailwind.config.ts
```

## Future Backend Plan

When you are ready to make it dynamic, you can add:

```text
app/api/products/route.ts
app/api/orders/route.ts
app/api/auth/route.ts
lib/db.ts
```

Then connect with MongoDB, PostgreSQL, MySQL, Prisma, Supabase, Laravel API, or a custom Node.js API.

## TypeScript Target

This project uses:

```json
"target": "ES2022"
```

This avoids the TypeScript warning about deprecated `ES5` and matches modern Next.js/Node.js development.
