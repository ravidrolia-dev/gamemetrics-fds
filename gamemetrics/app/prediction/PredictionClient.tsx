"use client";
import { useState } from "react";
import { Brain, AlertTriangle, CheckCircle, Info, Download, Cpu, Monitor, Gamepad2, Smartphone, Cloud, ArrowRight } from "lucide-react";
import { PredictionData, ModelResult } from "@/src/types/data";
import { ChartCard, SectionHeading, CaveatBox } from "@/src/components/ui/Cards";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import trainedInference from "@/src/data/generated/trained_model_inference.json";

const TOOLTIP_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2D9CD",
  borderRadius: "8px",
  color: "#231C18",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(43, 35, 31, 0.08)"
};
const AXIS_STYLE = { fill: "#73675E", fontSize: 11 };
const GRID_COLOR = "#ECE5DA";

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[#73675E]">{label}</span>
        <span className="font-semibold" style={{ color }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="progress-bar bg-[#EAE3D6]">
        <div className="progress-bar-fill" style={{ width: `${value * 100}%`, background: color }} />
      </div>
    </div>
  );
}

function ConfusionMatrix({ matrix, modelName }: { matrix: number[][]; modelName: string }) {
  const labels = ["No Switch (0)", "Plans Switch (1)"];
  const maxVal = Math.max(...matrix.flat());
  return (
    <div className="space-y-2">
      <div className="text-xs text-[#73675E] mb-2 font-medium">
        Rows = Actual, Columns = Predicted
      </div>
      <div className="grid grid-cols-2 gap-1.5 max-w-[240px]">
        {matrix.map((row, ri) =>
          row.map((v, ci) => {
            const isDiagonal = ri === ci;
            const intensity = maxVal > 0 ? v / maxVal : 0;
            return (
              <div
                key={`${ri}-${ci}`}
                className="aspect-square rounded-lg flex flex-col items-center justify-center"
                style={{
                  background: isDiagonal
                    ? `rgba(114, 47, 55, ${0.08 + intensity * 0.35})`
                    : `rgba(184, 83, 59, ${0.06 + intensity * 0.25})`,
                  border: `1px solid ${isDiagonal ? "rgba(114,47,55,0.3)" : "rgba(184,83,59,0.25)"}`,
                }}
              >
                <span className="text-lg font-bold" style={{ color: isDiagonal ? "#722F37" : v > 0 ? "#B8533B" : "#8A7D73" }}>
                  {v}
                </span>
                <span className="text-[9px] text-[#73675E]">{labels[ri][0]}→{labels[ci][0]}</span>
              </div>
            );
          })
        )}
      </div>
      <div className="text-[10px] text-[#73675E] space-y-0.5">
        <div><span className="text-[#722F37] font-bold">■</span> Correct predictions (diagonal)</div>
        <div><span className="text-[#B8533B] font-bold">■</span> Misclassifications (off-diagonal)</div>
      </div>
    </div>
  );
}

