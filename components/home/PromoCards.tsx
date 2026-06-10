const cards = [
  "How to buy from global suppliers",
  "Import products with confidence",
  "Delivery process explained",
  "Build your online business",
];
export default function PromoCards() {
  return (
    <section className="card">
      <div className="section-title">
        <h2 className="text-sm font-black">Video Gallery</h2>
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <div key={c} className="overflow-hidden rounded-xl border bg-white">
            {/* <div
              className={`grid aspect-video place-items-center ${i % 2 ? "bg-emerald-100" : "bg-orange-100"}`}
            >
              <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-black text-brand-700">
                ▶ Video
              </span>
            </div> */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
              <iframe
                src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1489828125834561%2F&show_text=false&width=560&t=0"
                className="absolute inset-0 h-full w-full"
                style={{ border: "none", overflow: "hidden" }}
                scrolling="no"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <p className="p-3 text-sm font-bold">{c}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
