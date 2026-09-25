"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const proxy = useRef({ val: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = proxy.current;
    const tween = gsap.to(target, {
      val: value,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = format ? format(target.val) : Math.round(target.val).toLocaleString();
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, format]);

  return <span ref={ref} className={className}>0</span>;
}
