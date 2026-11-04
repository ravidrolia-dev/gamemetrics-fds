"""
GameMetrics Data Generation Script
Run: python scripts/generate_data.py
Requires: pip install openpyxl pandas numpy scipy scikit-learn
"""
import sys, io, json, math, os
from pathlib import Path
from collections import Counter
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import openpyxl
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report)
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
CLEANED_XLSX = PROJECT_ROOT / "Cleaned_data.xlsx"
STAT_XLSX = PROJECT_ROOT / "GameMetrics_Statistical_Validation.xlsx"
OUT_DIR = PROJECT_ROOT / "gamemetrics" / "src" / "data" / "generated"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def safe_float(v, decimals=2):
    if v is None or (isinstance(v, float) and math.isnan(v)): return None
    return round(float(v), decimals)

def pval_fmt(v):
    if v is None: return None
    if v < 0.001: return "<0.001"
    return round(v, 4)

print("Loading cleaned data...")
wb = openpyxl.load_workbook(CLEANED_XLSX)
ws = wb["Sheet1"]
headers = [ws.cell(1,c).value for c in range(1,ws.max_column+1)]
rows = [{headers[c]: ws.cell(r,c+1).value for c in range(len(headers))} for r in range(2, ws.max_row+1)]
df_all = pd.DataFrame(rows)
df = df_all[df_all["DQ_Flag_Age_100_Excluded"]==0].copy()
print(f"  Analysis rows: {len(df)}")

C = {
  "age":"What is your age?",
  "gender":"Gender","occ":"Occupation",
  "fp":"What was your FIRST gaming platform?",
  "cp":"What is your CURRENT primary gaming platform?",
  "yrs":"How many years have you been gaming?",
  "sw":"Have you ever switched your primary gaming platform?",
  "swr":'If yes, what was the main reason for switching? (Select "Not applicable" if you have not switched)',
  "exp":"How would you rate your gaming experience level?",
  "wkd":"On average, how many hours do you play PER WEEKDAY?",
  "wke":"On average, how many hours do you play PER WEEKEND?",
  "freq":"How often do you play games?",
  "mot":"What is the main reason you play games?",
  "imp":"How important is gaming in your daily routine?",
  "gt":"What type of gamer would you describe yourself as?",
  "fg1":"Rate the importance of each feature to you [Gameplay/Mechanics]",
  "fg2":"Rate the importance of each feature to you [Story]",
  "fg3":"Rate the importance of each feature to you [Graphics]",
  "fg4":"Rate the importance of each feature to you [Competition/Difficulty]",
  "fg5":"Rate the importance of each feature to you [Social/Multiplayer]",
  "improve":"How willing are you to practice/improve your skills?",
  "cloud":"Have you tried cloud gaming (e.g., GeForce Now, Xbox Cloud)?",
  "ci":"How interested are you in the future of cloud gaming?",
  "ai":"Have you used any AI-based gaming features (AI NPCs, AI-generated content, etc.)?",
  "to":"How open are you to trying new gaming technology in general?",
  "spend":"How much do you spend on gaming per month (games, subscriptions, in-game purchases)?",
  "fp2":"Which platform are you most likely to move toward next, if any?",
  "gc":"Which game genre/type do you play MOST currently?",
  "gr":"Which of these do you think will become MORE popular in the next 5 years? (select up to 2)",
  "gd":"Which genre/type do you think will decline in popularity? (optional)",
}

df["weekly"] = df[C["wkd"]].astype(float)*5 + df[C["wke"]].astype(float)*2
df.loc[df["DQ_Flag_Switching_Reason_Inconsistent"]==1, C["swr"]] = None

def ft(series):
    vc=series.value_counts(dropna=True); tot=vc.sum()
    return [{"category":str(k),"count":int(v),"percent":round(v/tot*100,1)} for k,v in vc.items()]

def ctd(df,rc,cc):
    ct=pd.crosstab(df[rc],df[cc])
    return {"rows":[{"name":str(i),"values":[int(x) for x in r]} for i,r in ct.iterrows()],"columns":list(ct.columns.astype(str))}

