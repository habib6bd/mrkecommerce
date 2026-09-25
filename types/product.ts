export type Product = {
  id: number;
  name: string;
  slug: string;
  category: string; // category slug
  price: number;
  discountPrice: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  inStock: boolean;
  stock: number;
  shortDescription: string;
  description: string;
  colors: string[];
  sizes: string[];
  soldCount: number;
  isFeatured: boolean;
  createdAt: string;
};

export type CartItem = { product: Product; quantity: number };

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
