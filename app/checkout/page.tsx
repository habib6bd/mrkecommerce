export default function CheckoutPage() {
  return (
    <main className="container-shop py-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <form className="card p-5">
          <h1 className="text-2xl font-black">Checkout</h1>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input className="rounded-lg border px-3 py-2" placeholder="Full name" />
            <input className="rounded-lg border px-3 py-2" placeholder="Phone number" />
            <input
              className="rounded-lg border px-3 py-2 md:col-span-2"
              placeholder="Email address"
            />
            <input
              className="rounded-lg border px-3 py-2 md:col-span-2"
              placeholder="Full address"
            />
            <input className="rounded-lg border px-3 py-2" placeholder="City" />
            <input className="rounded-lg border px-3 py-2" placeholder="Postal code" />
          </div>
          <h2 className="mt-8 font-black">Payment Method</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {["Cash on Delivery", "bKash", "Card"].map((m) => (
              <label key={m} className="rounded-lg border p-3 text-sm font-bold">
                <input type="radio" name="payment" className="mr-2" /> {m}
              </label>
            ))}
          </div>
          <button className="mt-6 rounded-lg bg-brand-600 px-6 py-3 font-black text-white">
            Place Order
          </button>
        </form>
        <aside className="card h-max p-5">
          <h2 className="text-xl font-black">Secure Checkout</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Ready for future payment gateway and order API integration.
          </p>
        </aside>
      </div>
    </main>
  );
}