n=len(df)
overview={
  "kpis":{
    "totalRespondents":n,
    "meanAge":round(df[C["age"]].mean(),2),
    "mostCommonPlatform":df[C["cp"]].value_counts().idxmax(),
    "mostCommonPlatformCount":int(df[C["cp"]].value_counts().max()),
    "switchedCount":int((df[C["sw"]]=="Yes").sum()),
    "switchedPercent":round((df[C["sw"]]=="Yes").sum()/n*100,1),
    "meanWeeklyHours":round(df["weekly"].mean(),2),
    "zeroSpendCount":int((df[C["spend"]]=="Rs.0").sum() if "Rs.0" in df[C["spend"]].values else (df[C["spend"]].str.startswith("\u20b90") if df[C["spend"]].dtype==object else pd.Series(False)).sum()),
    "zeroSpendPercent":0,
  },
  "currentPlatformDist":ft(df[C["cp"]]),
  "firstPlatformDist":ft(df[C["fp"]]),
  "experienceDist":ft(df[C["exp"]]),
  "frequencyDist":ft(df[C["freq"]]),
  "motivationDist":ft(df[C["mot"]]),
  "cloudAdoption":ft(df[C["cloud"]]),
  "aiAdoption":ft(df[C["ai"]]),
  "gamerTypeDist":ft(df[C["gt"]]),
  "genderDist":ft(df[C["gender"]]),
  "occupationDist":ft(df[C["occ"]]),
  "weekdayHours":{"mean":safe_float(df[C["wkd"]].astype(float).mean()),"median":safe_float(df[C["wkd"]].astype(float).median())},
  "weekendHours":{"mean":safe_float(df[C["wke"]].astype(float).mean()),"median":safe_float(df[C["wke"]].astype(float).median())},
}

# Fix zero spend
sp=df[C["spend"]]
zc=int((sp=="\u20b90").sum())
overview["kpis"]["zeroSpendCount"]=zc
overview["kpis"]["zeroSpendPercent"]=round(zc/n*100,1)
overview["spendingDist"]=ft(sp)

# Hours distributions
def hdist(s):
    bins=[-0.01,0.5,1.5,2.5,4.5,7.5,11.5,100]
    lbls=["0","1","2","3-4","5-7","8-11","12+"]
    cats=pd.cut(s.astype(float),bins=bins,labels=lbls)
    vc=cats.value_counts().sort_index()
    return [{"hours":l,"count":int(vc.get(l,0))} for l in lbls]

overview["weekdayHoursDist"]=hdist(df[C["wkd"]])
overview["weekendHoursDist"]=hdist(df[C["wke"]])

print("Computing platform evolution...")
swr_clean=df[C["swr"]].dropna()
swr_clean=swr_clean[swr_clean!="Not applicable"]
sp_order=["\u20b90","\u20b91-500","\u20b9500-1500","\u20b91500-5000","\u20b95000+"]
spbp=[]
for plat in sorted(df[C["cp"]].unique()):
    sub=df[df[C["cp"]]==plat]; e={"platform":str(plat)}
    for s in sp_order: e[s]=int((sub[C["spend"]]==s).sum())
    spbp.append(e)
hbp=[]
for plat in sorted(df[C["cp"]].unique()):
    sub=df[df[C["cp"]]==plat]["weekly"]
    hbp.append({"platform":str(plat),"mean":safe_float(sub.mean()),"median":safe_float(sub.median()),"n":int(len(sub))})
sl=[]
for (fp2,cp2),cnt in df.groupby([C["fp"],C["cp"]]).size().items():
    sl.append({"source":str(fp2),"target":str(cp2),"value":int(cnt)})
sbp=[]
for plat in df[C["cp"]].unique():
    sub=df[df[C["cp"]]==plat]; y2=(sub[C["sw"]]=="Yes").sum(); n2=(sub[C["sw"]]=="No").sum()
    sbp.append({"platform":str(plat),"yes":int(y2),"no":int(n2),"total":int(y2+n2),"switchedPct":round(y2/(y2+n2)*100,1) if (y2+n2)>0 else 0})
