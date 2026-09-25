# Coding Guide

## Component Style

Use clear component names:

```text
ProductCard.tsx
ProductGrid.tsx
Header.tsx
Footer.tsx
CartClient.tsx
```

## Data Style

Product/category/cart/order data comes from the Django API via `lib/api/` (one file
per resource). See `README.md` for the architecture.

## TypeScript Style

Keep shared types in:

```text
types/
```

## Utility Functions

Keep helper functions in:

```text
lib/utils.ts
```

Examples:

```ts
formatPrice();
getDiscountPercent();
getProductPrice();
```

## State Management

Auth session state is in `store/AuthContext.tsx`. Cart and wishlist state (guest
localStorage + logged-in server-backed) is in `store/ShopContext.tsx`.

## Formatting

Run this before commit:

```bash
npm run format
npm run type-check
```
