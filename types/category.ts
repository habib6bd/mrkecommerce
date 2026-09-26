export type Category = {
  id: number;
  name: string;
  slug: string;
  image: string;
  parent: number | null;
  subcategories: Category[];
};