platform_evolution={
  "firstVsCurrent":ctd(df,C["fp"],C["cp"]),
  "switchReasons":ft(swr_clean),
  "currVsFuture":ctd(df,C["cp"],C["fp2"]),
  "futurePlatDist":ft(df[C["fp2"]]),
  "switchByPlatform":sbp,
  "spendingByPlatform":spbp,
  "spendingCategories":sp_order,
  "hoursByPlatform":hbp,
  "sankeyLinks":sl,
}

print("Loading hypothesis tests...")
wb2=openpyxl.load_workbook(STAT_XLSX)
wsh=wb2["Holm_Adjusted_Tests"]
hh=[wsh.cell(1,c).value for c in range(1,wsh.max_column+1)]
htests=[]
for r in range(2,wsh.max_row+1):
    row={hh[c]:wsh.cell(r,c+1).value for c in range(len(hh))}
    htests.append({
      "id":r-1,"researchQuestion":str(row.get("Research question","")),"test":str(row.get("Test","")),
      "n":int(row.get("N",0) or 0),"statistic":safe_float(row.get("Statistic"),4),
      "df":int(row["df"]) if row.get("df") is not None else None,
      "rawPValue":pval_fmt(row.get("Raw p-value used for Holm")),
      "effectSize":safe_float(row.get("Effect size"),4),
      "effectSizeMeasure":str(row.get("Effect-size measure","")),
      "holmAdjustedPValue":pval_fmt(row.get("Holm-adjusted p-value")),
      "significant":bool(row.get("Significant at 0.05 after Holm",False)),
      "validationNote":str(row.get("Validation note","")),
    })
wss=wb2["Sparse_Table_Checks"]
sh=[wss.cell(1,c).value for c in range(1,wss.max_column+1)]
sparse=[]
for r in range(2,wss.max_row+1):
    row={sh[c]:wss.cell(r,c+1).value for c in range(len(sh))}
    sparse.append({
      "researchQuestion":str(row.get("Research question","")),"n":int(row.get("N",0) or 0),
      "chiSqStat":safe_float(row.get("Chi-square statistic"),4),
      "df":int(row["Degrees of freedom"]) if row.get("Degrees of freedom") else None,
      "asymptoticP":pval_fmt(row.get("Asymptotic p-value (reference only)")),
      "monteCarloP":pval_fmt(row.get("Monte Carlo p-value (20,000 tables)")),
      "cramersV":safe_float(row.get("Cram\u00e9r's V"),4),
      "expectedCellsUnder5":int(row["Expected cells <5"]) if row.get("Expected cells <5") is not None else None,
    })
hypothesis_data={"tests":htests,"sparseChecks":sparse,"caveats":["These are exploratory survey analyses; association does not prove causation.","Some subgroups are small; interpret cautiously.","Estimated weekly hours are derived (weekday\u00d75 + weekend\u00d72) and not directly reported.","Survey responses are self-reported and subject to recall bias.","Results describe this sample only.","Holm-adjusted p-values control family-wise error rate across 13 tests.","Monte Carlo p-values (20,000 tables) used for sparse contingency tables."]}

print("Computing genres...")
def parse_ms(series):
    counts=Counter()
    for val in series.dropna():
        for item in str(val).split(","):
            item=item.strip()
            if item and item.lower() not in ("","other","nan"): counts[item]+=1
    return [{"genre":k,"count":v} for k,v in sorted(counts.items(),key=lambda x:-x[1])]

df_y=df[df[C["age"]]<22]; df_o=df[df[C["age"]]>=22]
genres_list=["Action","RPG","Sandbox/Open-world","Battle Royale","Strategy","Simulation","Puzzle","Sports","Horror","Other"]
cohort=[]
for g in genres_list:
    py=round((df_y[C["gc"]]==g).sum()/len(df_y)*100,1) if len(df_y)>0 else 0
    po=round((df_o[C["gc"]]==g).sum()/len(df_o)*100,1) if len(df_o)>0 else 0
    cohort.append({"genre":g,"under22":py,"22plus":po,"diff":round(py-po,1),"under22_n":int((df_y[C["gc"]]==g).sum()),"22plus_n":int((df_o[C["gc"]]==g).sum())})
