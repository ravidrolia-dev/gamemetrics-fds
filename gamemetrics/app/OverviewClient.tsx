"use client";
import { useState, useMemo } from "react";
import { Users, Clock, Monitor, ArrowLeftRight, IndianRupee, TrendingUp } from "lucide-react";
import { OverviewData } from "@/src/types/data";
import { ChartCard, KPICard, SectionHeading, EmptyState } from "@/src/components/ui/Cards";
import {
  FreqBarChart, DonutChart, HoursDistChart, CHART_COLORS
} from "@/src/components/charts/Charts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  data: OverviewData;
}

const TOOLTIP_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2D9CD",
  borderRadius: "8px",
  color: "#231C18",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(43, 35, 31, 0.08)",
};
const AXIS_STYLE = { fill: "#73675E", fontSize: 10 };
const GRID_COLOR = "#ECE5DA";

export default function OverviewClient({ data }: Props) {
  const { kpis } = data;

  // Comparison chart: first vs current platform
  const platformComparison = useMemo(() => {
    const firstMap = Object.fromEntries(data.firstPlatformDist.map(d => [d.category, d.count]));
    const currMap = Object.fromEntries(data.currentPlatformDist.map(d => [d.category, d.count]));
    const allPlatforms = Array.from(new Set([
      ...data.firstPlatformDist.map(d => d.category),
      ...data.currentPlatformDist.map(d => d.category),
    ]));
    return allPlatforms.map(p => ({
      name: p,
      "First Platform": firstMap[p] || 0,
      "Current Platform": currMap[p] || 0,
    }));
  }, [data]);

  const weekdayWeekendComparison = [
    { name: "Weekday", mean: data.weekdayHours.mean, median: data.weekdayHours.median },
    { name: "Weekend", mean: data.weekendHours.mean, median: data.weekendHours.median },
  ];

  return (
    <div className="space-y-6 pb-16 md:pb-0 animate-fade-in">
      {/* KPI Cards */}
      <SectionHeading title="Survey at a Glance" description="Key metrics from the 205-respondent analysis dataset" />
      <div className="grid-kpi">
        <KPICard
          label="Total Respondents"
          value={kpis.totalRespondents}
          sub="Primary analysis dataset (age-100 excluded)"
          accent="cyan"
          icon={<Users size={18} />}
        />
        <KPICard
          label="Mean Age"
          value={`${kpis.meanAge} yrs`}
          sub="Range: 14 – 59 years"
          accent="violet"
          icon={<TrendingUp size={18} />}
        />
        <KPICard
          label="Top Platform"
          value={kpis.mostCommonPlatform}
          sub={`${kpis.mostCommonPlatformCount} respondents (${Math.round(kpis.mostCommonPlatformCount/kpis.totalRespondents*100)}%)`}
          accent="blue"
          icon={<Monitor size={18} />}
        />
        <KPICard
          label="Switched Platform"
          value={`${kpis.switchedPercent}%`}
          sub={`${kpis.switchedCount} of ${kpis.totalRespondents} respondents`}
          accent="amber"
          icon={<ArrowLeftRight size={18} />}
        />
        <KPICard
          label="Avg Weekly Hours"
          value={`${kpis.meanWeeklyHours} hrs`}
          sub="Estimated: weekday×5 + weekend×2"
          accent="green"
          icon={<Clock size={18} />}
        />
        <KPICard
          label="Zero Spend"
          value={`${kpis.zeroSpendPercent}%`}
          sub={`${kpis.zeroSpendCount} respondents spend ₹0/month`}
          accent="cyan"
          icon={<IndianRupee size={18} />}
        />
      </div>

      {/* Platform Distribution */}
      <SectionHeading title="Platform Landscape" description="Current and first gaming platform distributions" />
      <div className="grid-charts-2">
        <ChartCard
          title="Current Primary Platform"
          subtitle="Where respondents game now"
          insight={`PC dominates with ${kpis.mostCommonPlatformCount} respondents (${Math.round(kpis.mostCommonPlatformCount/kpis.totalRespondents*100)}%), followed by Mobile. This reflects a significant shift from first-platform distributions.`}
        >
          <FreqBarChart data={data.currentPlatformDist} valueKey="count" height={220} />
        </ChartCard>
        <ChartCard
          title="First Gaming Platform"
          subtitle="Where respondents started gaming"
          insight={`Mobile was the most common first platform (${data.firstPlatformDist.find(d=>d.category==="Mobile")?.count ?? "–"} respondents, ${data.firstPlatformDist.find(d=>d.category==="Mobile")?.percent ?? "–"}%), suggesting many moved to PC later.`}
        >
          <FreqBarChart data={data.firstPlatformDist} valueKey="count" height={220} colorIndex={2} />
        </ChartCard>
      </div>

      {/* First vs Current Comparison */}
      <div className="grid-charts-2">
        <ChartCard
          title="First vs Current Platform"
          subtitle="Shift in platform adoption across respondents"
          insight="PC shows the largest net gain from first to current platform. Mobile shows the largest net loss, consistent with many early mobile gamers migrating to PC."
        >
          <div className="h-[260px]">
            {platformComparison.length > 0 ? (
              <FreqBarChartGrouped data={platformComparison} height={260} />
            ) : <EmptyState />}
          </div>
        </ChartCard>
        <ChartCard
          title="Gamer Type Distribution"
          subtitle="Self-reported gamer archetype"
          insight={`${data.gamerTypeDist[0]?.category ?? "Casual"} gamers make up the majority (${data.gamerTypeDist[0]?.percent ?? "–"}%), reflecting the relaxation/casual motivation as the primary gaming driver.`}
        >
          <DonutChart data={data.gamerTypeDist} height={260} />
        </ChartCard>
      </div>

      {/* Behaviour */}
      <SectionHeading title="Gaming Behaviour" description="Experience, frequency, motivation, and hours" />
      <div className="grid-charts-3">
        <ChartCard title="Experience Level" subtitle="Self-rated expertise">
          <DonutChart data={data.experienceDist} height={220} />
        </ChartCard>
        <ChartCard title="Gaming Frequency" subtitle="How often respondents play">
          <FreqBarChart data={data.frequencyDist} height={220} colorIndex={3} />
        </ChartCard>
        <ChartCard title="Primary Motivation" subtitle="Main reason for gaming">
          <FreqBarChart data={data.motivationDist} height={220} colorIndex={1} horizontal />
        </ChartCard>
      </div>

      {/* Hours distributions */}
      <div className="grid-charts-2">
        <ChartCard
          title="Weekday Playtime Distribution"
          subtitle="Reported hours per weekday"
          insight={`Median: ${data.weekdayHours.median} hrs, Mean: ${data.weekdayHours.mean} hrs. Most respondents play 1–3 hours on weekdays.`}
        >
          <HoursDistChart data={data.weekdayHoursDist} height={200} />
        </ChartCard>
        <ChartCard
          title="Weekend Playtime Distribution"
          subtitle="Reported hours per weekend day"
          insight={`Median: ${data.weekendHours.median} hrs, Mean: ${data.weekendHours.mean} hrs. Playtime shifts substantially upward on weekends.`}
        >
          <HoursDistChart data={data.weekendHoursDist} height={200} />
        </ChartCard>
      </div>

      {/* Spending & Technology */}
      <SectionHeading title="Monetisation & Emerging Technology" description="Spending patterns and receptiveness to new technology" />
      <div className="grid-charts-3">
        <ChartCard
          title="Monthly Spend"
          subtitle="Monthly spend in INR"
          insight="A large plurality (40%) spend zero monthly INR, relying on free-to-play titles."
        >
          <FreqBarChart data={data.spendingDist} height={220} colorIndex={4} />
        </ChartCard>
        <ChartCard title="Cloud Gaming Adoption" subtitle="Have tried cloud gaming">
          <DonutChart data={data.cloudAdoption} height={220} />
        </ChartCard>
        <ChartCard title="AI Features Adoption" subtitle="Have used AI in games">
          <DonutChart data={data.aiAdoption} height={220} />
        </ChartCard>
      </div>

      {/* Demographics */}
      <SectionHeading title="Demographics" description="Gender and occupation distributions" />
      <div className="grid-charts-2">
        <ChartCard title="Gender Distribution" subtitle="Reported gender identity">
          <FreqBarChart data={data.genderDist} height={220} colorIndex={0} />
        </ChartCard>
        <ChartCard title="Occupation Distribution" subtitle="Respondent occupation category">
          <DonutChart data={data.occupationDist} height={220} />
        </ChartCard>
      </div>

      {/* Weekday vs Weekend summary */}
      <div className="card bg-white border border-[#EAE3D6] shadow-sm">
        <div className="section-title mb-3 text-[#231C18] font-bold">Weekday vs Weekend Hours Summary</div>
        <div className="grid grid-cols-2 gap-4">
          {weekdayWeekendComparison.map((item, i) => (
            <div key={item.name} className="rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] p-4">
              <div className="text-xs text-[#73675E] uppercase tracking-wider font-semibold mb-1">{item.name}</div>
              <div className="flex gap-6">
                <div>
                  <div className="text-xl font-extrabold text-[#722F37]">{item.mean}</div>
                  <div className="text-[11px] text-[#73675E]">Mean hrs/day</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-[#C28B54]">{item.median}</div>
                  <div className="text-[11px] text-[#73675E]">Median hrs/day</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-[#73675E]">
          Estimated weekly hours = weekday hours × 5 + weekend hours × 2 (mean: {kpis.meanWeeklyHours} hrs/week).
          This is a derived operational construct; verify question wording before interpreting as an exact continuous measurement.
        </div>
      </div>
    </div>
  );
}

function FreqBarChartGrouped({
  data,
  height = 260,
}: {
  data: { name: string; "First Platform": number; "Current Platform": number }[];
  height: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 40, left: 8 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="name" tick={AXIS_STYLE} tickLine={false} axisLine={false}
          angle={-30} textAnchor="end" interval={0} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend formatter={(v: string) => <span style={{ color: "#73675E", fontSize: 10 }}>{v}</span>} iconSize={8} />
        <Bar dataKey="First Platform" fill="#722F37" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Current Platform" fill="#C28B54" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
