"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { HypothesisData, HypothesisTest } from "@/src/types/data";
import { SectionHeading, CaveatBox } from "@/src/components/ui/Cards";

const TEST_DESCRIPTIONS: Record<number, { nullH: string; altH: string; interpretation: string; limitation: string }> = {
  1: {
    nullH: "First gaming platform and current gaming platform are independent.",
    altH: "There is an association between first and current gaming platform.",
    interpretation: "Strong evidence of association (Cramér's V = 0.30, medium effect). Respondents who started on a platform are more likely to still use it or a related platform, though many have migrated. Causal inference is not possible from this data.",
    limitation: "Sparse cells; Monte Carlo p-value used. Association does not imply that platform choice causes future platform choice.",
  },
  2: {
    nullH: "Current gaming platform and future platform preference are independent.",
    altH: "There is an association between current and future platform preference.",
    interpretation: "Moderate evidence of association (Cramér's V = 0.27). Current PC users are more likely to plan staying on PC; mobile users show more varied future intentions. Cloud and AI-driven destination groups are very small.",
    limitation: "Future platform categories Cloud Gaming (n=5) and AI-driven (n=4) are too sparse for reliable inference.",
  },
  3: {
    nullH: "Current gaming platform and monthly spending category are independent.",
    altH: "Spending category differs across current platforms.",
    interpretation: "Strong evidence (Cramér's V = 0.30). Mobile users are concentrated in the ₹0 spending tier, while PC users show wider spend distribution. Practical effect is moderate.",
    limitation: "Spending is self-reported and may not capture all forms of gaming expenditure.",
  },
  4: {
    nullH: "Current gaming platform and gender category are independent.",
    altH: "There is an association between current platform and gender.",
    interpretation: "Not significant after Holm correction. While some platform-gender patterns exist descriptively (e.g., more females on mobile), the association does not survive multiple-comparison correction.",
    limitation: "Small gender subgroups; Prefer not to say has only 2 respondents. Results are exploratory.",
  },
  5: {
    nullH: "Current gaming platform and occupation are independent.",
    altH: "Occupation is associated with current gaming platform.",
    interpretation: "Significant after Holm correction (Cramér's V = 0.21, small-moderate effect). Students are more represented on PC; working professionals show slightly different platform distributions.",
    limitation: "Occupation categories are broad; within-group variation is not captured.",
  },
  6: {
    nullH: "Estimated weekly gaming hours are not associated with spending category.",
    altH: "Higher estimated weekly hours are associated with higher spending.",
    interpretation: "Significant positive association (Spearman ρ = 0.26). Respondents who game more tend to spend more, but the relationship is modest and may reflect shared unmeasured factors.",
    limitation: "Weekly hours are derived estimates. Spending is self-reported. Correlation does not imply causation.",
  },
  7: {
    nullH: "Technology openness and cloud gaming interest are not associated.",
    altH: "Technology openness is positively associated with cloud gaming interest.",
    interpretation: "Strong positive association (Spearman ρ = 0.48). The largest effect size among all tests. Respondents more open to new technology tend to be more interested in cloud gaming's future.",
    limitation: "Both variables are self-reported scales; social desirability bias may inflate the correlation.",
  },
  8: {
    nullH: "Estimated weekly gaming hours do not differ across current platforms.",
    altH: "Gaming hours differ across at least one platform pair.",
    interpretation: "Significant (H = 15.5, Holm-p = 0.008). Effect size (ε²≈0.06) is small. Post-hoc comparisons not included; further analysis with larger samples is needed.",
    limitation: "Weekly hours are derived. Small platform subgroups (Other n=6) reduce reliability.",
  },
  9: {
    nullH: "Estimated weekly gaming hours do not differ across occupations.",
    altH: "Gaming hours differ by occupation.",
    interpretation: "Significant (H = 15.4, Holm-p = 0.004). Students appear to game more hours than working professionals on average, though effect size is small.",
    limitation: "Only 3 occupation categories; 'Other' is heterogeneous.",
  },
  10: {
    nullH: "Estimated weekly gaming hours do not differ across gender categories.",
    altH: "Gaming hours differ by gender.",
    interpretation: "Not significant after Holm correction (p ≈ 0.47). Gender is not meaningfully associated with gaming hours in this sample.",
    limitation: "Small 'Other' and 'Prefer not to say' groups; results may change with larger samples.",
  },
  11: {
    nullH: "Technology openness does not differ between cloud gaming users and non-users.",
    altH: "Cloud gaming users have higher technology openness.",
    interpretation: "Significant (Mann–Whitney U = 5,165.5, Holm-p = 0.006). Cloud gaming users report higher technology openness, though the difference is modest.",
    limitation: "Self-selection; cloud gaming users may inherently be early tech adopters.",
  },
  12: {
    nullH: "Willingness to improve skills does not differ between competitive and casual gamers.",
    altH: "Competitive gamers report higher willingness to improve skills.",
    interpretation: "Significant (Mann–Whitney U = 2,514.5, Holm-p < 0.001). Competitive gamers report significantly higher willingness to practice and improve. Large effect size.",
    limitation: "Self-identification into gamer types is subjective.",
  },
  13: {
    nullH: "Technology openness and importance of graphics are not associated.",
    altH: "Technology openness is positively associated with importance of graphics.",
    interpretation: "Significant (Spearman ρ = 0.22, Holm-p = 0.012). Modest positive correlation: respondents who value graphics highly also tend to be somewhat more open to new technology.",
    limitation: "Correlation is weak-to-moderate; many factors other than graphics drive tech adoption.",
  },
};