genre_data={"currentGenreDist":ft(df[C["gc"]].dropna()),"risingGenres":parse_ms(df[C["gr"]]),"declineGenres":ft(df[C["gd"]].dropna()),"ageCohortComparison":cohort,"cohortSizes":{"under22":int(len(df_y)),"22plus":int(len(df_o))},"notes":["Cross-sectional cohort comparison, not a time-series forecast.","Age cohorts: under 22 (ages 14-21) vs 22 and over.","Rising/declining genre data reflect respondent expectations, not observed trends.","Genre Rise allows up to 2 choices; counts are mentions, not unique respondents."]}

print("Training ML models...")
df["switch_intent"]=(df[C["fp2"]]!="No plans to switch").astype(int)
NF=[C["age"],C["yrs"],C["wkd"],C["wke"],C["imp"],C["improve"],C["ci"],C["to"]]
CF=[C["gender"],C["occ"],C["fp"],C["cp"],C["exp"],C["freq"],C["mot"],C["gt"],C["cloud"],C["ai"]]
Xdf=df[NF+CF].copy()
Xdf[NF]=Xdf[NF].astype(float)
for c in CF: Xdf[c]=Xdf[c].fillna("Unknown")
y=df["switch_intent"]
Xtr,Xte,ytr,yte=train_test_split(Xdf,y,test_size=0.2,random_state=42,stratify=y)
pre=ColumnTransformer([("num",StandardScaler(),NF),("cat",OneHotEncoder(handle_unknown="ignore",sparse_output=False),CF)])
cvs=StratifiedKFold(n_splits=5,shuffle=True,random_state=42)
mdls={"Majority Baseline":DummyClassifier(strategy="most_frequent",random_state=42),"Logistic Regression":LogisticRegression(max_iter=1000,random_state=42,class_weight="balanced"),"Random Forest":RandomForestClassifier(n_estimators=100,random_state=42,class_weight="balanced")}
mresults=[]
for nm,clf in mdls.items():
    pipe=Pipeline([("pre",pre),("clf",clf)])
    cvsc=cross_val_score(pipe,Xtr,ytr,cv=cvs,scoring="f1_macro",n_jobs=-1)
    pipe.fit(Xtr,ytr); yp=pipe.predict(Xte)
    rpt=classification_report(yte,yp,output_dict=True,zero_division=0)
    mresults.append({"name":nm,"accuracy":round(accuracy_score(yte,yp),4),"precision":round(precision_score(yte,yp,average="binary",zero_division=0),4),"recall":round(recall_score(yte,yp,average="binary",zero_division=0),4),"f1":round(f1_score(yte,yp,average="binary",zero_division=0),4),"macroF1":round(f1_score(yte,yp,average="macro",zero_division=0),4),"cvMacroF1Mean":round(cvsc.mean(),4),"cvMacroF1Std":round(cvsc.std(),4),"confusionMatrix":confusion_matrix(yte,yp).tolist(),"perClassMetrics":{"0":{"precision":round(rpt.get("0",{}).get("precision",0),4),"recall":round(rpt.get("0",{}).get("recall",0),4),"f1":round(rpt.get("0",{}).get("f1-score",0),4),"support":int(rpt.get("0",{}).get("support",0))},"1":{"precision":round(rpt.get("1",{}).get("precision",0),4),"recall":round(rpt.get("1",{}).get("recall",0),4),"f1":round(rpt.get("1",{}).get("f1-score",0),4),"support":int(rpt.get("1",{}).get("support",0))}}})

