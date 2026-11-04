"""
GameMetrics Multi-Stage Model Inference Verification Script
Demonstrates loading the trained .pkl pipelines:
1. Stage 1: Predicts whether the gamer intends to switch platforms
2. Stage 2: If switching, predicts WHICH platform they will move toward (PC, Console, Mobile, Cloud/Next-Gen)

Run:
    python scripts/test_model_inference.py
"""
import sys, io
from pathlib import Path
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import joblib
import pandas as pd

PROJECT_ROOT = Path(__file__).parent.parent
RF_MODEL_PATH = PROJECT_ROOT / "models" / "random_forest_model.pkl"
LR_MODEL_PATH = PROJECT_ROOT / "models" / "logistic_regression_model.pkl"
DEST_RF_MODEL_PATH = PROJECT_ROOT / "models" / "destination_random_forest.pkl"
DEST_LR_MODEL_PATH = PROJECT_ROOT / "models" / "destination_logistic_regression.pkl"

print(f"Loading trained models from:\n - {RF_MODEL_PATH}\n - {LR_MODEL_PATH}\n - {DEST_RF_MODEL_PATH}\n - {DEST_LR_MODEL_PATH}\n")
rf_pipe = joblib.load(RF_MODEL_PATH)
lr_pipe = joblib.load(LR_MODEL_PATH)
dest_rf_pipe = joblib.load(DEST_RF_MODEL_PATH)
dest_lr_pipe = joblib.load(DEST_LR_MODEL_PATH)

# Example sample data corresponding to survey feature columns
sample_profiles = [
    {
        "description": "Tech-forward high-engagement gamer (Mobile-first, looking to upgrade)",
        "What is your age?": 21,
        "How many years have you been gaming?": 8,
        "On average, how many hours do you play PER WEEKDAY?": 4.0,
        "On average, how many hours do you play PER WEEKEND?": 6.0,
        "How important is gaming in your daily routine?": 4.0,
        "How willing are you to practice/improve your skills?": 4.0,
        "How interested are you in the future of cloud gaming?": 4.0,
        "How open are you to trying new gaming technology in general?": 5.0,
        "Gender": "Male",
        "Occupation": "Student",
        "What was your FIRST gaming platform?": "Mobile",
        "What is your CURRENT primary gaming platform?": "Mobile",
        "How would you rate your gaming experience level?": "Advanced",
        "How often do you play games?": "Daily",
        "What is the main reason you play games?": "Competition",
        "What type of gamer would you describe yourself as?": "Competitive gamer",
        "Have you tried cloud gaming (e.g., GeForce Now, Xbox Cloud)?": "Yes",
        "Have you used any AI-based gaming features (AI NPCs, AI-generated content, etc.)?": "Yes"
    },
    {
        "description": "Casual console player satisfied with existing setup",
        "What is your age?": 24,
        "How many years have you been gaming?": 10,
        "On average, how many hours do you play PER WEEKDAY?": 1.0,
        "On average, how many hours do you play PER WEEKEND?": 2.0,
        "How important is gaming in your daily routine?": 2.0,
        "How willing are you to practice/improve your skills?": 2.0,
        "How interested are you in the future of cloud gaming?": 1.0,
        "How open are you to trying new gaming technology in general?": 2.0,
        "Gender": "Male",
        "Occupation": "Working Professional",
        "What was your FIRST gaming platform?": "Console",
        "What is your CURRENT primary gaming platform?": "Console",
        "How would you rate your gaming experience level?": "Intermediate",
        "How often do you play games?": "Few times a week",
        "What is the main reason you play games?": "Relaxation",
        "What type of gamer would you describe yourself as?": "Casual gamer",
        "Have you tried cloud gaming (e.g., GeForce Now, Xbox Cloud)?": "No",
        "Have you used any AI-based gaming features (AI NPCs, AI-generated content, etc.)?": "No"
    }
]

df_samples = pd.DataFrame(sample_profiles)
feature_cols = [c for c in df_samples.columns if c != "description"]

print("Running Multi-Stage Predictions on Test Profiles:\n" + "=" * 70)
for idx, row in df_samples.iterrows():
    print(f"\n[Profile {idx + 1}] {row['description']}")
    sample_df = pd.DataFrame([row[feature_cols]])
    
    # Stage 1: Switch Propensity
    rf_pred = rf_pipe.predict(sample_df)[0]
    rf_proba = rf_pipe.predict_proba(sample_df)[0][1]
    
    lr_pred = lr_pipe.predict(sample_df)[0]
    lr_proba = lr_pipe.predict_proba(sample_df)[0][1]
    
    print(f"  Stage 1 (Switch Intent):")
    print(f"    - Logistic Regression : {'Plans to switch (1)' if lr_pred == 1 else 'No switch (0)'} (Probability: {lr_proba:.1%})")
    print(f"    - Random Forest       : {'Plans to switch (1)' if rf_pred == 1 else 'No switch (0)'} (Probability: {rf_proba:.1%})")
    
    if lr_pred == 1:
        dest_pred = dest_lr_pipe.predict(sample_df)[0]
        dest_probs = dest_lr_pipe.predict_proba(sample_df)[0]
        dest_classes = dest_lr_pipe.classes_
        prob_dist = ", ".join([f"{cls}: {prob:.1%}" for cls, prob in zip(dest_classes, dest_probs)])
        print(f"  Stage 2 (Target Destination):")
        print(f"    -> PREDICTED SWITCH PLATFORM: {dest_pred}")
        print(f"    -> Destination Probabilities: [{prob_dist}]")
    else:
        print(f"  Stage 2 (Destination Gate): INACTIVE (User is not switching)")
        print(f"    -> Final Status: Retained on current platform ({row['What is your CURRENT primary gaming platform?']})")

print("\n" + "=" * 70)
print("Multi-Stage Pipeline verification successful!")
