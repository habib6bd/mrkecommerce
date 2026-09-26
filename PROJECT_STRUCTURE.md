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

lib/
  api/                              Typed API client (see README.md "Architecture")
  utils.ts                          Helper functions

store/
  AuthContext.tsx                   JWT auth session state
  ShopContext.tsx                   Cart and wishlist state management

types/
  product.ts, category.ts, user.ts, cart.ts, order.ts
                                     TypeScript types mirroring the API responses

backend/
  Django REST API — see backend/README.md
```

## Easy Editing Guide

Products and categories now live in the database, seeded via
`backend/catalog/management/commands/seed_data.py`. Edit that file (and re-run
`python manage.py seed_data`) to change the starter catalog, or use the admin at
`http://localhost:8000/admin/`.

### Change theme color

Open:

```text
tailwind.config.ts
```

Edit the `brand` color values.

### Replace images

Put images inside:

```text
public/images/products/
public/images/categories/
public/images/banners/
```

Then update the image paths in `backend/catalog/management/commands/seed_data.py`
(or upload new ones through `/admin/`).

### Backend

See `backend/README.md` for the Django API (models, endpoints, setup).