rf_pipe=Pipeline([("pre",pre),("clf",RandomForestClassifier(n_estimators=100,random_state=42,class_weight="balanced"))])
rf_pipe.fit(Xtr,ytr)
ohe=rf_pipe.named_steps["pre"].named_transformers_["cat"]
cat_fn=list(ohe.get_feature_names_out(CF))
imps=rf_pipe.named_steps["clf"].feature_importances_
nmap={C["age"]:"Age",C["yrs"]:"Years Gaming",C["wkd"]:"Weekday Hours",C["wke"]:"Weekend Hours",C["imp"]:"Gaming Importance",C["improve"]:"Willingness to Improve",C["ci"]:"Cloud Interest",C["to"]:"Tech Openness",C["gender"]:"Gender",C["occ"]:"Occupation",C["fp"]:"First Platform",C["cp"]:"Current Platform",C["exp"]:"Experience Level",C["freq"]:"Gaming Frequency",C["mot"]:"Motivation",C["gt"]:"Gamer Type",C["cloud"]:"Cloud Gaming Used",C["ai"]:"AI Features Used"}
fi={}
for fn,im in zip(NF,imps[:len(NF)]): fi[fn]=round(float(im),4)
for i,fn in enumerate(cat_fn):
    orig=fn
    for cc in CF:
        if fn.startswith(cc[:25]): orig=cc; break
    fi[orig]=fi.get(orig,0)+round(float(imps[len(NF)+i]),4)
top_fi=sorted([{"feature":nmap.get(k,k),"importance":round(v,4)} for k,v in fi.items()],key=lambda x:-x["importance"])[:12]
td=y.value_counts()
fops={}
for col in CF:
    uvs=sorted(df[col].dropna().unique().tolist())
    fops[nmap.get(col,col)]=[str(v) for v in uvs]
prediction_data={"targetDistribution":{"noSwitch":int(td.get(0,0)),"planSwitch":int(td.get(1,0))},"trainTestSplit":{"trainN":int(len(Xtr)),"testN":int(len(Xte)),"splitRatio":"80/20","stratified":True},"models":mresults,"featureImportance":top_fi,"targetDefinition":{"label":"Plans to Switch Platform","classes":["No switch (0)","Plans to switch (1)"],"mapping":"Future platform == 'No plans to switch' -> class 0; any other response -> class 1"},"limitations":["Only 205 respondents; exploratory and uncertain.","Test set ~41 respondents; metrics have high variance.","Class imbalance handled with balanced class weights.","Survey self-report bias applies.","5-fold stratified CV on training set only.","For demonstration only; not suitable for deployment decisions."],"cvFolds":5,"randomState":42,"formOptions":fops}

print("Computing segments...")
CF2=[C["wkd"],C["wke"],C["fg1"],C["fg2"],C["fg3"],C["fg4"],C["fg5"],C["improve"],C["ci"],C["to"],C["imp"]]
CN2=["Weekday Hours","Weekend Hours","Feat: Gameplay","Feat: Story","Feat: Graphics","Feat: Competition","Feat: Social","Willingness to Improve","Cloud Interest","Tech Openness","Gaming Importance"]
dfc=df[CF2].astype(float).dropna()
scl=StandardScaler()
Xc=scl.fit_transform(dfc)
inr=[]; sils=[]; kr=list(range(2,7))
for k in kr:
    km=KMeans(n_clusters=k,random_state=42,n_init=10); lbl=km.fit_predict(Xc)
    inr.append(round(float(km.inertia_),2)); sils.append(round(float(silhouette_score(Xc,lbl)),4))
bk=kr[sils.index(max(sils))]; print(f"  Best k={bk}")
km2=KMeans(n_clusters=bk,random_state=42,n_init=10); cl=km2.fit_predict(Xc)
df.loc[dfc.index,"cluster"]=cl
cps=[]
for k in range(bk):
    mk=df["cluster"]==k; sub=df[mk]
    wk=sub["weekly"].mean(); to2=sub[C["to"]].astype(float).mean(); ci2=sub[C["ci"]].astype(float).mean()
    if wk>22 and to2>3.5: cn="High-Engagement, Tech-Open Gamers"
    elif wk>22: cn="Heavy Gamers, Traditional Preferences"
    elif wk<=12 and ci2>3: cn="Casual, Cloud-Curious Gamers"
    elif wk<=12: cn="Light Casual Gamers"
    elif to2>3.5: cn="Moderate Gamers, Tech-Forward"
    else: cn="Moderate Gamers, Mainstream"
    mn={}
    for col,nm in zip(CF2,CN2): mn[nm]=safe_float(sub[col].astype(float).mean())
    cps.append({"cluster":k,"name":cn,"size":int(mk.sum()),"means":mn,"platformDist":ft(sub[C["cp"]]),"occupationDist":ft(sub[C["occ"]]),"gamerTypeDist":ft(sub[C["gt"]]),"weeklyHoursMean":safe_float(sub["weekly"].mean()),"techOpennessMean":safe_float(to2),"cloudInterestMean":safe_float(ci2)})
