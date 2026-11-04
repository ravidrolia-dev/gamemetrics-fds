"use client";
import { useState } from "react";
import { Gamepad2, TrendingUp, Users, Sparkles } from "lucide-react";
import { GenreData } from "@/src/types/data";
import { ChartCard, SectionHeading, CaveatBox, KPICard } from "@/src/components/ui/Cards";
import { FreqBarChart, CohortBarChart } from "@/src/components/charts/Charts";

interface GenresClientProps {
  data: GenreData;
}

export default function GenresClient({ data }: GenresClientProps) {
  const [metricView, setMetricView] = useState<"count" | "percent">("percent");

  const totalRisingMentions = data.risingGenres.reduce((acc, curr) => acc + curr.count, 0);
  const risingChartData = data.risingGenres.map((item) => ({
    category: item.genre,
    count: item.count,
    percent: totalRisingMentions > 0 ? Number(((item.count / totalRisingMentions) * 100).toFixed(1)) : 0,
  }));

  const topCurrent = data.currentGenreDist[0] || { category: "RPG", percent: 17.6 };
  const topRising = data.risingGenres[0] || { genre: "AI-generated/procedural games", count: 61 };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE3D6] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8EDEF] border border-[#E8CDD3] text-[#722F37] text-xs font-semibold uppercase tracking-wider mb-2">
            <Gamepad2 className="w-3.5 h-3.5" /> Content & Genre Dynamics
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#231C18] tracking-tight">
            Genre Popularity & Trajectory Analysis
          </h1>
          <p className="text-[#73675E] text-sm mt-1 max-w-2xl">
            Examining current genre dominance, emerging tech-driven formats, and age-cohort preferences across survey respondents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#73675E] mr-1 font-medium">Display:</span>
          <button
            onClick={() => setMetricView("percent")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              metricView === "percent"
                ? "bg-[#722F37] text-white font-semibold shadow-sm"
                : "bg-white text-[#73675E] border border-[#DDD3C3] hover:bg-[#FAF7F2]"
            }`}
          >
            Percentage
          </button>
          <button
            onClick={() => setMetricView("count")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              metricView === "count"
                ? "bg-[#722F37] text-white font-semibold shadow-sm"
                : "bg-white text-[#73675E] border border-[#DDD3C3] hover:bg-[#FAF7F2]"
            }`}
          >
            Raw Count
          </button>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Top Current Genre"
          value={topCurrent.category}
          subtitle={`${topCurrent.percent}% of active primary play`}
          icon={<Gamepad2 className="w-5 h-5 text-[#722F37]" />}
          accent="cyan"
        />
        <KPICard
          title="Top Emerging Format"
          value={topRising.genre}
          subtitle={`${topRising.count} mentions across respondents`}
          icon={<TrendingUp className="w-5 h-5 text-[#4E6853]" />}
          accent="green"
        />
        <KPICard
          title="Younger Cohort (<22)"
          value={`${data.cohortSizes.under22} Gamers`}
          subtitle="Primary student & early-career bracket"
          icon={<Users className="w-5 h-5 text-[#722F37]" />}
          accent="wine"
        />
        <KPICard
          title="Older Cohort (22+)"
          value={`${data.cohortSizes["22plus"]} Gamers`}
          subtitle="Established career & mature bracket"
          icon={<Users className="w-5 h-5 text-[#8C6D46]" />}
          accent="amber"
        />
      </div>

      {/* Current vs Rising Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Current Primary Genre Distribution"
          subtitle="Primary genre chosen by respondents (n=205)"
          insight="RPG (17.6%) and Action (17.1%) dominate the respondent base, followed closely by Sandbox/Open-world (13.6%)."
        >
          <FreqBarChart
            data={data.currentGenreDist}
            valueKey={metricView}
            horizontal={true}
            height={320}
            colorIndex={0}
          />
        </ChartCard>

        <ChartCard
          title="Rising Genres & Emerging Formats"
          subtitle="Formats respondents believe will rise over the next 3-5 years (multi-select)"
          insight="AI-generated and procedurally generated gaming (61 mentions) and VR/AR immersive titles (50+ mentions) lead perceived growth trajectories."
        >
          <FreqBarChart
            data={risingChartData}
            valueKey={metricView}
            horizontal={true}
            height={320}
            colorIndex={1}
          />
        </ChartCard>
      </div>

      {/* Age Cohort Comparison Section */}
      <div className="border border-[#EAE3D6] bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAE3D6] gap-2">
          <SectionHeading
            title="Genre Preference by Age Cohort"
            subtitle="Comparing genre selection rates between respondents Under 22 vs 22 and over"
          />
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-[#722F37]">
              <span className="w-3 h-3 rounded-sm bg-[#722F37] inline-block" /> Under 22 (n={data.cohortSizes.under22})
            </span>
            <span className="flex items-center gap-1.5 text-[#C28B54]">
              <span className="w-3 h-3 rounded-sm bg-[#C28B54] inline-block" /> 22+ (n={data.cohortSizes["22plus"]})
            </span>
          </div>
        </div>

        <div className="mt-6">
          <CohortBarChart data={data.ageCohortComparison} height={320} />
        </div>

        {/* Cohort Details Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EAE3D6] text-[#73675E] bg-[#FAF7F2]">
                <th className="py-2.5 px-3">Genre</th>
                <th className="py-2.5 px-3 text-right">Under 22 Count</th>
                <th className="py-2.5 px-3 text-right">Under 22 %</th>
                <th className="py-2.5 px-3 text-right">22+ Count</th>
                <th className="py-2.5 px-3 text-right">22+ %</th>
                <th className="py-2.5 px-3 text-right">Percentage Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E9DF] text-[#382F2A]">
              {data.ageCohortComparison.map((row) => (
                <tr key={row.genre} className="hover:bg-[#FAF7F2]">
                  <td className="py-2.5 px-3 font-semibold text-[#231C18]">{row.genre}</td>
                  <td className="py-2.5 px-3 text-right text-[#73675E]">{row.under22_n}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#722F37] font-semibold">{row.under22.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right text-[#73675E]">{row["22plus_n"]}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#C28B54] font-semibold">{row["22plus"].toFixed(1)}%</td>
                  <td className={`py-2.5 px-3 text-right font-mono font-semibold ${
                    row.diff > 0 ? "text-[#722F37]" : row.diff < 0 ? "text-[#B8533B]" : "text-[#8A7D73]"
                  }`}>
                    {row.diff > 0 ? `+${row.diff.toFixed(1)}%` : `${row.diff.toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Declining Genres Section */}
      {data.declineGenres && data.declineGenres.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard
            title="Reported Declining Formats"
            subtitle="Genres respondents identified as losing engagement"
            insight="Traditional linear single-player models with high repetitive grind show rising fatigue relative to dynamic emergent experiences."
          >
            <FreqBarChart
              data={data.declineGenres}
              valueKey="percent"
              horizontal={true}
              height={220}
              colorIndex={4}
            />
          </ChartCard>

          <div className="border border-[#EAE3D6] bg-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#231C18] mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#722F37]" /> Analytical Takeaways
              </h3>
              <p className="text-xs text-[#554A43] leading-relaxed space-y-2">
                Younger gamers (&lt;22) demonstrate higher propensity towards competitive multiplayer and sandbox titles, whereas gamers aged 22 and older show stronger sustained attachment to RPGs and strategy experiences.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#EAE3D6]">
              <span className="text-[11px] text-[#73675E] block font-mono">
                Statistical Significance: Mann-Whitney U & Chi-square cohort validations detailed in Hypothesis Lab.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Caveat Box */}
      <CaveatBox title="Genre Data Collection Notes">
        <ul className="list-disc list-inside space-y-1 text-xs text-[#5C5248]">
          {data.notes.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
          <li>
            Rising genres question was multi-select (up to two choices per respondent), so counts reflect total choice frequency rather than mutually exclusive participant counts.
          </li>
        </ul>
      </CaveatBox>
    </div>
  );
}
