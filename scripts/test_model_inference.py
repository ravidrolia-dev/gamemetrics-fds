"""
GameMetrics Model Inference Verification Script
Demonstrates loading the trained .pkl pipeline and running predictions on custom inputs.

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

print(f"Loading trained models from:\n - {RF_MODEL_PATH}\n - {LR_MODEL_PATH}\n")
rf_pipe = joblib.load(RF_MODEL_PATH)
lr_pipe = joblib.load(LR_MODEL_PATH)

# Example sample data corresponding to survey feature columns
sample_profiles = [
    {
        "description": "Tech-forward high-engagement gamer (PC player exploring cloud)",
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
        "What is your CURRENT primary gaming platform?": "PC",
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
        "How often do you play games?": "A few times a week",
        "What is the main reason you play games?": "Relaxation",
        "What type of gamer would you describe yourself as?": "Casual gamer",
        "Have you tried cloud gaming (e.g., GeForce Now, Xbox Cloud)?": "No",
        "Have you used any AI-based gaming features (AI NPCs, AI-generated content, etc.)?": "No"
    }
]

df_samples = pd.DataFrame(sample_profiles)
feature_cols = [c for c in df_samples.columns if c != "description"]

print("Running Predictions on Test Samples:\n" + "=" * 60)
for idx, row in df_samples.iterrows():
    print(f"\nProfile {idx + 1}: {row['description']}")
    sample_df = pd.DataFrame([row[feature_cols]])
    
    rf_pred = rf_pipe.predict(sample_df)[0]
    rf_proba = rf_pipe.predict_proba(sample_df)[0][1]
    
    lr_pred = lr_pipe.predict(sample_df)[0]
    lr_proba = lr_pipe.predict_proba(sample_df)[0][1]
    
    print(f"  [Random Forest]       Prediction: {'Plans to switch (1)' if rf_pred == 1 else 'No switch (0)'} (Probability: {rf_proba:.1%})")
    print(f"  [Logistic Regression] Prediction: {'Plans to switch (1)' if lr_pred == 1 else 'No switch (0)'} (Probability: {lr_proba:.1%})")

print("\n" + "=" * 60)
print("Pipeline verification successful!")