function ModelCard({ model, isBest }: { model: ModelResult; isBest: boolean }) {
  const [tab, setTab] = useState<"metrics" | "matrix">("metrics");
  return (
    <div className={`card ${isBest ? "border-[#E8CDD3] bg-[#FAF5F6]" : "bg-white border-[#EAE3D6]"}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#231C18] text-sm">{model.name}</span>
            {isBest && (
              <span className="text-[10px] font-semibold bg-[#F8EDEF] text-[#722F37] px-2.5 py-0.5 rounded-full border border-[#E8CDD3]">
                Best Macro F1
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#73675E] mt-0.5">
            5-Fold CV Macro F1: {(model.cvMacroF1Mean * 100).toFixed(1)}% (±{(model.cvMacroF1Std * 100).toFixed(1)}%)
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[#EAE3D6] pb-2 mb-3">
        <button
          onClick={() => setTab("metrics")}
          className={`text-xs px-2.5 py-1 rounded transition-colors ${tab === "metrics" ? "bg-[#F8EDEF] text-[#722F37] font-semibold border border-[#E8CDD3]" : "text-[#73675E] hover:text-[#231C18]"}`}
        >
          Test Metrics
        </button>
        <button
          onClick={() => setTab("matrix")}
          className={`text-xs px-2.5 py-1 rounded transition-colors ${tab === "matrix" ? "bg-[#F8EDEF] text-[#722F37] font-semibold border border-[#E8CDD3]" : "text-[#73675E] hover:text-[#231C18]"}`}
        >
          Confusion Matrix
        </button>
      </div>

      {tab === "metrics" ? (
        <div className="space-y-2.5">
          <MetricBar label="Accuracy" value={model.accuracy} color="#722F37" />
          <MetricBar label="Precision (Class 1)" value={model.precision} color="#B8533B" />
          <MetricBar label="Recall (Class 1)" value={model.recall} color="#4E6853" />
          <MetricBar label="Macro F1" value={model.macroF1} color="#C28B54" />
          <div className="pt-2 border-t border-[#EAE3D6]">
            <div className="text-[11px] text-[#73675E] flex justify-between">
              <span>Class 0 F1: {(model.perClassMetrics["0"].f1 * 100).toFixed(1)}%</span>
              <span>Class 1 F1: {(model.perClassMetrics["1"].f1 * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <ConfusionMatrix matrix={model.confusionMatrix} modelName={model.name} />
          <div>
            <div className="text-xs text-[#73675E] mb-2 uppercase tracking-wider font-semibold">Per-Class Metrics</div>
            <table className="data-table w-full text-xs">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1</th>
                  <th>Support</th>
                </tr>
              </thead>
              <tbody>
                {(["0", "1"] as const).map(cls => {
                  const m = model.perClassMetrics[cls];
                  return (
                    <tr key={cls}>
                      <td className="font-medium text-[#231C18]">{cls === "0" ? "No Switch" : "Plans Switch"}</td>
                      <td className="tabular-nums font-mono text-[#722F37]">{(m.precision * 100).toFixed(1)}%</td>
                      <td className="tabular-nums font-mono text-[#73675E]">{(m.recall * 100).toFixed(1)}%</td>
                      <td className="tabular-nums font-mono text-[#73675E]">{(m.f1 * 100).toFixed(1)}%</td>
                      <td className="tabular-nums font-mono text-[#73675E]">{m.support}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function getPlatformIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("pc")) return <Monitor className="w-4 h-4 text-[#722F37]" />;
  if (p.includes("console")) return <Gamepad2 className="w-4 h-4 text-[#8C6D46]" />;
  if (p.includes("mobile")) return <Smartphone className="w-4 h-4 text-[#4E6853]" />;
  return <Cloud className="w-4 h-4 text-[#2B5B84]" />;
}

function getPlatformBadgeColor(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("pc")) return "bg-[#F8EDEF] text-[#722F37] border-[#E8CDD3]";
  if (p.includes("console")) return "bg-[#FAF3EB] text-[#8C6D46] border-[#E8DFD4]";
  if (p.includes("mobile")) return "bg-[#EEF4EF] text-[#4E6853] border-[#D3E2D5]";
  return "bg-[#EDF3F8] text-[#2B5B84] border-[#D0E0EC]";
}

function getPlatformBarColor(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("pc")) return "#722F37";
  if (p.includes("console")) return "#8C6D46";
  if (p.includes("mobile")) return "#4E6853";
  return "#2B5B84";
}

// Exact Mathematical Scikit-Learn Model Inference Component
function ScikitLearnPredictor({ data }: { data: PredictionData }) {
  const [formState, setFormState] = useState<Record<string, string>>({
    "Current Platform": "PC",
    "First Platform": "Mobile",
    "Experience Level": "Intermediate",
    "Gaming Frequency": "Daily",
    "Cloud Gaming Used": "No",
    "AI Features Used": "No",
    "Gender": "Male",
    "Occupation": "Student",
    "Gamer Type": "Competitive gamer",
    "Main Reason": "Competition",
    "Age": "21",
    "Years Gaming": "8",
    "Weekday Hours": "3",
    "Weekend Hours": "5",
    "Gaming Importance": "4",
    "Willingness to Improve": "4",
    "Tech Openness": "4",
    "Cloud Interest": "3",
  });

  const [result, setResult] = useState<null | {
    label: string;
    probability: number;
    logOdds: number;
    isSwitch: boolean;
    topDestination: string;
    destinationProbabilities: { platform: string; probability: number }[];
  }>(null);

  const predict = () => {
    let z = trainedInference.intercept;

    const numScales = trainedInference.scalerScales;
    const numMeans = trainedInference.scalerMeans;
    const numWeights = trainedInference.numericWeights;

    const numInputs: Record<string, number> = {
      age: parseFloat(formState["Age"] || "21"),
      years_gaming: parseFloat(formState["Years Gaming"] || "8"),
      weekday_hours: parseFloat(formState["Weekday Hours"] || "3"),
      weekend_hours: parseFloat(formState["Weekend Hours"] || "5"),
      gaming_importance: parseFloat(formState["Gaming Importance"] || "4"),
      willingness_to_improve: parseFloat(formState["Willingness to Improve"] || "4"),
      cloud_interest: parseFloat(formState["Cloud Interest"] || "3"),
      tech_openness: parseFloat(formState["Tech Openness"] || "4"),
    };

    for (const [key, val] of Object.entries(numInputs)) {
      const mean = (numMeans as Record<string, number>)[key] ?? 0;
      const scale = (numScales as Record<string, number>)[key] ?? 1;
      const weight = (numWeights as Record<string, number>)[key] ?? 0;
      const standardized = (val - mean) / scale;
      z += weight * standardized;
    }

    const catWeights = trainedInference.categoricalWeights as Record<string, Record<string, number>>;
    const catInputs: Record<string, string> = {
      gender: formState["Gender"],
      occupation: formState["Occupation"],
      first_platform: formState["First Platform"],
      current_platform: formState["Current Platform"],
      experience_level: formState["Experience Level"],
      gaming_frequency: formState["Gaming Frequency"],
      gamer_type: formState["Gamer Type"],
      cloud_gaming_used: formState["Cloud Gaming Used"],
      ai_features_used: formState["AI Features Used"],
    };

    for (const [catName, selectedVal] of Object.entries(catInputs)) {
      if (catWeights[catName] && catWeights[catName][selectedVal] !== undefined) {
        z += catWeights[catName][selectedVal];
      }
    }

    const prob = 1 / (1 + Math.exp(-z));
    const isSwitch = prob >= 0.5;

    // Stage 2: Destination Platform Softmax (Multi-class)
    let destinationProbabilities: { platform: string; probability: number }[] = [];
    let topDestination = "PC";

    const destModel = (trainedInference as any).destinationModel;
    if (destModel && destModel.classes) {
      const destClasses = destModel.classes as string[];
      const destIntercepts = destModel.intercepts as Record<string, number>;
      const destScales = destModel.scalerScales as Record<string, number>;
      const destMeans = destModel.scalerMeans as Record<string, number>;
      const destNumWeights = destModel.numericWeights as Record<string, Record<string, number>>;
      const destCatWeights = destModel.categoricalWeights as Record<string, Record<string, Record<string, number>>>;

      const scores: Record<string, number> = {};
      let maxScore = -Infinity;

      for (const cls of destClasses) {
        let zCls = destIntercepts[cls] ?? 0;
        for (const [key, val] of Object.entries(numInputs)) {
          const mean = destMeans[key] ?? 0;
          const scale = destScales[key] ?? 1;
          const weight = destNumWeights[cls]?.[key] ?? 0;
          zCls += weight * ((val - mean) / scale);
        }
        for (const [catName, selectedVal] of Object.entries(catInputs)) {
          const weight = destCatWeights[cls]?.[catName]?.[selectedVal] ?? 0;
          zCls += weight;
        }
        scores[cls] = zCls;
        if (zCls > maxScore) maxScore = zCls;
      }

      let sumExp = 0;
      const expScores: Record<string, number> = {};
      for (const cls of destClasses) {
        const expVal = Math.exp(scores[cls] - maxScore);
        expScores[cls] = expVal;
        sumExp += expVal;
      }

      destinationProbabilities = destClasses.map((cls) => ({
        platform: cls,
        probability: sumExp > 0 ? expScores[cls] / sumExp : 0,
      })).sort((a, b) => b.probability - a.probability);

      topDestination = destinationProbabilities[0]?.platform || "PC";
    }

    setResult({
      label: isSwitch ? "Plans to Switch Platform (Class 1)" : "No Plans to Switch Platform (Class 0)",
      probability: prob,
      logOdds: z,
      isSwitch,
      topDestination,
      destinationProbabilities,
    });
  };

  const formFields: Record<string, string[]> = {
    "Current Platform": data.formOptions["Current Platform"] || ["PC", "Mobile", "Console", "Other"],
    "First Platform": data.formOptions["First Platform"] || ["Mobile", "Console", "PC", "Other"],
    "Experience Level": data.formOptions["Experience Level"] || ["Beginner", "Intermediate", "Advanced"],
    "Gaming Frequency": data.formOptions["Gaming Frequency"] || ["Daily", "Few times a week", "Weekly", "Occasionally"],
    "Cloud Gaming Used": data.formOptions["Cloud Gaming Used"] || ["Yes", "No"],
    "AI Features Used": data.formOptions["AI Features Used"] || ["Yes", "No"],
    "Gender": data.formOptions["Gender"] || ["Male", "Female", "Prefer not to say"],
    "Occupation": data.formOptions["Occupation"] || ["Student", "Working Professional", "Self-employed", "Other"],
    "Gamer Type": data.formOptions["Gamer Type"] || ["Casual gamer", "Competitive gamer", "Hardcore gamer", "Social gamer"],
  };

  return (
    <div className="card bg-white border border-[#EAE3D6] p-6 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAE3D6] gap-2 mb-4">
        <div>
          <div className="text-base font-bold text-[#231C18] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#722F37]" />
            Live Scikit-Learn Multi-Stage Inference Engine
          </div>
          <p className="text-xs text-[#73675E] mt-0.5">
            Stage 1: Logistic Regression log-odds for switch propensity. Stage 2: Multinomial Softmax predicting destination platform ($N=205$).
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#FAF7F2] text-[#8C6D46] border border-[#E8DFD4] font-medium">
          Stage 1 F1: {(trainedInference.macroF1 * 100).toFixed(1)}% | Stage 2 Accuracy: {(((trainedInference as any).destinationModel?.accuracy || 0.69) * 100).toFixed(1)}%
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {Object.entries(formFields).map(([label, options]) => (
          <div key={label}>
            <label className="text-xs text-[#73675E] font-medium block mb-1">{label}</label>
            <select
              value={formState[label] || options[0]}
              onChange={e => setFormState(prev => ({ ...prev, [label]: e.target.value }))}
              className="w-full bg-white border border-[#DDD3C3] rounded-lg px-2.5 py-2 text-xs text-[#231C18] focus:border-[#722F37]"
            >
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div>
          <label className="text-xs text-[#73675E] font-medium block mb-1">Age</label>
          <input
            type="number" min={14} max={60}
            value={formState["Age"] || "21"}
            onChange={e => setFormState(prev => ({ ...prev, "Age": e.target.value }))}
            className="w-full bg-white border border-[#DDD3C3] rounded-lg px-2.5 py-2 text-xs text-[#231C18] focus:border-[#722F37]"
          />
        </div>
        <div>
          <label className="text-xs text-[#73675E] font-medium block mb-1">Years Gaming</label>
          <input
            type="number" min={0} max={30}
            value={formState["Years Gaming"] || "8"}
            onChange={e => setFormState(prev => ({ ...prev, "Years Gaming": e.target.value }))}
            className="w-full bg-white border border-[#DDD3C3] rounded-lg px-2.5 py-2 text-xs text-[#231C18] focus:border-[#722F37]"
          />
        </div>
        <div>
          <label className="text-xs text-[#73675E] font-medium block mb-1">Tech Openness (1-5)</label>
          <input
            type="number" min={1} max={5}
            value={formState["Tech Openness"] || "4"}
            onChange={e => setFormState(prev => ({ ...prev, "Tech Openness": e.target.value }))}
            className="w-full bg-white border border-[#DDD3C3] rounded-lg px-2.5 py-2 text-xs text-[#231C18] focus:border-[#722F37]"
          />
        </div>
        <div>
          <label className="text-xs text-[#73675E] font-medium block mb-1">Cloud Interest (1-5)</label>
          <input
            type="number" min={1} max={5}
            value={formState["Cloud Interest"] || "3"}
            onChange={e => setFormState(prev => ({ ...prev, "Cloud Interest": e.target.value }))}
            className="w-full bg-white border border-[#DDD3C3] rounded-lg px-2.5 py-2 text-xs text-[#231C18] focus:border-[#722F37]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={predict}
          className="px-5 py-2.5 rounded-lg bg-[#722F37] hover:bg-[#5B1C25] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
        >
          <Brain className="w-3.5 h-3.5" /> Execute Multi-Stage Scoring
        </button>
        <span className="text-[11px] text-[#73675E]">
          Two-Stage Architecture: Binary Churn LogisticRegression + Multi-Class Destination Softmax
        </span>
      </div>

      {result && (
        <div className="mt-5 space-y-4">
          {/* Stage 1: Churn / Switch Propensity Result */}
          <div className="rounded-xl bg-[#FAF5F6] border border-[#E8CDD3] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 ${result.isSwitch ? "text-[#722F37]" : "text-[#B8533B]"}`} />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#73675E]">
                    Stage 1: Platform Migration Propensity
                  </div>
                  <span className="text-base font-bold text-[#231C18]">{result.label}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#73675E] mr-2">Switch Probability:</span>
                <span className="text-lg font-bold text-[#722F37]">{(result.probability * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="w-full bg-[#EAE3D6] rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${result.isSwitch ? "bg-[#722F37]" : "bg-[#B8533B]"}`}
                style={{ width: `${result.probability * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#73675E] font-mono pt-1">
              <span>Log-Odds Score (z): {result.logOdds.toFixed(4)}</span>
              <span>Sigmoid Threshold: 0.50</span>
            </div>
          </div>

          {/* Stage 2: Destination Platform Prediction (Conditional Gate) */}
          {result.isSwitch ? (
            <div className="rounded-xl bg-white border border-[#DDD3C3] p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EAE3D6]">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#722F37] flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-[#722F37]" /> Stage 2: Destination Platform Recommendation
                  </div>
                  <div className="text-sm font-bold text-[#231C18] mt-0.5 flex items-center gap-2">
                    Predicted Switch Target: <span className="text-base font-extrabold text-[#722F37]">{result.topDestination}</span>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getPlatformBadgeColor(result.topDestination)}`}>
                  {getPlatformIcon(result.topDestination)}
                  <span>Top Choice: {result.topDestination}</span>
                </div>
              </div>

              <p className="text-xs text-[#554A43] leading-relaxed">
                Stage 1 identified that this user <strong>plans to switch</strong> away from <strong>{formState["Current Platform"]}</strong>. Stage 2 evaluates their gameplay habits, tech openness, and motivation to determine that they are most likely to move toward <strong>{result.topDestination}</strong>.
              </p>

              {/* Destination Probabilities Breakdown */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold text-[#231C18] mb-1">
                  Destination Platform Probability Distribution:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {result.destinationProbabilities.map((item) => (
                    <div key={item.platform} className="p-3 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#231C18] flex items-center gap-1.5">
                          {getPlatformIcon(item.platform)}
                          {item.platform}
                        </span>
                        <span className="font-mono font-bold" style={{ color: getPlatformBarColor(item.platform) }}>
                          {(item.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-[#EAE3D6] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${item.probability * 100}%`,
                            backgroundColor: getPlatformBarColor(item.platform)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EAE3D6]">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#4E6853] flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-[#4E6853]" /> Stage 2: Destination Platform Gate (Inactive)
                  </div>
                  <div className="text-sm font-bold text-[#231C18] mt-0.5">
                    Final Decision: <span className="text-base font-extrabold text-[#4E6853]">Retained on {formState["Current Platform"]}</span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#EEF4EF] text-[#4E6853] border-[#D3E2D5] flex items-center gap-1.5">
                  No Switch Required
                </span>
              </div>

              <p className="text-xs text-[#554A43] leading-relaxed">
                Because Stage 1 predicted that this gamer has <strong>no plans to switch</strong> (Switch Probability: {(result.probability * 100).toFixed(1)}% &lt; 50%), Stage 2 destination classification is <strong>not triggered</strong>. The player remains happily settled on their current platform (<strong>{formState["Current Platform"]}</strong>).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PredictionClient({ data }: { data: PredictionData }) {
  const bestModelIdx = data.models.reduce((bestIdx, m, i, arr) =>
    m.macroF1 > arr[bestIdx].macroF1 ? i : bestIdx, 0);

  // Feature importance chart data
  const fiData = data.featureImportance.map(f => ({ name: f.feature, Importance: f.importance }));

  // Model comparison chart
  const compData = data.models.map(m => ({
    name: m.name.replace("Majority Baseline", "Baseline").replace("Logistic Regression", "Log. Reg.").replace("Random Forest", "Rand. Forest"),
    Accuracy: m.accuracy,
    "Macro F1": m.macroF1,
    "CV Macro F1": m.cvMacroF1Mean,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[#EAE3D6] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8EDEF] border border-[#E8CDD3] text-[#722F37] text-xs font-semibold uppercase tracking-wider mb-2">
            <Brain className="w-3.5 h-3.5" /> Supervised Machine Learning
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#231C18] tracking-tight">
            Predictive Modeling & Model Export
          </h1>
          <p className="text-[#73675E] text-sm mt-1 max-w-2xl">
            Trained and evaluated classification pipelines predicting whether a gamer plans to switch platforms ($N=205$, Stratified 80/20 split, 5-fold CV).
          </p>
        </div>

        {/* Download .pkl Model Artifacts */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/models/random_forest_model.pkl"
            download="random_forest_model.pkl"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E8CDD3] hover:border-[#722F37] text-xs font-medium text-[#722F37] flex items-center gap-2 transition-all shadow-sm hover:bg-[#FAF5F6]"
            title="Download Stage 1 Switch Propensity Random Forest (.pkl)"
          >
            <Download className="w-3.5 h-3.5" /> Stage 1 RF (.pkl)
          </a>
          <a
            href="/models/logistic_regression_model.pkl"
            download="logistic_regression_model.pkl"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE3D6] hover:border-[#8C6D46] text-xs font-medium text-[#8C6D46] flex items-center gap-2 transition-all shadow-sm hover:bg-[#FAF7F2]"
            title="Download Stage 1 Switch Propensity Logistic Regression (.pkl)"
          >
            <Download className="w-3.5 h-3.5" /> Stage 1 Log. Reg. (.pkl)
          </a>
          <a
            href="/models/destination_random_forest.pkl"
            download="destination_random_forest.pkl"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#D3E2D5] hover:border-[#4E6853] text-xs font-medium text-[#4E6853] flex items-center gap-2 transition-all shadow-sm hover:bg-[#EEF4EF]"
            title="Download Stage 2 Platform Destination Random Forest (.pkl)"
          >
            <Download className="w-3.5 h-3.5" /> Stage 2 Dest. RF (.pkl)
          </a>
          <a
            href="/models/destination_logistic_regression.pkl"
            download="destination_logistic_regression.pkl"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#D0E0EC] hover:border-[#2B5B84] text-xs font-medium text-[#2B5B84] flex items-center gap-2 transition-all shadow-sm hover:bg-[#EDF3F8]"
            title="Download Stage 2 Platform Destination Logistic Regression (.pkl)"
          >
            <Download className="w-3.5 h-3.5" /> Stage 2 Dest. Softmax (.pkl)
          </a>
        </div>
      </div>

      {/* Target definition box */}
      <div className="card bg-white border border-[#EAE3D6] p-4 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs text-[#73675E] uppercase tracking-wider font-semibold mb-0.5">Target Variable (Binary Classification)</div>
            <div className="text-sm font-bold text-[#231C18]">{data.targetDefinition.label}</div>
            <div className="text-xs text-[#73675E] mt-0.5">{data.targetDefinition.mapping}</div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6] text-[#73675E]">
              No switch (0): <strong className="text-[#231C18]">{data.targetDistribution.noSwitch}</strong> ({((data.targetDistribution.noSwitch / 205) * 100).toFixed(1)}%)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#F8EDEF] border border-[#E8CDD3] text-[#722F37]">
              Plans switch (1): <strong className="text-[#722F37]">{data.targetDistribution.planSwitch}</strong> ({((data.targetDistribution.planSwitch / 205) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Model comparison chart */}
      <ChartCard
        title="Model Comparison"
        subtitle="Accuracy, Macro F1, and 5-fold CV Macro F1 across models"
        insight="Logistic Regression with balanced class weights achieved 70.7% Test Accuracy and 70.7% Macro F1, significantly outperforming the Majority Baseline."
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={compData} margin={{ top: 4, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
            <XAxis dataKey="name" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
            <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${(Number(v) * 100).toFixed(1)}%`, ""]} />
            <Legend formatter={(v) => <span style={{ color: "#73675E", fontSize: 10 }}>{v}</span>} iconSize={8} />
            <Bar dataKey="Accuracy" fill="#722F37" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Macro F1" fill="#B8533B" radius={[3, 3, 0, 0]} />
            <Bar dataKey="CV Macro F1" fill="#4E6853" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Model cards */}
      <SectionHeading title="Model Evaluation Details" description="Per-model metrics, confusion matrices, and per-class performance" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.models.map((model, i) => (
          <ModelCard key={model.name} model={model} isBest={i === bestModelIdx} />
        ))}
      </div>

      {/* Feature importance chart */}
      <ChartCard
        title="Random Forest Feature Importance (MDI / Gini)"
        subtitle="Top 12 features ranked by mean decrease in impurity across 100 decision trees"
        insight="Tech Openness, Cloud Interest, Age, and Weekend Gaming Hours emerge as the highest-ranked indicators of platform migration intent."
      >
        <ResponsiveContainer width="100%" height={Math.max(260, fiData.length * 28)}>
          <BarChart data={fiData} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 8 }}>
            <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
            <XAxis type="number" tick={AXIS_STYLE} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <YAxis type="category" dataKey="name" tick={{ ...AXIS_STYLE, fontSize: 10 }} tickLine={false} axisLine={false} width={130} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${(Number(v) * 100).toFixed(2)}%`, "Importance"]} />
            <Bar dataKey="Importance" fill="#722F37" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Live Exact Model Inference Section */}
      <ScikitLearnPredictor data={data} />

      {/* Caveat Box */}
      <CaveatBox items={data.limitations} />
    </div>
  );
}
