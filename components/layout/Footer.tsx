import Link from "next/link";
export default function Footer() {
  return (
    <footer className="mt-8 bg-white">
      <div className="container-shop grid gap-8 border-t py-10 md:grid-cols-4">
        <div>
          <p className="text-2xl font-black text-brand-700">MRKExpressBD</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            A modern ecommerce marketplace demo built with Next.js and Tailwind CSS.
          </p>
          <div className="mt-4 text-sm text-slate-600">
            <p>Head Office: Dhaka, Bangladesh</p>
            <p>Email: support@MRKExpressBD.com</p>
            <p>Phone: +880 1700-000000</p>
          </div>
        </div>
        <div>
          <h3 className="font-black">Customer</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <Link href="/cart" className="block">
              Cart
            </Link>
            <Link href="/wishlist" className="block">
              Wishlist
            </Link>
            <Link href="/checkout" className="block">
              Checkout
            </Link>
          </div>
        </div>
        <div>
          <h3 className="font-black">Information</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <Link href="/about" className="block">
              About Us
            </Link>
            <Link href="/contact" className="block">
              Contact Us
            </Link>
            <Link href="/faq" className="block">
              FAQ
            </Link>
          </div>
        </div>
        <div>
          <h3 className="font-black">Newsletter</h3>
          <p className="mt-4 text-sm text-slate-600">Get deals and product updates.</p>
          <div className="mt-3 flex rounded-lg border">
            <input
              placeholder="Email address"
              className="w-full rounded-l-lg px-3 py-2 text-sm outline-none"
            />
            <button className="rounded-r-lg bg-brand-600 px-4 text-sm font-bold text-white">
              Join
            </button>
          </div>
          <p className="mt-5 font-black">Payment Methods</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
            {["Visa", "Mastercard", "bKash", "Nagad", "Rocket", "COD"].map((m) => (
              <span key={m} className="rounded border px-2 py-1">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-sm text-slate-500">
        © 2026 MRKExpressBD. All rights reserved.
      </div>
    </footer>
  );
}
