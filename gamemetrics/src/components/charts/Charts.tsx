"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, LabelList
} from "recharts";
import { FreqItem, HoursItem } from "@/src/types/data";

// Wine Red and Light Sand harmonic colour palette
export const CHART_COLORS = [
  "#722F37", // Wine Red (Primary)
  "#B8533B", // Warm Terracotta
  "#4A1521", // Deep Burgundy
  "#C28B54", // Desert Sand Ochre
  "#536B59", // Muted Sage Olive
  "#425268", // Slate Blue
  "#9B4D60", // Dusty Rose
  "#7D553D", // Warm Umber
  "#8A7458", // Sandstone Taupe
  "#3B5243", // Forest Sage
];

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

// ============================================================
// Vertical / Horizontal Bar Chart
// ============================================================
interface FreqBarProps {
  data: FreqItem[];
  valueKey?: "count" | "percent";
  height?: number;
  horizontal?: boolean;
  colorIndex?: number;
}

export function FreqBarChart({
  data,
  valueKey = "count",
  height = 220,
  horizontal = false,
  colorIndex = 0,
}: FreqBarProps) {
  if (!data || data.length === 0) return <div className="text-[#8A7D73] text-xs text-center py-8">No data available</div>;

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(height, data.length * 32)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 8 }}>
          <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false}
            tickFormatter={valueKey === "percent" ? (v) => `${v}%` : undefined} />
          <YAxis type="category" dataKey="category" tick={AXIS_STYLE} tickLine={false}
            axisLine={false} width={110} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v: any) => valueKey === "percent" ? [`${v}%`, "Percent"] : [v, "Count"]}
          />
          <Bar dataKey={valueKey} radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[(colorIndex + i) % CHART_COLORS.length]} />
            ))}
            <LabelList dataKey={valueKey} position="right" style={{ fill: "#73675E", fontSize: 10 }}
              formatter={(v: any) => valueKey === "percent" ? `${v}%` : v} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 40, left: 8 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="category" tick={{ ...AXIS_STYLE, fontSize: 10 }} tickLine={false}
          axisLine={false} angle={-30} textAnchor="end" interval={0} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false}
          tickFormatter={valueKey === "percent" ? (v) => `${v}%` : undefined} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: any) => valueKey === "percent" ? [`${v}%`, "Percent"] : [v, "Count"]}
        />
        <Bar dataKey={valueKey} radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[(colorIndex + i) % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// Donut / Pie Chart
// ============================================================
interface DonutProps {
  data: FreqItem[];
  height?: number;
  showLegend?: boolean;
}

export function DonutChart({ data, height = 220, showLegend = true }: DonutProps) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
        <Pie
          data={data}
          dataKey="count"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: any, name: any, props: any) => [
            `${v} (${props?.payload?.percent}%)`,
            props?.payload?.category,
          ]}
        />
        {showLegend && (
          <Legend
            formatter={(value) => <span style={{ color: "#73675E", fontSize: 11 }}>{value}</span>}
            iconSize={8}
            iconType="circle"
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// Hours Distribution Chart
// ============================================================
export function HoursDistChart({ data, height = 200 }: { data: HoursItem[]; height?: number }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 16, left: 8 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="hours" tick={{ ...AXIS_STYLE, fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [v, "Respondents"]} />
        <Bar dataKey="count" fill="#722F37" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// Grouped Bar Chart (for cross-tab / comparison)
// ============================================================
interface GroupedBarItem {
  name: string;
  [key: string]: string | number;
}

interface GroupedBarProps {
  data: GroupedBarItem[];
  keys: string[];
  height?: number;
  layout?: "vertical" | "horizontal";
}

export function GroupedBarChart({ data, keys, height = 280, layout = "horizontal" }: GroupedBarProps) {
  if (!data || data.length === 0) return null;

  if (layout === "vertical") {
    return (
      <ResponsiveContainer width="100%" height={Math.max(height, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 100 }}>
          <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
          <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ ...AXIS_STYLE, fontSize: 10 }} tickLine={false}
            axisLine={false} width={95} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend formatter={(v) => <span style={{ color: "#73675E", fontSize: 10 }}>{v}</span>} iconSize={8} />
          {keys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[0, 3, 3, 0]} stackId="a" />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 40, left: 8 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="name" tick={{ ...AXIS_STYLE, fontSize: 10 }} tickLine={false} axisLine={false}
          angle={-30} textAnchor="end" interval={0} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend formatter={(v) => <span style={{ color: "#73675E", fontSize: 10 }}>{v}</span>} iconSize={8} />
        {keys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// Radar Chart (for cluster profiles)
// ============================================================
interface RadarData {
  feature: string;
  [key: string]: string | number;
}

interface RadarProps {
  data: RadarData[];
  keys: string[];
  height?: number;
}

export function ClusterRadar({ data, keys, height = 300 }: RadarProps) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke={GRID_COLOR} />
        <PolarAngleAxis dataKey="feature" tick={{ fill: "#73675E", fontSize: 10 }} />
        <PolarRadiusAxis tick={{ fill: "#8A7D73", fontSize: 8 }} axisLine={false} />
        {keys.map((key, i) => (
          <Radar
            key={key}
            name={key}
            dataKey={key}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
        <Legend formatter={(v) => <span style={{ color: "#73675E", fontSize: 10 }}>{v}</span>} iconSize={8} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// Line Chart (for diagnostics like silhouette/inertia)
// ============================================================
interface LineData {
  k: number;
  [key: string]: number;
}

export function DiagnosticsLineChart({ data, keys, height = 200 }: { data: LineData[]; keys: string[]; height?: number }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <CartesianGrid stroke={GRID_COLOR} />
        <XAxis dataKey="k" tick={AXIS_STYLE} tickLine={false} axisLine={false}
          label={{ value: "k (clusters)", position: "insideBottom", fill: "#73675E", fontSize: 10, offset: -2 }} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend formatter={(v) => <span style={{ color: "#73675E", fontSize: 10 }}>{v}</span>} iconSize={8} />
        {keys.map((key, i) => (
          <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2} dot={{ fill: CHART_COLORS[i % CHART_COLORS.length], r: 4 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ============================================================
// Cohort Bar Comparison (under 22 vs 22+)
// ============================================================
interface CohortBarItem {
  genre: string;
  under22: number;
  "22plus": number;
}

export function CohortBarChart({ data, height = 280 }: { data: CohortBarItem[]; height?: number }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 60, left: 8 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis dataKey="genre" tick={{ ...AXIS_STYLE, fontSize: 10 }} tickLine={false} axisLine={false}
          angle={-40} textAnchor="end" interval={0} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
        <Tooltip contentStyle={TOOLTIP_STYLE}
          formatter={(v: any, name: any) => [`${v}%`, name === "under22" ? "Under 22" : "22 and over"]} />
        <Legend formatter={(v) => <span style={{ color: "#73675E", fontSize: 10 }}>{v === "under22" ? "Under 22" : "22 and over"}</span>} iconSize={8} />
        <Bar dataKey="under22" fill="#722F37" radius={[3, 3, 0, 0]} />
        <Bar dataKey="22plus" fill="#C28B54" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
