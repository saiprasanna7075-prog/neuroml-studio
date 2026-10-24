"""
Wine Quality AI Pipeline — Random Forest vs KNN with SHAP Explainability
========================================================================
Origin: Google Colab (https://colab.research.google.com/drive/1NuY5aJ_2HAlA7Lp0iuy6ap9ZC-hOMrbo?usp=sharing)
Live Web Application: https://saiprasanna7075-prog.github.io/neuroml-studio/

Features:
- Automated missing values & deduplication
- 3-Tier Target Bucketing: Low (<=4), Medium (5-6), High (>=7)
- 300-tree Balanced Random Forest Classifier with 5-Fold Cross Validation
- StandardScaler with K-search (K=1 to 15) for KNN Classifier
- Full evaluation: Accuracy, Precision, Recall, F1, Confusion Matrices
- SHAP TreeExplainer (Beeswarm, Bar, Waterfall plots)
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# ============================================================
# 1. Load Dataset
# ============================================================
data_candidates = [
    "data/winequality-white.csv",
    "../data/winequality-white.csv",
    "winequality-white.csv"
]
csv_path = None
for p in data_candidates:
    if os.path.exists(p):
        csv_path = p
        break

if csv_path:
    df = pd.read_csv(csv_path, sep=";")
else:
    url = "https://archive.ics.uci.edu/ml/machine-learning-databases/wine-quality/winequality-white.csv"
    print(f"Loading dataset directly from UCI Machine Learning Repository: {url}")
    df = pd.read_csv(url, sep=";")

print(f"Dataset Initial Shape: {df.shape}")

# Missing Values Check
print("\nMissing Values Count:")
print(df.isnull().sum())

# Deduplication
initial_rows = len(df)
df = df.drop_duplicates().reset_index(drop=True)
print(f"\nRemoved {initial_rows - len(df)} duplicate rows. New Shape: {df.shape}")

# ============================================================
# 2. Target Bucketing (Low / Medium / High)
# ============================================================
USE_BUCKETED_TARGET = True

def quality_to_label(q):
    if q <= 4:
        return "low"
    elif q <= 6:
        return "medium"
    else:
        return "high"

X = df.drop("quality", axis=1)

if USE_BUCKETED_TARGET:
    y = df["quality"].apply(quality_to_label)
else:
    y = df["quality"]

print("\nClass distribution:")
print(y.value_counts())

# Train-Test Split (70:30 Stratified)
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.30,
    random_state=42,
    stratify=y
)
print(f"\nTraining Samples: {len(X_train)} | Testing Samples: {len(X_test)}")

# ============================================================
# 3. Train Random Forest Model
# ============================================================
print("\n" + "=" * 50)
print("TRAINING RANDOM FOREST CLASSIFIER")
print("=" * 50)

rf_model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    min_samples_leaf=2,
    class_weight="balanced",
    random_state=42
)

# 5-Fold Cross Validation
rf_cv_scores = cross_val_score(rf_model, X_train, y_train, cv=5, scoring="accuracy")
rf_cv_accuracy = rf_cv_scores.mean()
print(f"Random Forest 5-Fold CV Accuracy: {rf_cv_accuracy * 100:.2f}% (+/- {rf_cv_scores.std() * 100:.2f}%)")

# Fit on training data
rf_model.fit(X_train, y_train)

# Predictions & Metrics
y_pred_rf = rf_model.predict(X_test)
rf_accuracy = accuracy_score(y_test, y_pred_rf)
rf_precision = precision_score(y_test, y_pred_rf, average="weighted", zero_division=0)
rf_recall = recall_score(y_test, y_pred_rf, average="weighted", zero_division=0)
rf_f1 = f1_score(y_test, y_pred_rf, average="weighted", zero_division=0)

print(f"\nRandom Forest Test Accuracy: {rf_accuracy * 100:.2f}%")
print(f"Random Forest Weighted Precision: {rf_precision * 100:.2f}%")
print(f"Random Forest Weighted Recall: {rf_recall * 100:.2f}%")
print(f"Random Forest Weighted F1: {rf_f1 * 100:.2f}%")
print("\nClassification Report:\n", classification_report(y_test, y_pred_rf, zero_division=0))

# ============================================================
# 4. Feature Scaling & KNN Hyperparameter Tuning
# ============================================================
print("\n" + "=" * 50)
print("TRAINING KNN CLASSIFIER (WITH SCALING & BEST K)")
print("=" * 50)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

k_values = range(1, 16)
k_scores = []
for k in k_values:
    knn_temp = KNeighborsClassifier(n_neighbors=k)
    scores = cross_val_score(knn_temp, X_train_scaled, y_train, cv=5, scoring="accuracy")
    k_scores.append(scores.mean())

best_k = list(k_values)[int(np.argmax(k_scores))]
print(f"Optimal K-value determined: K = {best_k} (CV Accuracy: {max(k_scores) * 100:.2f}%)")

knn_model = KNeighborsClassifier(n_neighbors=best_k)
knn_model.fit(X_train_scaled, y_train)

knn_cv_scores = cross_val_score(knn_model, X_train_scaled, y_train, cv=5, scoring="accuracy")
knn_cv_accuracy = knn_cv_scores.mean()

y_pred_knn = knn_model.predict(X_test_scaled)
knn_accuracy = accuracy_score(y_test, y_pred_knn)
knn_precision = precision_score(y_test, y_pred_knn, average="weighted", zero_division=0)
knn_recall = recall_score(y_test, y_pred_knn, average="weighted", zero_division=0)
knn_f1 = f1_score(y_test, y_pred_knn, average="weighted", zero_division=0)

print(f"\nKNN Test Accuracy: {knn_accuracy * 100:.2f}%")
print(f"KNN Weighted Precision: {knn_precision * 100:.2f}%")
print(f"KNN Weighted Recall: {knn_recall * 100:.2f}%")
print(f"KNN Weighted F1: {knn_f1 * 100:.2f}%")
print("\nClassification Report:\n", classification_report(y_test, y_pred_knn, zero_division=0))

# ============================================================
# 5. Model Arena Comparison
# ============================================================
print("\n" + "=" * 50)
print("RANDOM FOREST vs KNN ARENA COMPARISON")
print("=" * 50)

comparison = pd.DataFrame({
    "Model": ["Random Forest", f"KNN (K={best_k})"],
    "Test Accuracy": [rf_accuracy * 100, knn_accuracy * 100],
    "5-Fold CV Accuracy": [rf_cv_accuracy * 100, knn_cv_accuracy * 100],
    "Precision": [rf_precision * 100, knn_precision * 100],
    "Recall": [rf_recall * 100, knn_recall * 100],
    "F1 Score": [rf_f1 * 100, knn_f1 * 100]
}).round(2)

print(comparison.to_string(index=False))

if rf_accuracy > knn_accuracy:
    winner = "Random Forest"
elif knn_accuracy > rf_accuracy:
    winner = f"KNN (K={best_k})"
else:
    winner = "Tie"
print(f"\n🏆 Champion Model: {winner}")

# ============================================================
# 6. SHAP Explainability (Optional)
# ============================================================
try:
    import shap
    print("\nComputing SHAP explanations...")
    explainer = shap.TreeExplainer(rf_model)
    shap_vals = explainer.shap_values(X_test.iloc[:100])
    print("SHAP TreeExplainer successfully initialized and evaluated on test samples.")
except ImportError:
    print("\nSHAP library not installed locally. Run 'pip install shap' to visualize waterfall & summary plots.")

print("\nPipeline execution complete!")
