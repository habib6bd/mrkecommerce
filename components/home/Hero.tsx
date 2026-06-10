"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
const slides = [
  "/images/banners/01_Seasonal_Banner_WEB_50491f264d.jpg",
  "/images/banners/Generated Image June.png",
  "/images/banners/706496147_966130372865511_988863176349849443_n.jpg",
];
export default function Hero() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((v) => (v + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="relative h-[230px] overflow-hidden rounded-xl bg-brand-700 sm:h-[300px] lg:h-[360px]">
      <Image src={slides[active]} alt="Promotional banner" fill priority className="object-cover" />
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full ${active === i ? "w-8 bg-white" : "w-2 bg-white/60"}`}
          />
        ))}
      </div>
    </section>
  );
}
