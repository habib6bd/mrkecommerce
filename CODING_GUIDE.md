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

Keep dummy data in separate files:

```text
data/products.ts
data/categories.ts
```

Later, replace these imports with API/database calls.

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

Current cart and wishlist state is in:

```text
store/ShopContext.tsx
```

Later, you can replace this with Redux Toolkit, Zustand, server actions, database-backed cart, or user account cart.

## Formatting

Run this before commit:

```bash
npm run format
npm run type-check
```
