# GameMetrics — The Evolution of Gaming & Gamer Behaviour

> **Foundations of Data Science (FDS) College Project**  
> A production-grade, data-driven web application and analytical dashboard exploring gaming preferences, platform migration, demographic segmentation, hypothesis testing, and machine learning prediction based on empirical survey responses.

---

## 🌟 Overview

**GameMetrics** replaces static notebooks and rudimentary prototypes with a responsive, modern data application deployed directly to Vercel. Built on cleaned survey responses ($N=205$), it couples statistical testing (Chi-Square with Monte Carlo validation, Spearman rank correlation, Kruskal-Wallis, Holm-Bonferroni correction) and machine learning (K-Means clustering, Random Forest, Logistic Regression) with interactive data visualization.

---

## 🚀 Key Modules & Dashboard Pages

1. **Overview Dashboard (`/`)**
   - High-level KPIs: Total sample size ($N=205$), median weekly playtime, primary platform breakdown, and switching rate.
   - 10+ core charts covering platform distributions, monetization models, gaming hardware sentiment, cloud gaming receptivity, and demographic distributions.

2. **Platform & Gaming Behaviour (`/gaming-behaviour`)**
   - Empirical cross-tabulation matrix of current platform vs. preferred future platform.
   - Migration pattern analysis (switchers vs. non-switchers).
   - In-game spending distribution across platforms (microtransactions, subscriptions, upfront purchases).
   - Estimated weekly playtime distribution across platform cohorts.

3. **Hypothesis Testing Lab (`/hypothesis`)**
   - 13 formal statistical tests evaluating platform adoption, spending correlations, tech openness, and cohort differences.
   - Comprehensive reporting: Null hypothesis ($H_0$), Alternative hypothesis ($H_1$), test statistics, degrees of freedom, asymptotic $p$-values, effect sizes (Cramer's $V$, Rank-biserial $r$), and plain-English interpretations.
   - **Holm-Bonferroni Family-Wise Error Rate (FWER)** correction across all simultaneous tests ($\alpha = 0.05$).
   - Sparse-contingency table robustness checks using **Monte Carlo permutation validation**.

4. **Prediction Lab (`/prediction`)**
   - Supervised classification modeling predicting platform migration intent (Switch Intent: $0$ vs. $1$).
   - Model comparison: **Majority Baseline (DummyClassifier)** vs. **Logistic Regression (Class-Weighted)** vs. **Random Forest Classifier (Class-Weighted)**.
   - Full evaluation metrics: Accuracy, Precision, Recall, Macro F1, Stratified 5-Fold Cross-Validation Macro F1, and complete Confusion Matrices.
   - Gini feature importance rankings highlighting top drivers of switching propensity.
   - **Live Scikit-Learn Inference Engine**: Real mathematical scoring matching the exact trained logistic regression pipeline parameters.
   - **Serialized Model Artifacts (`.pkl`)**: Downloadable and loadable via Python `joblib.load()` (`random_forest_model.pkl` and `logistic_regression_model.pkl`).

5. **Gamer Segmentation (`/segments`)**
   - Unsupervised **K-Means clustering** across standardized behavioral and preference dimensions.
   - Clustering diagnostic curves: **Inertia (Elbow method)** and **Silhouette Coefficients** across candidate partitions ($k = 2 \dots 6$).
   - Multi-dimensional radar profile chart comparing cluster characteristics.
   - Cluster-level breakdowns of platform preference, occupation distributions, and playtime distributions.

6. **Genre Dynamics & Cohort Analysis (`/genres`)**
   - Popularity rankings of current primary genres (RPG, Action, Sandbox, etc.).
   - Multi-select frequency analysis of anticipated emerging formats (AI-procedural generation, VR/AR, cloud streaming).
   - Age cohort comparative analysis: Gamers Under 22 vs. Gamers 22 and older.

7. **Methodology & Data Ethics (`/methodology`)**
   - Full audit trail of raw data ($N=206$) to clean analytical sample ($N=205$).
   - Transparent documentation of outlier exclusion (Age 100 invalid record) and conditional response handling.
   - Derived variable definitions and mathematical formulas.
   - Privacy, anonymity, and institutional review considerations.

---

## 🛠️ Technology Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, Server & Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing across all data schemas)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom dark gaming-analytics color system
- **Data Visualization**: [Recharts](https://recharts.org/) (Responsive Bar, Line, Radar, Donut, and Stacked charts)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Science Pipeline**: Python 3.12, Pandas, NumPy, Scikit-learn, SciPy, OpenPyXL

---

## 📁 Repository Structure

```text
├── app/                            # Next.js App Router
│   ├── gaming-behaviour/          # Platform migration & playtime
│   ├── genres/                    # Genre trends & age cohort analysis
│   ├── hypothesis/                # 13 formal hypothesis tests & Monte Carlo
│   ├── methodology/               # Research design, data cleaning & ethics
│   ├── prediction/                # Supervised ML comparison & predictor
│   ├── segments/                  # Unsupervised K-Means clustering
│   ├── globals.css                # Custom theme & animation tokens
│   ├── layout.tsx                 # App layout with Sidebar & TopNav
│   └── page.tsx                   # Overview dashboard
├── src/
│   ├── components/
│   │   ├── charts/                # Reusable Recharts dark theme components
│   │   └── ui/                    # Sidebar, TopNav, Cards, Badges, Caveats
│   ├── data/
│   │   └── generated/             # Pre-aggregated JSON datasets
│   └── types/
│       └── data.ts                # TypeScript interfaces for all schemas
├── scripts/
│   └── generate_data.py           # Automated Python data extraction & ML pipeline
└── package.json                   # Dependencies & build scripts
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.17.0 or higher
- **Python**: 3.10+ (only required if re-running the raw data extraction pipeline)

### 2. Installation

Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd gamemetrics
npm install
```

### 3. Running Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Production Build

Verify that static generation and TypeScript checks pass cleanly:
```bash
npm run build
npm run start
```

### 5. (Optional) Re-generating Data from Raw Survey

To re-run the Python data pipeline from source survey workbooks:
```bash
# From workspace root
python scripts/generate_data.py
```
This updates the JSON files in `src/data/generated/`.

---

## 🚢 Deploying to Vercel

This repository is optimized for one-click deployment on [Vercel](https://vercel.com/):

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project in Vercel.
3. Set the Root Directory to `gamemetrics` (if in a monorepo) or root.
4. Leave build settings as default (`npm run build`).
5. Deploy!

All 7 analytical pages are statically generated at build time, ensuring sub-second response times, zero server runtime dependencies, and high reliability.

---

## 📜 Academic Integrity & Citation

This project was developed for the **Foundations of Data Science (FDS)** curriculum. All statistical tests include Holm-Bonferroni family-wise error adjustments to prevent $p$-hacking, and machine learning models are cross-validated with stratified splits to ensure honest generalization estimates.