hbc=[{"cluster":k,"name":cps[k]["name"],"mean":safe_float(df[df["cluster"]==k]["weekly"].mean()),"median":safe_float(df[df["cluster"]==k]["weekly"].median()),"min":safe_float(df[df["cluster"]==k]["weekly"].min()),"max":safe_float(df[df["cluster"]==k]["weekly"].max())} for k in range(bk)]
segment_data={"diagnostics":{"kRange":kr,"inertias":inr,"silhouettes":sils,"bestK":bk,"bestKSilhouette":max(sils)},"profiles":cps,"hoursByCluster":hbc,"featureNames":CN2,"notes":["K-Means clustering is exploratory; results may change with different settings.","Features were standardized before clustering.","Cluster IDs are arbitrary, not rankings.",f"Best k={bk} selected by highest silhouette score (k=2..6).",f"n={len(dfc)} respondents included."]}

methodology_data={"datasetSource":"Primary survey via Google Forms (Sep 2026)","totalResponses":206,"analysisRows":205,"excludedRows":1,"exclusionReason":"Age=100 respondent excluded; could not be verified. Raw response preserved in source workbook.","flaggedRows":6,"flaggingReason":"Six respondents had inconsistent switching reasons; set to missing, Yes/No answer retained.","derivedVariables":[{"name":"Estimated Weekly Gaming Hours","formula":"Weekday hours x 5 + Weekend hours x 2","note":"Assumes reported values represent a typical day."},{"name":"Switch Intent (Model Target)","formula":"Future platform != 'No plans to switch' -> 1; else -> 0","note":"Binary prediction target."}],"statisticalMethods":["Pearson chi-square with Monte Carlo p-values for sparse tables","Spearman rank correlation for ordinal associations","Kruskal-Wallis test for group comparisons","Mann-Whitney U test for two-group ordinal comparisons","Holm step-down correction across 13 simultaneous tests","Cramer's V and rank-biserial correlation as effect sizes","Winsorization at 95th percentile for sensitivity analysis only"],"mlMethods":["DummyClassifier (majority-class baseline)","Logistic Regression with balanced class weights","Random Forest with balanced class weights","Stratified 80/20 train-test split","Stratified 5-fold cross-validation on training set","OneHotEncoder for nominal features (no LabelEncoder)","StandardScaler for numeric features","Pipeline to prevent data leakage"],"clusteringMethods":["K-Means with standardized features","Silhouette score and inertia for k selection (k=2..6)","Cluster profiles computed as per-cluster means"],"limitations":["N=205 is a small convenience sample; not generalisable.","Self-reported survey data; subject to recall bias.","Cross-sectional; causation cannot be inferred.","Cloud Gaming (n=5) and AI-driven (n=4) categories too small for reliable inference.","Weekly hours are derived, not directly measured.","ML test set (~41 respondents) has high metric variance.","Genre Rise data are mentions per respondent (up to 2), not unique respondents."],"privacyStatement":"No individual respondent records are exposed. Only aggregate statistics, crosstabs, cluster profiles, and model metrics are published. Source workbooks excluded from repository.","missingness":[{"column":str(c),"missingCount":int(df[c].isna().sum()),"missingPercent":round(df[c].isna().sum()/n*100,1)} for c in df.columns if df[c].isna().sum()>0]}

def wj(name,data):
    p=OUT_DIR/f"{name}.json"
    with open(p,"w",encoding="utf-8") as f: json.dump(data,f,ensure_ascii=False,indent=2)
    print(f"  Written: {p}")

wj("overview",overview); wj("platform_evolution",platform_evolution); wj("hypothesis",hypothesis_data)
wj("genres",genre_data); wj("prediction",prediction_data); wj("segments",segment_data); wj("methodology",methodology_data)
print("Done.")
