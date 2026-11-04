import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  insight?: string;
}

export function ChartCard({ title, subtitle, children, className = "", insight }: ChartCardProps) {
  return (
    <div className={`card card-hover flex flex-col gap-3 bg-white border border-[#EAE3D6] rounded-xl p-5 shadow-sm ${className}`}>
      <div>
        <div className="section-title text-[#231C18] font-bold text-base">{title}</div>
        {subtitle && <div className="section-subtitle text-[#73675E] text-xs">{subtitle}</div>}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
      {insight && (
        <div className="mt-1 px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6] text-[11px] text-[#554A43] leading-relaxed">
          <span className="text-[#722F37] font-bold">Insight: </span>{insight}
        </div>
      )}
    </div>
  );
}

interface KPICardProps {
  label?: string;
  title?: string;
  value: string | number;
  sub?: string;
  subtitle?: string;
  accent?: "cyan" | "violet" | "green" | "amber" | "blue" | "wine" | "sand" | "sage";
  icon?: ReactNode;
}

const accentMap = {
  cyan: { number: "text-[#722F37]", bg: "bg-[#FAF4F5]", border: "border-[#EBD7DC]" }, // Wine red
  wine: { number: "text-[#722F37]", bg: "bg-[#FAF4F5]", border: "border-[#EBD7DC]" },
  violet: { number: "text-[#B8533B]", bg: "bg-[#FBF5F2]", border: "border-[#EED9D2]" }, // Terracotta
  green: { number: "text-[#4A6B52]", bg: "bg-[#F4F7F4]", border: "border-[#D5E3D8]" }, // Muted sage
  sage: { number: "text-[#4A6B52]", bg: "bg-[#F4F7F4]", border: "border-[#D5E3D8]" },
  amber: { number: "text-[#9E5D20]", bg: "bg-[#FDF9F2]", border: "border-[#EFE1CA]" }, // Warm sand/amber
  sand: { number: "text-[#8C6D46]", bg: "bg-[#FAF7F2]", border: "border-[#E8DFD4]" },
  blue: { number: "text-[#3D4F65]", bg: "bg-[#F3F6F9]", border: "border-[#D8E1EA]" }, // Slate navy
};

export function KPICard({ label, title, value, sub, subtitle, accent = "cyan", icon }: KPICardProps) {
  const colors = accentMap[accent];
  const displayLabel = label || title || "";
  const displaySub = sub || subtitle;

  return (
    <div className={`relative overflow-hidden rounded-xl ${colors.bg} border ${colors.border} p-4 flex flex-col gap-1 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="text-xs font-semibold text-[#73675E] uppercase tracking-wider leading-tight">{displayLabel}</div>
        {icon && <div className={`${colors.number} opacity-75`}>{icon}</div>}
      </div>
      <div className={`stat-number ${colors.number}`}>{value}</div>
      {displaySub && <div className="text-[11px] text-[#8A7D73] mt-0.5">{displaySub}</div>}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  subtitle,
}: {
  title: string;
  description?: string;
  subtitle?: string;
}) {
  const desc = description || subtitle;
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-[#231C18] flex items-center gap-2">
        <span className="w-1.5 h-4 rounded-full bg-[#722F37] inline-block" />
        {title}
      </h2>
      {desc && <p className="text-xs text-[#73675E] mt-1 ml-3.5">{desc}</p>}
    </div>
  );
}

export function CaveatBox({
  items,
  children,
  title = "Important Caveats",
}: {
  items?: string[];
  children?: ReactNode;
  title?: string;
}) {
  return (
    <div className="rounded-xl bg-[#FAF7F2] border border-[#E2D4BE] p-4 shadow-sm">
      <div className="text-xs font-bold text-[#8C5E28] uppercase tracking-wider mb-2">⚠ {title}</div>
      {children ? (
        children
      ) : (
        <ul className="space-y-1">
          {items?.map((item, i) => (
            <li key={i} className="text-xs text-[#5C5248] flex gap-2">
              <span className="text-[#8C5E28] flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EmptyState({ message = "No data available" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-sm text-[#8A7D73] italic">
      {message}
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="card">
      <div className="loading-pulse h-4 w-32 mb-3" />
      <div className="loading-pulse h-48 w-full" />
    </div>
  );
}
