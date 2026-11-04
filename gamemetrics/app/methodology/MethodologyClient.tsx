"use client";
import { BookOpen, ShieldCheck, Database, FileText, CheckCircle2, AlertTriangle, Layers, Cpu } from "lucide-react";
import { MethodologyData } from "@/src/types/data";
import { SectionHeading, CaveatBox, KPICard } from "@/src/components/ui/Cards";

interface MethodologyClientProps {
  data: MethodologyData;
}

export default function MethodologyClient({ data }: MethodologyClientProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#EAE3D6] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8EDEF] border border-[#E8CDD3] text-[#722F37] text-xs font-semibold uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5" /> Research Design & Reproducibility
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#231C18] tracking-tight">
          Methodology, Data Cleaning & Academic Rigour
        </h1>
        <p className="text-[#73675E] text-sm mt-1 max-w-3xl">
          Comprehensive documentation of survey instrument design, sample exclusion criteria, variable derivation, statistical corrections, machine learning pipelines, and methodological limitations.
        </p>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Survey Responses"
          value={data.totalResponses}
          subtitle="Google Forms instrument"
          icon={<Database className="w-5 h-5 text-[#722F37]" />}
          accent="cyan"
        />
        <KPICard
          title="Analytical Sample (N)"
          value={data.analysisRows}
          subtitle="Post-cleaning & validation"
          icon={<CheckCircle2 className="w-5 h-5 text-[#4E6853]" />}
          accent="green"
        />
        <KPICard
          title="Excluded Observations"
          value={data.excludedRows}
          subtitle="Invalid extreme outlier"
          icon={<AlertTriangle className="w-5 h-5 text-[#9E5D20]" />}
          accent="amber"
        />
        <KPICard
          title="Flagged Observations"
          value={data.flaggedRows}
          subtitle="Inconsistent conditional entries"
          icon={<FileText className="w-5 h-5 text-[#B8533B]" />}
          accent="violet"
        />
      </div>

      {/* Data Cleaning & Preprocessing Flow */}
      <div className="border border-[#EAE3D6] bg-white rounded-xl p-6 shadow-sm">
        <SectionHeading
          title="Data Cleaning & Quality Control Protocol"
          subtitle="Systematic audit rules applied to raw survey workbook data"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] space-y-3">
            <h4 className="text-sm font-semibold text-[#231C18] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B8533B]" /> Outlier Exclusion Rule
            </h4>
            <p className="text-xs text-[#554A43] leading-relaxed">
              {data.exclusionReason}
            </p>
            <div className="p-3 rounded-lg bg-white border border-[#EAE3D6] text-[11px] text-[#73675E] font-mono">
              Raw Record: Age = 100 → Tagged invalid; removed from analytical frame to prevent skew in linear & correlation calculations.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] space-y-3">
            <h4 className="text-sm font-semibold text-[#231C18] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8C6D46]" /> Conditional Consistency Flagging
            </h4>
            <p className="text-xs text-[#554A43] leading-relaxed">
              {data.flaggingReason}
            </p>
            <div className="p-3 rounded-lg bg-white border border-[#EAE3D6] text-[11px] text-[#73675E] font-mono">
              Check: Respondents answering "No" to platform switching but supplying reasons for switching had reasons set to "Not Applicable".
            </div>
          </div>
        </div>
      </div>

      {/* Missingness Analysis */}
      {data.missingness && data.missingness.length > 0 && (
        <div className="border border-[#EAE3D6] bg-white rounded-xl p-6 shadow-sm">
          <SectionHeading
            title="Missing Data Audit"
            subtitle="Identification of missing or conditionally skipped fields across 205 observations"
          />
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#EAE3D6] text-[#73675E] bg-[#FAF7F2]">
                  <th className="py-2.5 px-3">Column / Variable Name</th>
                  <th className="py-2.5 px-3 text-right">Missing Count</th>
                  <th className="py-2.5 px-3 text-right">Missing %</th>
                  <th className="py-2.5 px-3">Handling Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E9DF] text-[#382F2A]">
                {data.missingness.map((m, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF7F2]">
                    <td className="py-3 px-3 font-mono text-[#231C18] font-medium">{m.column}</td>
                    <td className="py-3 px-3 text-right font-mono text-[#B8533B] font-semibold">{m.missingCount}</td>
                    <td className="py-3 px-3 text-right font-mono text-[#73675E]">{m.missingPercent.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-[#554A43]">Conditional question; imputed as 'Not Applicable' / non-switcher category.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Derived Variables */}
      <div className="border border-[#EAE3D6] bg-white rounded-xl p-6 shadow-sm">
        <SectionHeading
          title="Operationalization & Derived Variables"
          subtitle="Formulas and statistical rationale for synthetic constructs created during feature engineering"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {data.derivedVariables.map((dv, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6]">
              <h4 className="text-sm font-bold text-[#722F37] mb-1">{dv.name}</h4>
              <div className="p-2.5 rounded-lg bg-white border border-[#EAE3D6] font-mono text-xs text-[#4E6853] my-2">
                {dv.formula}
              </div>
              <p className="text-xs text-[#554A43] leading-relaxed">{dv.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tripartite Analytical Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Statistical Methods */}
        <div className="p-5 rounded-xl border border-[#EAE3D6] bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#722F37] text-sm font-bold mb-3">
              <FileText className="w-4 h-4" /> Statistical Testing
            </div>
            <ul className="space-y-2 text-xs text-[#554A43]">
              {data.statisticalMethods.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#722F37] font-bold">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-[#EAE3D6] text-[11px] text-[#73675E] font-mono">
            Holm-Bonferroni FWER Control (α=0.05)
          </div>
        </div>

        {/* Machine Learning Methods */}
        <div className="p-5 rounded-xl border border-[#EAE3D6] bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#B8533B] text-sm font-bold mb-3">
              <Cpu className="w-4 h-4" /> Supervised ML Pipeline
            </div>
            <ul className="space-y-2 text-xs text-[#554A43]">
              {data.mlMethods.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#B8533B] font-bold">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-[#EAE3D6] text-[11px] text-[#73675E] font-mono">
            Leakage-free Scikit-learn Pipeline
          </div>
        </div>

        {/* Unsupervised Clustering */}
        <div className="p-5 rounded-xl border border-[#EAE3D6] bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#4E6853] text-sm font-bold mb-3">
              <Layers className="w-4 h-4" /> Unsupervised Clustering
            </div>
            <ul className="space-y-2 text-xs text-[#554A43]">
              {data.clusteringMethods.map((m, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#4E6853] font-bold">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-[#EAE3D6] text-[11px] text-[#73675E] font-mono">
            StandardScaler + Euclidean K-Means
          </div>
        </div>
      </div>

      {/* Ethical & Privacy Standards */}
      <div className="border border-[#EAE3D6] bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 text-base font-bold text-[#231C18] mb-2">
          <ShieldCheck className="w-5 h-5 text-[#4E6853]" /> Privacy, Anonymity & Data Ethics
        </div>
        <p className="text-xs text-[#554A43] leading-relaxed">
          {data.privacyStatement}
        </p>
      </div>

      {/* Formal Limitations & Threats to Validity */}
      <CaveatBox title="Methodological Limitations & Threats to Validity">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#5C5248] list-disc list-inside">
          {data.limitations.map((lim, idx) => (
            <li key={idx} className="leading-relaxed">{lim}</li>
          ))}
        </ul>
      </CaveatBox>
    </div>
  );
}
