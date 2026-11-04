"""
GameMetrics Predictive Model Training & Export Script
Trains Machine Learning pipelines on Cleaned_data.xlsx:
1. Stage 1: Churn / Switch Propensity Classifier (Binary: Stays vs. Plans Switch)
2. Stage 2: Destination Platform Classifier (Multi-class: PC vs. Console vs. Mobile vs. Cloud/Next-Gen)

Serializes all models to .pkl files using joblib, and exports weights for client-side mathematical scoring.

Run:
    python scripts/train_predictive_model.py
"""
import sys, io, json, os
from pathlib import Path
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import joblib
import openpyxl
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import classification_report, accuracy_score, f1_score

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
CLEANED_XLSX = PROJECT_ROOT / "Cleaned_data.xlsx"
MODELS_ROOT = PROJECT_ROOT / "models"
MODELS_PUBLIC = PROJECT_ROOT / "gamemetrics" / "public" / "models"
GEN_DATA_DIR = PROJECT_ROOT / "gamemetrics" / "src" / "data" / "generated"

MODELS_ROOT.mkdir(parents=True, exist_ok=True)
MODELS_PUBLIC.mkdir(parents=True, exist_ok=True)
GEN_DATA_DIR.mkdir(parents=True, exist_ok=True)

print("1. Loading and filtering survey dataset...")
wb = openpyxl.load_workbook(CLEANED_XLSX)
ws = wb["Sheet1"]
headers = [ws.cell(1, c).value for c in range(1, ws.max_column + 1)]
rows = [{headers[c]: ws.cell(r, c + 1).value for c in range(len(headers))} for r in range(2, ws.max_row + 1)]
df_all = pd.DataFrame(rows)
df = df_all[df_all["DQ_Flag_Age_100_Excluded"] == 0].copy()
print(f"   Cleaned records: {len(df)}")

C = {
    "age": "What is your age?",
    "gender": "Gender",
    "occ": "Occupation",
    "fp": "What was your FIRST gaming platform?",
    "cp": "What is your CURRENT primary gaming platform?",
    "yrs": "How many years have you been gaming?",
    "exp": "How would you rate your gaming experience level?",
    "wkd": "On average, how many hours do you play PER WEEKDAY?",
    "wke": "On average, how many hours do you play PER WEEKEND?",
    "freq": "How often do you play games?",
    "mot": "What is the main reason you play games?",
    "imp": "How important is gaming in your daily routine?",
    "gt": "What type of gamer would you describe yourself as?",
    "improve": "How willing are you to practice/improve your skills?",
    "cloud": "Have you tried cloud gaming (e.g., GeForce Now, Xbox Cloud)?",
    "ci": "How interested are you in the future of cloud gaming?",
    "ai": "Have you used any AI-based gaming features (AI NPCs, AI-generated content, etc.)?",
    "to": "How open are you to trying new gaming technology in general?",
    "fp2": "Which platform are you most likely to move toward next, if any?",
}

# ==========================================
# STAGE 1: SWITCH INTENT (BINARY)
# ==========================================
df["switch_intent"] = (df[C["fp2"]] != "No plans to switch").astype(int)
print(f"   Stage 1 Target distribution (Switch Intent): {df['switch_intent'].value_counts().to_dict()}")

NF = [C["age"], C["yrs"], C["wkd"], C["wke"], C["imp"], C["improve"], C["ci"], C["to"]]
CF = [C["gender"], C["occ"], C["fp"], C["cp"], C["exp"], C["freq"], C["mot"], C["gt"], C["cloud"], C["ai"]]

# Friendly short names for inputs
NMAP = {
    C["age"]: "age",
    C["yrs"]: "years_gaming",
    C["wkd"]: "weekday_hours",
    C["wke"]: "weekend_hours",
    C["imp"]: "gaming_importance",
    C["improve"]: "willingness_to_improve",
    C["ci"]: "cloud_interest",
    C["to"]: "tech_openness",
    C["gender"]: "gender",
    C["occ"]: "occupation",
    C["fp"]: "first_platform",
    C["cp"]: "current_platform",
    C["exp"]: "experience_level",
    C["freq"]: "gaming_frequency",
    C["mot"]: "motivation",
    C["gt"]: "gamer_type",
    C["cloud"]: "cloud_gaming_used",
    C["ai"]: "ai_features_used"
}

Xdf = df[NF + CF].copy()
for col in NF:
    Xdf[col] = pd.to_numeric(Xdf[col], errors="coerce").fillna(Xdf[col].median())
for col in CF:
    Xdf[col] = Xdf[col].fillna("Unknown").astype(str)

y = df["switch_intent"]

Xtr, Xte, ytr, yte = train_test_split(Xdf, y, test_size=0.2, random_state=42, stratify=y)
print(f"   Train set: {len(Xtr)}, Test set: {len(Xte)}")

preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), NF),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CF)
    ]
)

print("\n2. Training Stage 1 Random Forest Classifier...")
rf_pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced"))
])
rf_pipeline.fit(Xtr, ytr)
rf_preds = rf_pipeline.predict(Xte)
rf_acc = accuracy_score(yte, rf_preds)
rf_f1 = f1_score(yte, rf_preds, average="macro")
print(f"   Random Forest -> Test Accuracy: {rf_acc:.4f}, Macro F1: {rf_f1:.4f}")

print("\n3. Training Stage 1 Logistic Regression Classifier...")
lr_pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced"))
])
lr_pipeline.fit(Xtr, ytr)
lr_preds = lr_pipeline.predict(Xte)
lr_acc = accuracy_score(yte, lr_preds)
lr_f1 = f1_score(yte, lr_preds, average="macro")
print(f"   Logistic Regression -> Test Accuracy: {lr_acc:.4f}, Macro F1: {lr_f1:.4f}")

# Serializing Stage 1 models
rf_pkl_path = MODELS_ROOT / "random_forest_model.pkl"
lr_pkl_path = MODELS_ROOT / "logistic_regression_model.pkl"
rf_public_path = MODELS_PUBLIC / "random_forest_model.pkl"
lr_public_path = MODELS_PUBLIC / "logistic_regression_model.pkl"

joblib.dump(rf_pipeline, rf_pkl_path)
joblib.dump(lr_pipeline, lr_pkl_path)
joblib.dump(rf_pipeline, rf_public_path)
joblib.dump(lr_pipeline, lr_public_path)

# Extract Stage 1 weights for client-side scoring
lr_model = lr_pipeline.named_steps["classifier"]
num_scaler = lr_pipeline.named_steps["preprocessor"].named_transformers_["num"]
cat_encoder = lr_pipeline.named_steps["preprocessor"].named_transformers_["cat"]

coefs = lr_model.coef_[0]
intercept = float(lr_model.intercept_[0])

scaler_means = {NMAP.get(col, col): float(mean) for col, mean in zip(NF, num_scaler.mean_)}
scaler_scales = {NMAP.get(col, col): float(scale) for col, scale in zip(NF, num_scaler.scale_)}
num_weights = {NMAP.get(col, col): float(w) for col, w in zip(NF, coefs[:len(NF)])}

cat_weights = {}
offset = len(NF)
for col_idx, col in enumerate(CF):
    cats = list(cat_encoder.categories_[col_idx])
    friendly_name = NMAP.get(col, col)
    cat_weights[friendly_name] = {}
    for cat in cats:
        cat_weights[friendly_name][str(cat)] = float(coefs[offset])
        offset += 1

# ==========================================
# STAGE 2: DESTINATION PLATFORM (MULTI-CLASS)
# ==========================================
print("\n4. Training Stage 2 Platform Destination Classifier (for Switchers)...")

df_switch = df[df[C["fp2"]] != "No plans to switch"].copy()

def map_dest(val):
    if val in ["Cloud Gaming", "AI-driven platforms"]:
        return "Cloud / Next-Gen"
    return val

df_switch["dest_platform"] = df_switch[C["fp2"]].apply(map_dest)
dest_counts = df_switch["dest_platform"].value_counts().to_dict()
print(f"   Stage 2 Destination distribution (N={len(df_switch)}): {dest_counts}")

X_sw = df_switch[NF + CF].copy()
for col in NF:
    X_sw[col] = pd.to_numeric(X_sw[col], errors="coerce").fillna(X_sw[col].median())
for col in CF:
    X_sw[col] = X_sw[col].fillna("Unknown").astype(str)
y_sw = df_switch["dest_platform"]

dest_preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), NF),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CF)
    ]
)

dest_lr_pipeline = Pipeline([
    ("preprocessor", dest_preprocessor),
    ("classifier", LogisticRegression(max_iter=1000, random_state=42))
])
dest_lr_pipeline.fit(X_sw, y_sw)

dest_rf_pipeline = Pipeline([
    ("preprocessor", dest_preprocessor),
    ("classifier", RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42))
])
dest_rf_pipeline.fit(X_sw, y_sw)

dest_lr_acc = dest_lr_pipeline.score(X_sw, y_sw)
dest_rf_acc = dest_rf_pipeline.score(X_sw, y_sw)
print(f"   Destination Logistic Regression Train Accuracy: {dest_lr_acc:.4f}")
print(f"   Destination Random Forest Train Accuracy: {dest_rf_acc:.4f}")

# Serialize Stage 2 models
dest_rf_pkl = MODELS_ROOT / "destination_random_forest.pkl"
dest_lr_pkl = MODELS_ROOT / "destination_logistic_regression.pkl"
dest_rf_pub = MODELS_PUBLIC / "destination_random_forest.pkl"
dest_lr_pub = MODELS_PUBLIC / "destination_logistic_regression.pkl"

