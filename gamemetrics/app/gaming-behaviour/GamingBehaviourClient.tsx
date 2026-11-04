"use client";
import { useState } from "react";
import { PlatformEvolutionData } from "@/src/types/data";
import { ChartCard, SectionHeading, CaveatBox } from "@/src/components/ui/Cards";
import { FreqBarChart, GroupedBarChart } from "@/src/components/charts/Charts";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const TOOLTIP_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2D9CD",
  borderRadius: "8px",
  color: "#231C18",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(43, 35, 31, 0.08)",
};
const AXIS_STYLE = { fill: "#73675E", fontSize: 11 };
const GRID_COLOR = "#ECE5DA";

export default function GamingBehaviourClient({ data }: { data: PlatformEvolutionData }) {
  const [view, setView] = useState<"count" | "percent">("count");

  // Build cross-tab display data
  const crosstabData = data.firstVsCurrent.rows.map(row => {
    const entry: Record<string, string | number> = { name: row.name };
    data.firstVsCurrent.columns.forEach((col, i) => {
      entry[col] = row.values[i];
    });
    return entry;
  });

  // Switching rate by platform
  const switchRateData = data.switchByPlatform.map(d => ({
    name: d.platform,
    Switched: d.yes,
    "Did not switch": d.no,
    switchedPct: d.switchedPct,
  }));

  // Hours by platform
  const hoursData = data.hoursByPlatform.map(d => ({
    name: d.platform,
    "Mean hrs/week": d.mean,
    "Median hrs/week": d.median,
  }));

  // Spending by platform with name property
  const spendingChartData = data.spendingByPlatform.map(d => ({
    name: d.platform,
    ...d,
  }));

  return (
    <div className="space-y-6 pb-16 md:pb-0 animate-fade-in">
      {/* Platform flow summary */}
      <SectionHeading title="Platform Migration Summary" description="How gaming platform use has changed across respondents" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Have switched platform", value: data.switchByPlatform.reduce((a, b) => a + b.yes, 0), color: "text-[#722F37]" },
          { label: "Have not switched", value: data.switchByPlatform.reduce((a, b) => a + b.no, 0), color: "text-[#8C6D46]" },
          { label: "Plan to switch", value: data.futurePlatDist.filter(d => d.category !== "No plans to switch").reduce((a, b) => a + b.count, 0), color: "text-[#B8533B]" },
          { label: "No switch planned", value: data.futurePlatDist.find(d => d.category === "No plans to switch")?.count ?? 92, color: "text-[#4E6853]" },
        ].map(item => (
          <div key={item.label} className="card bg-white border border-[#EAE3D6] p-4 shadow-sm">
            <div className={`text-2xl font-extrabold ${item.color}`}>{item.value}</div>
            <div className="text-xs text-[#73675E] mt-1 font-medium">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Sankey / Flow - shown as stacked cross-tab heatmap */}
      <SectionHeading title="First → Current Platform Cross-Tabulation"
        description="Rows = first platform; columns = current platform. Counts show how many respondents in each first-platform group now use each current platform." />

      <div className="card bg-white border border-[#EAE3D6] overflow-x-auto shadow-sm">
        <div className="mb-3 text-xs text-[#73675E]">
          Caution: The aggregate difference between first and current distributions does not prove that every respondent followed a specific migration path.
          Only the cross-tabulation below shows confirmed individual-level combinations.
        </div>

        <table className="data-table w-full">
          <thead>
            <tr>
              <th>First Platform ↓ / Current →</th>
              {data.firstVsCurrent.columns.map(c => (
                <th key={c} className="text-center">{c}</th>
              ))}
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.firstVsCurrent.rows.map((row) => {
              const rowTotal = row.values.reduce((a, b) => a + b, 0);
              const maxRowVal = Math.max(...row.values);
              return (
                <tr key={row.name}>
                  <td className="font-semibold text-[#231C18]">{row.name}</td>
                  {row.values.map((val, ci) => {
                    const isDiagonal = row.name === data.firstVsCurrent.columns[ci];
                    const intensity = maxRowVal > 0 ? val / maxRowVal : 0;
                    return (
                      <td
                        key={ci}
                        className="text-center font-mono"
                        style={{
                          background: isDiagonal
                            ? `rgba(114, 47, 55, ${0.06 + intensity * 0.25})`
                            : val > 0
                            ? `rgba(184, 83, 59, ${intensity * 0.18})`
                            : undefined,
                          color: isDiagonal ? "#722F37" : val > 0 ? "#B8533B" : "#8A7D73",
                          fontWeight: val > 0 ? 600 : 400,
                        }}
                      >
                        {val}
                      </td>
                    );
                  })}
                  <td className="text-right font-bold text-[#231C18]">{rowTotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-[#73675E]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#FAF4F5] border border-[#E8CDD3] inline-block" />
            Stayed on first platform (diagonal)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#FBF5F2] border border-[#EED9D2] inline-block" />
            Migrated away (off-diagonal)
          </span>
        </div>
      </div>

      {/* Switch rate by platform */}
      <div className="grid-charts-2">
        <ChartCard
          title="Platform Migration: Switch Rate by Current Platform"
          subtitle="Respondents who reported having switched their primary platform at any point"
          insight="PC users show the highest reported historical switching rate (65%), reflecting migration from earlier mobile and console experiences."
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={switchRateData} margin={{ top: 4, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid vertical={false} stroke={GRID_COLOR} />
              <XAxis dataKey="name" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend formatter={(v) => <span style={{ color: "#73675E", fontSize: 10 }}>{v}</span>} iconSize={8} />
              <Bar dataKey="Switched" fill="#722F37" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="Did not switch" fill="#C28B54" radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Future Platform Preferences */}
        <ChartCard
          title="Future Platform Intent"
          subtitle="Platform respondents are most likely to move toward next (n=205)"
          insight="44.9% have no plans to switch. Among potential movers, PC leads (26.3%), with Cloud Gaming capturing 2.4% and AI-driven platforms 2.0%."
        >
          <FreqBarChart
            data={data.futurePlatDist}
            valueKey="percent"
            horizontal={true}
            height={260}
            colorIndex={0}
          />
        </ChartCard>
      </div>

      {/* Spending and Hours by platform */}
      <div className="grid-charts-2">
        <ChartCard
          title="Monthly Spending by Current Platform"
          subtitle="Distribution of reported monthly gaming expenditure across platforms"
          insight="Console and PC gamers show higher proportions in the 1,000+ INR bracket, while mobile gamers are predominantly in the low/no-spend category."
        >
          <GroupedBarChart
            data={spendingChartData}
            keys={data.spendingCategories && data.spendingCategories.length > 0 ? data.spendingCategories : ["₹0", "₹1-500", "₹500-1500", "₹1500-5000", "₹5000+"]}
            height={280}
            layout="horizontal"
          />
        </ChartCard>

        <ChartCard
          title="Weekly Playtime by Current Platform"
          subtitle="Estimated weekly hours (weekday×5 + weekend×2) by primary platform"
          insight="The Kruskal–Wallis test found a statistically significant difference in weekly hours across platforms (H=15.5, Holm-p=0.008). See Hypothesis Testing for details."
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hoursData} margin={{ top: 4, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid vertical={false} stroke={GRID_COLOR} />
              <XAxis dataKey="name" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v} hrs`, ""]} />
              <Legend formatter={(v) => <span style={{ color: "#73675E", fontSize: 10 }}>{v}</span>} iconSize={8} />
              <Bar dataKey="Mean hrs/week" fill="#722F37" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Median hrs/week" fill="#B8533B" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <CaveatBox items={[
        "Cross-tabulation shows observed platform combinations; it does not prove specific migration paths.",
        "Switching reasons for 6 respondents were set to missing due to inconsistency with their Yes/No answer. Their switch answer is retained.",
        "Future platform categories Cloud Gaming (n=5) and AI-driven platforms (n=4) are too small for reliable subgroup analysis.",
        "Weekly hours are derived estimates (weekday×5 + weekend×2), not directly measured.",
      ]} />
    </div>
  );
}
