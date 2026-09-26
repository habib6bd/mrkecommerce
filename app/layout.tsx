import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/store/AuthContext";
import { ShopProvider } from "@/store/ShopContext";
import { listCategories } from "@/lib/api/categories";
import { Category } from "@/types/category";

export const metadata: Metadata = {
  title: "MRKExpressBD | Ecommerce Marketplace",
  description: "Responsive ecommerce marketplace built with Next.js",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let categories: Category[] = [];
  try {
    categories = await listCategories({ next: { revalidate: 300 } });
  } catch {
    // API unavailable at build/request time; header/footer render without categories.
  }

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ShopProvider>
            <Header categories={categories} />
            {children}
            <Footer />
          </ShopProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