joblib.dump(dest_rf_pipeline, dest_rf_pkl)
joblib.dump(dest_lr_pipeline, dest_lr_pkl)
joblib.dump(dest_rf_pipeline, dest_rf_pub)
joblib.dump(dest_lr_pipeline, dest_lr_pub)
print(f"   Saved Stage 2 models to {MODELS_ROOT} and {MODELS_PUBLIC}")

# Extract Stage 2 Softmax weights
dest_clf = dest_lr_pipeline.named_steps["classifier"]
dest_classes = list(dest_clf.classes_)
dest_num_scaler = dest_lr_pipeline.named_steps["preprocessor"].named_transformers_["num"]
dest_cat_encoder = dest_lr_pipeline.named_steps["preprocessor"].named_transformers_["cat"]

dest_scaler_means = {NMAP.get(col, col): float(mean) for col, mean in zip(NF, dest_num_scaler.mean_)}
dest_scaler_scales = {NMAP.get(col, col): float(scale) for col, scale in zip(NF, dest_num_scaler.scale_)}

dest_intercepts = {cls_name: float(dest_clf.intercept_[i]) for i, cls_name in enumerate(dest_classes)}

dest_num_weights = {}
dest_cat_weights = {}

for cls_idx, cls_name in enumerate(dest_classes):
    cls_coefs = dest_clf.coef_[cls_idx]
    dest_num_weights[cls_name] = {NMAP.get(col, col): float(w) for col, w in zip(NF, cls_coefs[:len(NF)])}
    
    dest_cat_weights[cls_name] = {}
    sw_offset = len(NF)
    for col_idx, col in enumerate(CF):
        cats = list(dest_cat_encoder.categories_[col_idx])
        friendly_name = NMAP.get(col, col)
        dest_cat_weights[cls_name][friendly_name] = {}
        for cat in cats:
            dest_cat_weights[cls_name][friendly_name][str(cat)] = float(cls_coefs[sw_offset])
            sw_offset += 1

destination_payload = {
    "modelName": "Multinomial Logistic Regression (Destination Choice)",
    "classes": dest_classes,
    "trainingSampleN": len(df_switch),
    "accuracy": round(dest_lr_acc, 4),
    "intercepts": dest_intercepts,
    "scalerMeans": dest_scaler_means,
    "scalerScales": dest_scaler_scales,
    "numericWeights": dest_num_weights,
    "categoricalWeights": dest_cat_weights,
    "distribution": dest_counts
}

inference_payload = {
    "modelName": "Logistic Regression (Class-Weighted Balanced)",
    "trainingSampleN": len(df),
    "accuracy": round(lr_acc, 4),
    "macroF1": round(lr_f1, 4),
    "intercept": round(intercept, 5),
    "scalerMeans": scaler_means,
    "scalerScales": scaler_scales,
    "numericWeights": num_weights,
    "categoricalWeights": cat_weights,
    "destinationModel": destination_payload,
    "modelsAvailable": [
        {
            "name": "Random Forest (Switch Propensity)",
            "file": "random_forest_model.pkl",
            "url": "/models/random_forest_model.pkl",
            "description": "Ensemble of 100 balanced decision trees predicting whether gamer plans to switch",
            "accuracy": round(rf_acc, 4),
            "macroF1": round(rf_f1, 4)
        },
        {
            "name": "Logistic Regression (Switch Propensity)",
            "file": "logistic_regression_model.pkl",
            "url": "/models/logistic_regression_model.pkl",
            "description": "L2-regularized logistic regression with balanced class weights (Binary)",
            "accuracy": round(lr_acc, 4),
            "macroF1": round(lr_f1, 4)
        },
        {
            "name": "Destination Random Forest (Platform Choice)",
            "file": "destination_random_forest.pkl",
            "url": "/models/destination_random_forest.pkl",
            "description": "Multi-class Random Forest predicting which platform the gamer will switch to",
            "accuracy": round(dest_rf_acc, 4),
            "macroF1": None
        },
        {
            "name": "Destination Logistic Regression (Platform Choice)",
            "file": "destination_logistic_regression.pkl",
            "url": "/models/destination_logistic_regression.pkl",
            "description": "Multinomial Softmax Logistic Regression predicting destination platform",
            "accuracy": round(dest_lr_acc, 4),
            "macroF1": None
        }
    ]
}

inference_out = GEN_DATA_DIR / "trained_model_inference.json"
with open(inference_out, "w", encoding="utf-8") as f:
    json.dump(inference_payload, f, indent=2)

print(f"\n5. Exported exact multi-stage inference payload: {inference_out}")
print("Done! Both Stage 1 (Switch Intent) and Stage 2 (Platform Destination) pipelines trained and exported successfully.")
