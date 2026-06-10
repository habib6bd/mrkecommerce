# Project Structure

This project is organized for easy editing and future expansion.

```text
app/
  page.tsx                         Home page
  layout.tsx                       Main layout with header/footer provider
  globals.css                      Global Tailwind styles

  products/
    page.tsx                       Product listing page
    [slug]/page.tsx                Product details page

  cart/page.tsx                    Cart page
  checkout/page.tsx                Checkout UI page
  wishlist/page.tsx                Wishlist page
  login/page.tsx                   Login UI page
  register/page.tsx                Register UI page
  about/page.tsx                   About page
  contact/page.tsx                 Contact page
  faq/page.tsx                     FAQ page

components/
  layout/
    Header.tsx                     Main responsive header
    Footer.tsx                     Footer section

  home/
    Hero.tsx                       Homepage hero slider
    CategorySidebar.tsx            Desktop category sidebar
    CategoryGrid.tsx               Category cards
    ExpertiseCards.tsx             Service/expertise cards
    PromoCards.tsx                 Promotional/video-style cards
    ProductSection.tsx             Reusable homepage product section

  product/
    ProductCard.tsx                Single product card
    ProductGrid.tsx                Product grid
    ProductFiltersClient.tsx       Product listing filters
    AddToCartButton.tsx            Product details actions

  cart/
    CartClient.tsx                 Cart functionality

  ui/
    Button.tsx                     Reusable button component

data/
  categories.ts                    Dummy category data
  products.ts                      Dummy product data and product sections

types/
  product.ts                       Product and cart TypeScript types

lib/
  utils.ts                         Helper functions

store/
  ShopContext.tsx                  Cart and wishlist state management
```

## Easy Editing Guide

### Add or edit products

Open:

```text
data/products.ts
```

Each product has:

```ts
{
  (id,
    name,
    slug,
    category,
    price,
    discountPrice,
    rating,
    reviewCount,
    images,
    inStock,
    stock,
    shortDescription,
    description,
    colors,
    sizes,
    soldCount,
    createdAt);
}
```

### Add or edit categories

Open:

```text
data/categories.ts
```

Make sure the category `slug` matches the product `category`.

### Change theme color

Open:

```text
tailwind.config.ts
```

Edit the `brand` color values.

### Replace dummy images

Put images inside:

```text
public/images/products/
public/images/categories/
public/images/banners/
```

Then update image paths inside `data/products.ts` or `data/categories.ts`.

### Add backend later

Good future locations:

```text
app/api/
lib/db.ts
lib/auth.ts
```
