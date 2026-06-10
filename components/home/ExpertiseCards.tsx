const items = [
  { title: "Request Ship For Me", icon: "🚢" },
  { title: "Request For Quotation", icon: "🧾" },
  { title: "Complaint Box", icon: "📦" },
  { title: "Talk to Business Doctor", icon: "💬" },
];
export default function ExpertiseCards() {
  return (
    <section className="card">
      <div className="section-title">
        <h2 className="text-sm font-black">Our Expertise</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 p-3">
        {items.map((i) => (
          <div
            key={i.title}
            className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-center"
          >
            <div className="text-3xl">{i.icon}</div>
            <p className="mt-2 text-xs font-black text-brand-800">{i.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