function EffectSizeBadge({ value, measure }: { value: number | null; measure: string }) {
  if (value === null) return <span className="text-[#8A7D73] text-xs">—</span>;
  const abs = Math.abs(value);
  let level = "negligible";
  let color = "text-[#73675E] bg-[#FAF7F2] border-[#EAE3D6]";
  if (abs >= 0.5) {
    level = "large";
    color = "text-[#722F37] bg-[#F8EDEF] border-[#E8CDD3]";
  } else if (abs >= 0.3) {
    level = "medium";
    color = "text-[#B8533B] bg-[#FBF5F2] border-[#EED9D2]";
  } else if (abs >= 0.1) {
    level = "small";
    color = "text-[#4E6853] bg-[#F4F7F4] border-[#D6E2D8]";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border ${color}`}>
      <span>{measure}:</span>
      <span className="font-bold">{value.toFixed(2)}</span>
      <span className="text-[9px] opacity-75">({level})</span>
    </span>
  );
}

function TestRow({ test, index }: { test: HypothesisTest; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const desc = TEST_DESCRIPTIONS[test.id];

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer hover:bg-[#FAF7F2] transition-colors border-b border-[#F0E9DF]"
      >
        <td className="w-8 text-center text-[#73675E]">
          {expanded ? <ChevronDown size={14} className="text-[#722F37]" /> : <ChevronRight size={14} />}
        </td>
        <td className="font-mono text-xs text-[#722F37] font-semibold">T{test.id}</td>
        <td>
          <div className="font-semibold text-xs text-[#231C18]">{test.researchQuestion}</div>
          <div className="text-[11px] text-[#73675E]">{test.test} · n = {test.n}</div>
        </td>
        <td className="text-[#73675E] text-xs font-mono tabular-nums">{test.statistic?.toFixed(3) ?? "—"}</td>
        <td className="text-[#73675E] text-xs font-mono tabular-nums">{test.rawPValue}</td>
        <td>
          <span className={`text-xs font-mono font-bold tabular-nums ${test.holmAdjustedPValue === "<0.001" || (typeof test.holmAdjustedPValue === "number" && (test.holmAdjustedPValue as unknown as number) < 0.05) ? "text-[#722F37]" : "text-[#73675E]"}`}>
            {test.holmAdjustedPValue}
          </span>
        </td>
        <td><EffectSizeBadge value={test.effectSize} measure={test.effectSizeMeasure} /></td>
        <td>
          {test.significant
            ? <span className="flex items-center gap-1 text-[#4E6853] text-xs font-semibold"><CheckCircle size={13} /> Significant</span>
            : <span className="flex items-center gap-1 text-[#8A7D73] text-xs"><XCircle size={13} /> Not Sig.</span>}
        </td>
      </tr>
      {expanded && desc && (
        <tr>
          <td colSpan={8} className="py-0 px-0">
            <div className="mx-2 my-2 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] p-4 text-xs space-y-3 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-[#73675E] uppercase tracking-wider text-[10px] font-semibold mb-1">Null Hypothesis (H₀)</div>
                  <div className="text-[#382F2A] font-medium">{desc.nullH}</div>
                </div>
                <div>
                  <div className="text-[#73675E] uppercase tracking-wider text-[10px] font-semibold mb-1">Alternative Hypothesis (H₁)</div>
                  <div className="text-[#382F2A] font-medium">{desc.altH}</div>
                </div>
              </div>
              <div>
                <div className="text-[#73675E] uppercase tracking-wider text-[10px] font-semibold mb-1">Interpretation</div>
                <div className="text-[#231C18] leading-relaxed">{desc.interpretation}</div>
              </div>
              <div>
                <div className="text-[#73675E] uppercase tracking-wider text-[10px] font-semibold mb-1">Validation Note</div>
                <div className="text-[#554A43] leading-relaxed">{test.validationNote}</div>
              </div>
              <div>
                <div className="text-[#8C5E28] uppercase tracking-wider text-[10px] font-semibold mb-1">Methodological Limitation</div>
                <div className="text-[#8C5E28] leading-relaxed">{desc.limitation}</div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function HypothesisClient({ data }: { data: HypothesisData }) {
  const [filter, setFilter] = useState<"all" | "significant" | "not-significant">("all");

  const filtered = data.tests.filter(t => {
    if (filter === "significant") return t.significant;
    if (filter === "not-significant") return !t.significant;
    return true;
  });

  const sigCount = data.tests.filter(t => t.significant).length;

  return (
    <div className="space-y-6 pb-16 md:pb-0 animate-fade-in">
      <SectionHeading
        title="Statistical Hypothesis Testing"
        description="13 tests with Holm step-down family-wise error rate correction. Source: GameMetrics_Statistical_Validation.xlsx"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card bg-white border border-[#EAE3D6] p-4 shadow-sm">
          <div className="text-2xl font-extrabold text-[#722F37]">{data.tests.length}</div>
          <div className="text-xs text-[#73675E] mt-1 font-medium">Total formal tests</div>
        </div>
        <div className="card bg-white border border-[#EAE3D6] p-4 shadow-sm">
          <div className="text-2xl font-extrabold text-[#4E6853]">{sigCount}</div>
          <div className="text-xs text-[#73675E] mt-1 font-medium">Significant (Holm α=0.05)</div>
        </div>
        <div className="card bg-white border border-[#EAE3D6] p-4 shadow-sm">
          <div className="text-2xl font-extrabold text-[#8A7D73]">{data.tests.length - sigCount}</div>
          <div className="text-xs text-[#73675E] mt-1 font-medium">Not significant</div>
        </div>
        <div className="card bg-white border border-[#EAE3D6] p-4 shadow-sm">
          <div className="text-2xl font-extrabold text-[#C28B54]">{data.sparseChecks.length}</div>
          <div className="text-xs text-[#73675E] mt-1 font-medium">Monte Carlo validated</div>
        </div>
      </div>

      <CaveatBox items={data.caveats} />

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "significant", "not-significant"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? "bg-[#722F37] text-white font-semibold shadow-sm"
                : "bg-white text-[#73675E] border border-[#DDD3C3] hover:bg-[#FAF7F2]"
            }`}
          >
            {f === "all" ? "All tests (13)" : f === "significant" ? `Significant (${sigCount})` : `Not significant (${data.tests.length - sigCount})`}
          </button>
        ))}
      </div>

      {/* Test Table */}
      <div className="card bg-white border border-[#EAE3D6] overflow-x-auto shadow-sm">
        <div className="text-xs text-[#73675E] mb-3">
          Click any test row to expand full details (Null/Alt hypotheses, plain-English interpretation, Monte Carlo checks, and limitations).
        </div>
        <table className="data-table w-full">
          <thead>
            <tr>
              <th className="w-8"></th>
              <th>Test</th>
              <th>Research Question & Method</th>
              <th>Statistic</th>
              <th>Raw p</th>
              <th>Holm p</th>
              <th>Effect Size</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((test, i) => (
              <TestRow key={test.id} test={test} index={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Sparse contingency tables check */}
      <SectionHeading
        title="Sparse Table Robustness Checks (Monte Carlo Permutation)"
        description="For contingency tables with >20% cells having expected counts < 5, asymptotic Chi-Square p-values are untrustworthy. Monte Carlo permutation (20,000 simulations) confirms whether significance holds."
      />

      <div className="card bg-white border border-[#EAE3D6] overflow-x-auto shadow-sm">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th>Research Question</th>
              <th>n</th>
              <th>Chi-Sq</th>
              <th>df</th>
              <th>Asymptotic p</th>
              <th>Monte Carlo p</th>
              <th>Cramér&apos;s V</th>
              <th>Cells &lt; 5</th>
            </tr>
          </thead>
          <tbody>
            {data.sparseChecks.map((sc, i) => (
              <tr key={i}>
                <td className="font-medium text-xs text-[#231C18]">{sc.researchQuestion}</td>
                <td className="font-mono text-xs text-[#73675E]">{sc.n}</td>
                <td className="font-mono text-xs text-[#73675E]">{sc.chiSqStat?.toFixed(2) ?? "—"}</td>
                <td className="font-mono text-xs text-[#73675E]">{sc.df ?? "—"}</td>
                <td className="font-mono text-xs text-[#73675E]">{sc.asymptoticP ?? "—"}</td>
                <td className="font-mono text-xs font-bold text-[#722F37]">{sc.monteCarloP ?? "—"}</td>
                <td className="font-mono text-xs text-[#73675E]">{sc.cramersV?.toFixed(3) ?? "—"}</td>
                <td className="font-mono text-xs text-[#B8533B] font-semibold">{sc.expectedCellsUnder5 ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
