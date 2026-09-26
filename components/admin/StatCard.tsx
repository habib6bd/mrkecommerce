import AnimatedNumber from "./AnimatedNumber";

export default function StatCard({
  label,
  value,
  format,
  accent = "brand",
  hint,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
  accent?: "brand" | "amber" | "red" | "green";
  hint?: string;
}) {
  const accentClass = {
    brand: "text-brand-700",
    amber: "text-amber-600",
    red: "text-red-600",
    green: "text-green-600",
  }[accent];

  return (
    <div className="stat-card card p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-black ${accentClass}`}>
        <AnimatedNumber value={value} format={format} />
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
