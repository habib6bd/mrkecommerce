import CategorySidebar from "@/components/home/CategorySidebar";
import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import ExpertiseCards from "@/components/home/ExpertiseCards";
import PromoCards from "@/components/home/PromoCards";
import ProductSection from "@/components/home/ProductSection";
import { productSections } from "@/data/products";
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
