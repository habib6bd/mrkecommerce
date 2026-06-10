import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ShopProvider } from "@/store/ShopContext";
export const metadata: Metadata = {
  title: "MRKExpressBD | Ecommerce Marketplace",
  description: "Responsive ecommerce marketplace built with Next.js",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ShopProvider>
          <Header />
          {children}
          <Footer />
        </ShopProvider>
      </body>
    </html>
  );
}
