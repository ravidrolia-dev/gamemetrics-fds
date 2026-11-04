"use client";
import { usePathname } from "next/navigation";
import { Database, Users } from "lucide-react";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Overview", subtitle: "Executive summary of gaming habits and demographics" },
  "/gaming-behaviour": { title: "Gaming Behaviour & Platform Evolution", subtitle: "Platform migration, switching patterns, and gaming habits" },
  "/hypothesis": { title: "Hypothesis Testing", subtitle: "Statistical validation with Holm-adjusted p-values" },
  "/prediction": { title: "Prediction Lab", subtitle: "Platform-switch intent model with honest evaluation" },
  "/segments": { title: "Gamer Segments", subtitle: "K-Means exploratory clustering of gamer profiles" },
  "/genres": { title: "Genre Trends", subtitle: "Current preferences, expected rises, and age-cohort comparisons" },
  "/methodology": { title: "Methodology & Data", subtitle: "Methods, cleaning decisions, and data transparency" },
};

export default function TopNav() {
  const pathname = usePathname();
  const meta = pageMeta[pathname] || { title: "GameMetrics", subtitle: "Gaming analytics dashboard" };

  return (
    <header className="bg-white border-b border-[#EAE3D6] px-4 md:px-6 py-3.5 flex items-center justify-between gap-4 flex-shrink-0 shadow-sm">
      <div className="min-w-0">
        <h1 className="text-sm md:text-base font-bold text-[#231C18] truncate">{meta.title}</h1>
        <p className="text-[11px] text-[#73675E] truncate hidden sm:block">{meta.subtitle}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8EDEF] border border-[#E8CDD3]">
          <Database size={12} className="text-[#722F37]" />
          <span className="text-[11px] text-[#722F37] font-semibold">Cleaned Survey Data</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DFD4]">
          <Users size={12} className="text-[#8C6D46]" />
          <span className="text-[11px] text-[#8C6D46] font-semibold">n = 205</span>
        </div>
      </div>
    </header>
  );
}
