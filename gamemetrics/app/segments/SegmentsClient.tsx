"use client";
import { useState } from "react";
import { Users, Sparkles, Layers, Info, BarChart3, Clock, Compass } from "lucide-react";
import { SegmentData, ClusterProfile } from "@/src/types/data";
import { ChartCard, SectionHeading, CaveatBox } from "@/src/components/ui/Cards";
import { FreqBarChart, ClusterRadar, DiagnosticsLineChart, CHART_COLORS } from "@/src/components/charts/Charts";

interface SegmentsClientProps {
  data: SegmentData;
}

export default function SegmentsClient({ data }: SegmentsClientProps) {
  const [selectedCluster, setSelectedCluster] = useState<number>(0);

  const lineData = data.diagnostics.kRange.map((k, idx) => ({
    k,
    Inertia: Math.round(data.diagnostics.inertias[idx]),
    "Silhouette x1000": Math.round(data.diagnostics.silhouettes[idx] * 1000),
  }));

  const radarFeatures = data.featureNames || [
    "Weekday Hours",
    "Weekend Hours",
    "Feat: Gameplay",
    "Feat: Story",
    "Feat: Graphics",
    "Feat: Competition",
    "Feat: Social",
    "Willingness to Improve",
    "Cloud Interest",
    "Tech Openness",
    "Gaming Importance",
  ];

  const radarData: { feature: string; [key: string]: string | number }[] = radarFeatures.map((feat) => {
    const item: { feature: string; [key: string]: string | number } = { feature: feat.replace("Feat: ", "") };
    data.profiles.forEach((p) => {
      item[p.name] = p.means[feat] ?? 0;
    });
    return item;
  });

  const activeProfile: ClusterProfile = data.profiles[selectedCluster] || data.profiles[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE3D6] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8EDEF] border border-[#E8CDD3] text-[#722F37] text-xs font-semibold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" /> Unsupervised Machine Learning
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#231C18] tracking-tight">
            Gamer Segmentation Analysis
          </h1>
          <p className="text-[#73675E] text-sm mt-1 max-w-2xl">
            K-Means clustering across standardized behavioral and preference dimensions reveals empirical gamer cohorts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-[#EAE3D6] text-right shadow-sm">
            <span className="text-xs text-[#73675E] block">Optimal Clusters</span>
            <span className="text-lg font-bold text-[#722F37]">k = {data.diagnostics.bestK}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border border-[#EAE3D6] text-right shadow-sm">
            <span className="text-xs text-[#73675E] block">Peak Silhouette</span>
            <span className="text-lg font-bold text-[#4E6853]">{data.diagnostics.bestKSilhouette.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Overview Cluster Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.profiles.map((p, idx) => (
          <div
            key={p.cluster}
            onClick={() => setSelectedCluster(p.cluster)}
            className={`cursor-pointer transition-all duration-200 p-5 rounded-xl border shadow-sm ${
              selectedCluster === p.cluster
                ? "bg-[#FAF5F6] border-[#722F37] ring-1 ring-[#722F37]"
                : "bg-white border-[#EAE3D6] hover:bg-[#FAF7F2]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FAF7F2] text-[#73675E] border border-[#EAE3D6]">
                Cluster {p.cluster}
              </span>
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
              />
            </div>
            <h3 className="text-base font-semibold text-[#231C18] line-clamp-1">{p.name}</h3>
            <div className="mt-4 flex items-baseline justify-between text-sm">
              <span className="text-[#73675E]">Size:</span>
              <span className="font-semibold text-[#231C18]">
                {p.size} <span className="text-xs text-[#8A7D73]">({((p.size / 205) * 100).toFixed(1)}%)</span>
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-sm">
              <span className="text-[#73675E]">Weekly Play:</span>
              <span className="font-semibold text-[#722F37]">
                {p.weeklyHoursMean ? `${p.weeklyHoursMean.toFixed(1)} hrs` : "N/A"}
              </span>
            </div>
          </div>
        ))}

        <div className="p-5 rounded-xl border border-[#EAE3D6] bg-[#FAF7F2] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#8C5E28] font-semibold mb-1">
              <Info className="w-3.5 h-3.5" /> Validation Note
            </div>
            <p className="text-xs text-[#5C5248] leading-relaxed">
              Silhouette coefficient (0.17 at k=2) indicates continuous behavioural density rather than completely isolated clusters.
            </p>
          </div>
          <span className="text-[11px] text-[#8A7D73] font-mono mt-3">Standardized Euclidean Distance</span>
        </div>
      </div>

      {/* Cluster Radar & Diagnostics side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Cluster Feature Profiles (Multi-dimensional Radar)"
          subtitle="Mean scores across survey rating attributes and play patterns (scale 1-5)"
          insight="Cluster 0 leads sharply in technical openness, graphics preference, and total weekly hours, whereas Cluster 1 exhibits casual engagement."
        >
          <ClusterRadar
            data={radarData}
            keys={data.profiles.map((p) => p.name)}
            height={340}
          />
        </ChartCard>

        <ChartCard
          title="Clustering Diagnostics: Inertia & Silhouette"
          subtitle="Evaluating optimal k across candidate partitions (k=2 to 6)"
          insight="Silhouette coefficient peaks at k=2 (0.172) and drops monotonically thereafter, identifying two primary behavioural modes."
        >
          <div className="space-y-4">
            <DiagnosticsLineChart
              data={lineData}
              keys={["Silhouette x1000", "Inertia"]}
              height={260}
            />
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {data.diagnostics.kRange.map((k, i) => (
                <div
                  key={k}
                  className={`p-2 rounded-lg border ${
                    k === data.diagnostics.bestK
                      ? "bg-[#FAF5F6] border-[#722F37] text-[#722F37] font-semibold"
                      : "bg-[#FAF7F2] border-[#EAE3D6] text-[#73675E]"
                  }`}
                >
                  <div className="font-mono">k={k}</div>
                  <div className="text-[10px] text-[#8A7D73] mt-0.5">
                    s={data.diagnostics.silhouettes[i].toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Deep Dive into Selected Cluster */}
      <div className="border border-[#EAE3D6] bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EAE3D6] gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: CHART_COLORS[selectedCluster % CHART_COLORS.length] }}
            />
            <div>
              <h2 className="text-xl font-bold text-[#231C18] flex items-center gap-2">
                {activeProfile.name}
                <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#73675E] border border-[#EAE3D6]">
                  Cluster {activeProfile.cluster}
                </span>
              </h2>
              <p className="text-xs text-[#73675E] mt-0.5">
                {activeProfile.size} respondents • {((activeProfile.size / 205) * 100).toFixed(1)}% of analysed sample
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data.profiles.map((p) => (
              <button
                key={p.cluster}
                onClick={() => setSelectedCluster(p.cluster)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedCluster === p.cluster
                    ? "bg-[#722F37] text-white font-semibold shadow-sm"
                    : "bg-[#FAF7F2] text-[#73675E] hover:bg-[#EFE8DD] border border-[#EAE3D6]"
                }`}
              >
                Cluster {p.cluster}
              </button>
            ))}
          </div>
        </div>

        {/* Breakdown Charts for Selected Cluster */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6]">
            <h4 className="text-xs font-semibold text-[#231C18] mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#722F37]" /> Platform Distribution
            </h4>
            <FreqBarChart
              data={activeProfile.platformDist}
              valueKey="percent"
              horizontal={true}
              height={160}
              colorIndex={selectedCluster}
            />
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6]">
            <h4 className="text-xs font-semibold text-[#231C18] mb-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#B8533B]" /> Occupation Breakdown
            </h4>
            <FreqBarChart
              data={activeProfile.occupationDist}
              valueKey="percent"
              horizontal={true}
              height={160}
              colorIndex={(selectedCluster + 1) % CHART_COLORS.length}
            />
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6]">
            <h4 className="text-xs font-semibold text-[#231C18] mb-3 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#4E6853]" /> Gamer Identity Profile
            </h4>
            <FreqBarChart
              data={activeProfile.gamerTypeDist}
              valueKey="percent"
              horizontal={true}
              height={160}
              colorIndex={(selectedCluster + 2) % CHART_COLORS.length}
            />
          </div>
        </div>

        {/* Feature Means Table for Selected Cluster */}
        <div className="mt-6 pt-6 border-t border-[#EAE3D6]">
          <h4 className="text-xs font-semibold text-[#231C18] mb-3">Feature Means Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(activeProfile.means).map(([feat, val]) => (
              <div key={feat} className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6]">
                <span className="text-[11px] text-[#73675E] block truncate" title={feat}>
                  {feat.replace("Feat: ", "")}
                </span>
                <span className="text-base font-bold text-[#231C18] mt-1 block">
                  {val !== null ? val.toFixed(2) : "—"}
                  <span className="text-[10px] text-[#8A7D73] font-normal ml-1">/ 5.0</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hours Summary Table */}
      {data.hoursByCluster && data.hoursByCluster.length > 0 && (
        <div className="border border-[#EAE3D6] bg-white rounded-xl p-6 shadow-sm">
          <SectionHeading
            title="Weekly Gaming Hours by Cluster"
            subtitle="Descriptive distribution of estimated weekly playtime across clusters"
          />
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EAE3D6] text-[#73675E] bg-[#FAF7F2]">
                  <th className="py-2.5 px-3">Cluster</th>
                  <th className="py-2.5 px-3">Cluster Label</th>
                  <th className="py-2.5 px-3 text-right">Mean Weekly Hours</th>
                  <th className="py-2.5 px-3 text-right">Median</th>
                  <th className="py-2.5 px-3 text-right">Min</th>
                  <th className="py-2.5 px-3 text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E9DF] text-[#382F2A]">
                {data.hoursByCluster.map((h) => (
                  <tr key={h.cluster} className="hover:bg-[#FAF7F2]">
                    <td className="py-3 px-3 font-mono text-[#722F37] font-semibold">Cluster {h.cluster}</td>
                    <td className="py-3 px-3 font-medium text-[#231C18]">{h.name}</td>
                    <td className="py-3 px-3 text-right font-bold text-[#722F37]">{h.mean?.toFixed(1) ?? "—"} hrs</td>
                    <td className="py-3 px-3 text-right text-[#73675E]">{h.median?.toFixed(1) ?? "—"} hrs</td>
                    <td className="py-3 px-3 text-right text-[#8A7D73]">{h.min?.toFixed(1) ?? "—"} hrs</td>
                    <td className="py-3 px-3 text-right text-[#8A7D73]">{h.max?.toFixed(1) ?? "—"} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Methodological Notes & Caveats */}
      <CaveatBox title="Clustering Methodology & Limitations">
        <ul className="list-disc list-inside space-y-1 text-xs text-[#5C5248]">
          {data.notes.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
          <li>
            Features were pre-standardized using StandardScaler prior to K-Means fitting to prevent attributes with larger native scales from dominating Euclidean distances.
          </li>
        </ul>
      </CaveatBox>
    </div>
  );
}
