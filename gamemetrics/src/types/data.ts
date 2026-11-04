// Types for all generated JSON data consumed by the GameMetrics dashboard

export interface FreqItem {
  category: string;
  count: number;
  percent: number;
}

export interface HoursItem {
  hours: string;
  count: number;
}

export interface OverviewKPIs {
  totalRespondents: number;
  meanAge: number;
  mostCommonPlatform: string;
  mostCommonPlatformCount: number;
  switchedCount: number;
  switchedPercent: number;
  meanWeeklyHours: number;
  zeroSpendCount: number;
  zeroSpendPercent: number;
}

export interface OverviewData {
  kpis: OverviewKPIs;
  currentPlatformDist: FreqItem[];
  firstPlatformDist: FreqItem[];
  experienceDist: FreqItem[];
  frequencyDist: FreqItem[];
  spendingDist: FreqItem[];
  motivationDist: FreqItem[];
  cloudAdoption: FreqItem[];
  aiAdoption: FreqItem[];
  gamerTypeDist: FreqItem[];
  genderDist: FreqItem[];
  occupationDist: FreqItem[];
  weekdayHours: { mean: number; median: number };
  weekendHours: { mean: number; median: number };
  weekdayHoursDist: HoursItem[];
  weekendHoursDist: HoursItem[];
}

export interface CrosstabData {
  rows: { name: string; values: number[] }[];
  columns: string[];
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface PlatformSwitchItem {
  platform: string;
  yes: number;
  no: number;
  total: number;
  switchedPct: number;
}

export interface SpendingByPlatform {
  platform: string;
  [key: string]: string | number;
}

export interface HoursByPlatform {
  platform: string;
  mean: number;
  median: number;
  n: number;
}

export interface PlatformEvolutionData {
  firstVsCurrent: CrosstabData;
  switchReasons: FreqItem[];
  currVsFuture: CrosstabData;
  futurePlatDist: FreqItem[];
  switchByPlatform: PlatformSwitchItem[];
  spendingByPlatform: SpendingByPlatform[];
  spendingCategories: string[];
  hoursByPlatform: HoursByPlatform[];
  sankeyLinks: SankeyLink[];
}

export interface HypothesisTest {
  id: number;
  researchQuestion: string;
  test: string;
  n: number;
  statistic: number | null;
  df: number | null;
  rawPValue: string | null;
  effectSize: number | null;
  effectSizeMeasure: string;
  holmAdjustedPValue: string | null;
  significant: boolean;
  validationNote: string;
}

export interface SparseCheck {
  researchQuestion: string;
  n: number;
  chiSqStat: number | null;
  df: number | null;
  asymptoticP: string | null;
  monteCarloP: string | null;
  cramersV: number | null;
  expectedCellsUnder5: number | null;
}

export interface HypothesisData {
  tests: HypothesisTest[];
  sparseChecks: SparseCheck[];
  caveats: string[];
}

export interface GenreItem {
  genre: string;
  count: number;
}

export interface AgeCohortItem {
  genre: string;
  under22: number;
  "22plus": number;
  diff: number;
  under22_n: number;
  "22plus_n": number;
}

export interface GenreData {
  currentGenreDist: FreqItem[];
  risingGenres: GenreItem[];
  declineGenres: FreqItem[];
  ageCohortComparison: AgeCohortItem[];
  cohortSizes: { under22: number; "22plus": number };
  notes: string[];
}

export interface PerClassMetrics {
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface ModelResult {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  macroF1: number;
  cvMacroF1Mean: number;
  cvMacroF1Std: number;
  confusionMatrix: number[][];
  perClassMetrics: { "0": PerClassMetrics; "1": PerClassMetrics };
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface PredictionData {
  targetDistribution: { noSwitch: number; planSwitch: number };
  trainTestSplit: { trainN: number; testN: number; splitRatio: string; stratified: boolean };
  models: ModelResult[];
  featureImportance: FeatureImportance[];
  targetDefinition: { label: string; classes: string[]; mapping: string };
  limitations: string[];
  cvFolds: number;
  randomState: number;
  formOptions: Record<string, string[]>;
}

export interface ClusterProfile {
  cluster: number;
  name: string;
  size: number;
  means: Record<string, number | null>;
  platformDist: FreqItem[];
  occupationDist: FreqItem[];
  gamerTypeDist: FreqItem[];
  weeklyHoursMean: number | null;
  techOpennessMean: number | null;
  cloudInterestMean: number | null;
}

export interface ClusterHours {
  cluster: number;
  name: string;
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
}

export interface SegmentData {
  diagnostics: {
    kRange: number[];
    inertias: number[];
    silhouettes: number[];
    bestK: number;
    bestKSilhouette: number;
  };
  profiles: ClusterProfile[];
  hoursByCluster: ClusterHours[];
  featureNames: string[];
  notes: string[];
}

export interface MissingnessItem {
  column: string;
  missingCount: number;
  missingPercent: number;
}

export interface DerivedVariable {
  name: string;
  formula: string;
  note: string;
}

export interface MethodologyData {
  datasetSource: string;
  totalResponses: number;
  analysisRows: number;
  excludedRows: number;
  exclusionReason: string;
  flaggedRows: number;
  flaggingReason: string;
  derivedVariables: DerivedVariable[];
  statisticalMethods: string[];
  mlMethods: string[];
  clusteringMethods: string[];
  limitations: string[];
  privacyStatement: string;
  missingness: MissingnessItem[];
}
