# NeuroML Studio — The 3D Interactive Machine Learning Laboratory

> **"Explore Intelligence. Understand Predictions."**  
> An interactive 3D AI and Machine Learning research platform to train models, compare algorithms, visualize predictions, and explain AI decisions with SHAP. Flagship project: Physicochemical Wine Quality Prediction using Random Forest and K-Nearest Neighbors.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1NuY5aJ_2HAlA7Lp0iuy6ap9ZC-hOMrbo?usp=sharing)
[![Live Web Application](https://img.shields.io/badge/Live_Website-GitHub_Pages-06b6d4?style=for-the-badge&logo=github)](https://saiprasanna7075-prog.github.io/neuroml-studio/)
[![Jupyter Notebook](https://img.shields.io/badge/Jupyter-wine__quality__rf__vs__knn.ipynb-F37626?style=for-the-badge&logo=jupyter)](notebooks/wine_quality_rf_vs_knn.ipynb)
[![Datasets](https://img.shields.io/badge/Datasets-White%20%7C%20Red%20%7C%20Combined-emerald?style=for-the-badge&logo=databricks)](dataset/)

---

## 📓 Google Colab Notebook & Machine Learning Pipeline

The entire machine learning research pipeline is available both as an interactive **Google Colab Notebook** and as a fully interactive **Web Platform**:

* 🔗 **Google Colab (Cloud Execution)**: [Open in Google Colab](https://colab.research.google.com/drive/1NuY5aJ_2HAlA7Lp0iuy6ap9ZC-hOMrbo?usp=sharing)
* 📁 **Repository Notebook**: [`notebooks/wine_quality_rf_vs_knn.ipynb`](notebooks/wine_quality_rf_vs_knn.ipynb)
* 🐍 **CLI Script**: [`scripts/wine_quality_rf_vs_knn.py`](scripts/wine_quality_rf_vs_knn.py)
* 📊 **Dataset Directory**: [`dataset/`](dataset/)
  * ⚪ [`dataset/winequality-white.csv`](dataset/winequality-white.csv) (4,898 samples, 12 features)
  * 🔴 [`dataset/winequality-red.csv`](dataset/winequality-red.csv) (1,599 samples, 12 features)
  * 🍷 [`dataset/winequality-combined.csv`](dataset/winequality-combined.csv) (6,497 samples, 12 features)
* 🌐 **Live 3D Web Application**: [https://saiprasanna7075-prog.github.io/neuroml-studio/](https://saiprasanna7075-prog.github.io/neuroml-studio/)

### Pipeline Architecture:
1. **Data Preprocessing & EDA**:
   - Automated missing value inspection and visual heatmap
   - Removal of duplicate samples (`df.drop_duplicates()`)
   - Feature distribution histograms and box plots for all 11 physicochemical attributes
2. **Quality Target Bucketing (3-Tier Formulation)**:
   - 🔴 **Low Quality**: Ratings `≤ 4` (Scores 3, 4) — Sub-standard / high volatile acidity
   - 🟡 **Medium Quality**: Ratings `5 to 6` (Scores 5, 6) — Commercial table wine standard (~75% of dataset)
   - 🟢 **High Quality**: Ratings `≥ 7` (Scores 7, 8, 9) — Fine reserve vintage
   *(Optionally configurable to exact discrete 3–9 scores or binary Good vs Normal)*
3. **Random Forest Classifier**:
   - `n_estimators=300`, `min_samples_leaf=2`, `class_weight='balanced'`, `random_state=42`
   - 5-Fold Stratified Cross Validation on training split (70:30)
   - High-fidelity Gini feature importance ranking
   - Full **SHAP (SHapley Additive exPlanations)**: TreeExplainer, Beeswarm Summary, Mean |SHAP| Bar Plot, and local single-sample Waterfall plot
4. **K-Nearest Neighbors (KNN) Classifier**:
   - Leak-free `StandardScaler()` fit strictly on training partitions
   - Systematic hyperparameter search across `K = 1 to 15` with 5-fold CV to determine optimal `K` (typically `K = 7`)
   - Evaluation with Confusion Matrix, Weighted Precision, Recall, and F1-score
5. **Model Arena Head-to-Head Comparison**:
   - Side-by-side performance evaluation table and comparative multi-metric bar charts
   - Automated champion selection based on test accuracy and generalization fidelity

---

## 🌟 Executive Summary

**NeuroML Studio** is a full-stack, production-quality AI and Machine Learning web application designed for B.Tech AIML capstone reviews, academic viva voce defense, faculty demonstrations, and portfolio presentation.

It unites **Three.js 3D spatial visualizations**, **FastAPI backend machine learning pipelines**, **genuine Scikit-Learn training**, and **SHAP (SHapley Additive exPlanations) game-theoretic interpretability** into a dark futuristic laboratory experience.

---

## 🏛️ System Architecture

```
AIML web/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI entrypoint, CORS, lifespan startup
│   │   ├── api/
│   │   │   ├── health.py              # GET /api/health
│   │   │   ├── datasets.py            # Upload, list, summary, preview, correlations
│   │   │   ├── models.py              # Train, predict, SHAP explain, arena compare
│   │   │   └── experiments.py         # SQLite experiment history logs
│   │   ├── ml/
│   │   │   ├── preprocessing.py       # Delimiter auto-sniff, 70:30 leak-free split, scaling
│   │   │   ├── training.py            # RF, KNN, Decision Tree, Logistic, SVM, GBM, MLP
│   │   │   ├── evaluation.py          # Accuracy, F1 macro/weighted, Confusion Matrix, MAE, R²
│   │   │   ├── prediction.py          # Single sample inference with fitted pipeline
│   │   │   └── explainability.py      # SHAP TreeExplainer (Beeswarm & Local Waterfall)
│   │   ├── schemas/                   # Pydantic request/response data contracts
│   │   ├── services/                  # Business logic (dataset, model, experiment services)
│   │   └── utils/
│   │       └── database.py            # SQLite schema initialization and persistence
│   ├── saved_models/                  # Serialized Joblib pipelines (model + scaler + meta)
│   ├── tests/                         # Pytest automated test suite (9 comprehensive tests)
│   └── requirements.txt               # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/
│   │   │   │   ├── HeroCanvas.tsx             # 3D Rotating AI Core, Synapses, Parallax
│   │   │   │   ├── KNNSpaceVisualizer.tsx     # 3D Feature Space with live K nearest rays
│   │   │   │   ├── RandomForest3DVisualizer.tsx # 3D Holographic forest with voting core
│   │   │   │   ├── NeuralNetworkVisualizer.tsx# 3D Feedforward multi-layer perceptron
│   │   │   │   └── KMeansClusterVisualizer.tsx# 3D Dynamic centroid clustering
│   │   │   ├── charts/
│   │   │   │   ├── ConfusionMatrixChart.tsx   # High-DPI discrete error matrix heatmap
│   │   │   │   ├── ShapBeeswarmChart.tsx      # Global SHAP sample distribution plot
│   │   │   │   ├── ShapWaterfallChart.tsx     # Local sample waterfall attribution
│   │   │   │   ├── FeatureImportanceChart.tsx # Scikit-Learn Gini impurity ranking
│   │   │   │   ├── CorrelationHeatmap.tsx     # Pearson pairwise correlation matrix
│   │   │   │   └── ResidualPlot.tsx           # Actual vs Predicted regression scatter
│   │   │   └── layout/
│   │   │       ├── Header.tsx                 # Navigation header, health & dataset badge
│   │   │       └── Sidebar.tsx                # Modular navigation drawer
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx              # Overview & 3D Hero section
│   │   │   ├── WineQualityPage.tsx            # Flagship Wine AI module (RF vs KNN)
│   │   │   ├── AlgorithmUniversePage.tsx      # 16-model categorized universe
│   │   │   ├── AlgorithmExplorerPage.tsx      # 3D interactive laboratory switcher
│   │   │   ├── ModelArenaPage.tsx             # Side-by-side RF vs KNN benchmark arena
│   │   │   ├── ExplainableAiPage.tsx          # Dedicated SHAP transparency lab
│   │   │   ├── DataStudioPage.tsx             # Tabular preview, distributions & correlations
│   │   │   ├── PredictionPlaygroundPage.tsx   # Custom wine sliders & live prediction
│   │   │   ├── CustomWorkspacePage.tsx        # Drag & drop CSV upload & pipeline train
│   │   │   ├── DemonstrationModePage.tsx      # 13-step academic viva walkthrough
│   │   │   ├── LearnModePage.tsx              # Educational guide & viva Q&A answers
│   │   │   └── ExperimentsPage.tsx            # SQLite run logs
│   │   ├── services/
│   │   │   └── api.ts                         # Frontend fetch client & endpoints
│   │   ├── types/
│   │   │   └── index.ts                       # TypeScript interfaces
│   │   ├── App.tsx                            # Root application component
│   │   └── index.css                          # Futuristic theme & glassmorphic styling
│   ├── package.json
│   └── vite.config.ts                         # Vite config with Tailwind & proxy
│
├── data/
│   ├── winequality-white.csv                  # UCI White Wine (4,898 instances, semicolon sep)
│   └── winequality-red.csv                    # UCI Red Wine (1,599 instances, semicolon sep)
└── README.md
```

---

## 🔬 Flagship Project: Wine Quality Intelligence

### 1. Dataset Overview
- **Source**: UCI Machine Learning Repository (*Cortez et al., 2009*).
- **White Wine**: 4,898 rows, 12 columns (semicolon-delimited `";"`).
- **Red Wine**: 1,599 rows, 12 columns.
- **Input Features (11 Physicochemical Attributes)**:
  1. `fixed acidity` (tartaric acid - g/dm³)
  2. `volatile acidity` (acetic acid - g/dm³)
  3. `citric acid` (g/dm³)
  4. `residual sugar` (g/dm³)
  5. `chlorides` (sodium chloride - g/dm³)
  6. `free sulfur dioxide` (mg/dm³)
  7. `total sulfur dioxide` (mg/dm³)
  8. `density` (g/cm³)
  9. `pH` (acidity scale)
  10. `sulphates` (potassium sulphate - g/dm³)
  11. `alcohol` (% by volume)
- **Target Feature**: `quality` (Sensory score between 3 and 9).

### 2. Leak-Free Preprocessing (70:30 Academic Split)
- **Train / Test Partition**: 70% training (3,428 samples) and 30% testing (1,470 samples).
- **Reproducibility**: User-configurable random seed (default `42`).
- **Feature Scaling**:
  - **K-Nearest Neighbors (KNN)**: Strict `StandardScaler` fitted **only on `X_train`** (`scaler.fit(X_train)`), and applied to `X_test` via `scaler.transform(X_test)`. **Zero data leakage**.
  - **Random Forest**: Trees use monotonic decision thresholds; scaling is omitted to maintain raw numerical meaning.

### 3. Model Comparison (Random Forest vs KNN)
- **Random Forest Classifier**:
  - Bagged ensemble of 100 de-correlated decision trees.
  - Achieves superior Macro F1 and accuracy due to non-linear chemical interaction modeling.
- **K-Nearest Neighbors (KNN)**:
  - Instance-based local distance estimation (K=5, distance-weighted, Euclidean/Manhattan).
  - Effective baseline for local neighborhood clustering.

### 4. Explainable AI with SHAP
- **Engine**: Genuine `shap.TreeExplainer` for fitted Random Forest models.
- **Global Explanations**: Summary Beeswarm plot ranking features by mean absolute SHAP value $|\phi_i|$ and coloring samples from low (cyan) to high (rose).
- **Local Explanations**: Prediction waterfall decomposing $f(x)$ from the baseline expected value $E[f(x)]$ into positive and negative individual contributions.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python**: 3.10+ (tested on Python 3.11.9)
- **Node.js**: v18+ (tested on v24.21.0, npm 11.19.0)

### 1. Install Backend Dependencies
```powershell
pip install -r backend/requirements.txt
```

### 2. Run Backend Server
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend
```
- API Documentation (Swagger UI): `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### 3. Install Frontend Dependencies & Run
In a separate terminal:
```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
Open **`http://localhost:5173`** in your browser.

---

## 🌐 Universal Compatibility & Deployment

NeuroML Studio is designed to **work everywhere** across all operating systems, platforms, and devices without modification:

### 1. One-Click Launchers
- **Windows**: Double-click `START_STUDIO.bat` — automatically starts the FastAPI backend, Vite dev server, and launches your browser.
- **macOS & Linux**: Run `./start_studio.sh` (make executable with `chmod +x start_studio.sh`).

### 2. Local Wi-Fi & Mobile Access
Both Vite and FastAPI bind to `0.0.0.0`, allowing instant access from smartphones, iPads, and other laptops connected to the same Wi-Fi network:
- Open `http://<YOUR_COMPUTER_IP>:5173` on any mobile device or external browser.

### 3. Cloud & Vercel Deployment
- Fully optimized for **Vercel**, **Netlify**, and static hosting platforms.
- Equipped with a high-fidelity **In-Memory Cloud Hybrid ML Engine** in `api.ts`.
- If the Python backend is not reachable or deployed as a static web app, every feature (all 37 models, predictions, SHAP beeswarm/waterfall plots, custom dataset CSV upload, and model arena comparison) continues to operate seamlessly client-side with zero errors.

### 4. Docker & Container Deployment
Run the complete stack with a single command anywhere Docker is installed:
```bash
docker compose up --build
```
Access the application at `http://localhost:8000`.

---

## 🧪 Automated Testing

Automated tests verify preprocessing logic, no-leakage guarantees, model training, evaluation metrics, and SHAP TreeExplainer:

```powershell
python -m pytest -o pythonpath=backend backend/tests -v
```

**Results (100% Passed)**:
- `test_health_endpoint` PASSED
- `test_list_datasets` PASSED
- `test_train_rf_and_predict_flow` PASSED
- `test_shap_random_forest` PASSED
- `test_detect_delimiter` PASSED
- `test_prepare_data_pipeline_70_30_split` PASSED
- `test_no_data_leakage_in_scaling` PASSED
- `test_rf_and_knn_classification` PASSED
- `test_rf_regression` PASSED

---

## 🎓 Academic Viva Voce Defense Guide

The application features a dedicated **Viva Presentation Mode** following the 13 sequential academic steps:
1. **Introduce Wine Dataset**: 11 physicochemical measurements from Portuguese *Vinho Verde*.
2. **Inspect Dimensions**: 4,898 instances, target distribution across quality scores 3–9.
3. **Demonstrate Preprocessing**: Delimiter sniffing, duplicate detection, leak-free 70:30 partition.
4. **Train Random Forest**: Bagged decision tree ensemble with Gini impurity gain.
5. **Train KNN**: Distance-weighted instance learner with training-only `StandardScaler`.
6. **Compare Actual Results**: Side-by-side accuracy, macro F1, and confusion matrices.
7. **Feature Importance**: Scikit-Learn tree split purity gain.
8. **SHAP Global Beeswarm**: Cooperative game-theoretic Shapley distribution across test samples.
9. **Select Individual Sample**: Picking a test instance for local inspection.
10. **SHAP Local Waterfall**: Baseline $E[f(x)]$ push-higher / push-lower attribution breakdown.
11. **Custom Measurements**: Entering experimental laboratory measurements.
12. **Model Inference**: Real-time prediction with discrete class probabilities.
13. **Scientific Findings**: Summarizing why alcohol, volatile acidity, and free SO2 drive wine ratings.

---

## 🔒 Security & Performance Features
- **Zero Hardcoded Secrets**: Secure local execution.
- **Resource Bounds**: SHAP evaluation bounded to prevent UI blocking.
- **Asynchronous Execution**: High-throughput FastAPI endpoints.
- **WebGL Fallback**: Graceful static rendering when hardware acceleration is disabled.
- **Persistence**: Experiments persisted in SQLite (`experiments.db`) and pipelines in Joblib (`.joblib`).
