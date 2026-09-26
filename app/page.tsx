import CategorySidebar from "@/components/home/CategorySidebar";
import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import ExpertiseCards from "@/components/home/ExpertiseCards";
import PromoCards from "@/components/home/PromoCards";
import ProductSection from "@/components/home/ProductSection";

const productSections = [
  { title: "Most Sold Item", category: "all" },
  { title: "Men’s T-Shirt", category: "mens-clothing" },
  { title: "Bags", category: "bags" },
  { title: "Fishing Equipment", category: "fishing-equipment" },
  { title: "Women’s Jewelry", category: "jewelry" },
  { title: "Cosmetics", category: "cosmetics" },
  { title: "Women’s Dress", category: "womens-dress" },
  { title: "Stationery", category: "stationery" },
  { title: "Men’s Shoes", category: "mens-shoes" },
];

export default function HomePage() {
  return (
    <main className="container-shop py-4">
      <div className="flex gap-4">
        <CategorySidebar />
        <div className="min-w-0 flex-1 space-y-4">
          <Hero />
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <CategoryGrid />
            <ExpertiseCards />
          </div>
          <PromoCards />
          {productSections.map((s) => (
            <ProductSection key={s.title} title={s.title} category={s.category} />
          ))}
        </div>
      </div>
    </main>
  );
}
