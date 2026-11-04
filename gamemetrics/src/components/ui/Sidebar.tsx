"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Gamepad2, Monitor, FlaskConical,
  Brain, Users, TrendingUp, BookOpen, ChevronLeft,
  ChevronRight, BarChart3
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard, desc: "Executive summary" },
  { href: "/gaming-behaviour", label: "Gaming Behaviour", icon: Gamepad2, desc: "Habits & platform evolution" },
  { href: "/hypothesis", label: "Hypothesis Testing", icon: FlaskConical, desc: "Statistical validation" },
  { href: "/prediction", label: "Prediction Lab", icon: Brain, desc: "ML model & predictor" },
  { href: "/segments", label: "Gamer Segments", icon: Users, desc: "K-Means clustering" },
  { href: "/genres", label: "Genre Trends", icon: TrendingUp, desc: "Genre analysis" },
  { href: "/methodology", label: "Methodology & Data", icon: BookOpen, desc: "Methods & transparency" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col border-r border-[#EAE3D6] bg-[#FAF7F2] transition-all duration-300"
        style={{ width: collapsed ? "64px" : "240px", minWidth: collapsed ? "64px" : "240px" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#EAE3D6]">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#722F37] flex-shrink-0 shadow-sm">
            <BarChart3 size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-bold text-[#231C18] leading-tight">GameMetrics</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="px-2 pb-2 text-[10px] font-semibold text-[#8A7D73] uppercase tracking-widest">
              Analytics Modules
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={16} className={`flex-shrink-0 ${isActive ? "text-[#722F37]" : "text-[#73675E]"}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-[#EAE3D6] p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="nav-item justify-center text-[#73675E] hover:text-[#231C18]"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : (
              <>
                <ChevronLeft size={16} />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF7F2] border-t border-[#EAE3D6] flex items-center justify-around px-1 py-2 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all ${isActive ? "text-[#722F37] font-semibold" : "text-[#73675E]"}`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-medium">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
