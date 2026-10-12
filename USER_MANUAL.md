# NeuroML Studio — Official Operations & User Manual

Welcome to **NeuroML Studio**, the 3D Interactive Machine Learning Laboratory. This manual provides complete instructions for operating every feature, understanding machine learning outputs, and conducting academic demonstrations and viva voce reviews.

---

## 📑 Table of Contents

1. [Quick Access & Running the Studio](#1-quick-access--running-the-studio)
2. [Interface Layout & Navigation](#2-interface-layout--navigation)
3. [Module 1: Dashboard & 3D AI Core](#3-module-1-dashboard--3d-ai-core)
4. [Module 2: Wine Quality Intelligence (Flagship)](#4-module-2-wine-quality-intelligence-flagship)
5. [Module 3: Model Arena (Algorithm Comparison)](#5-module-3-model-arena-algorithm-comparison)
6. [Module 4: SHAP Explainable AI Lab](#6-module-4-shap-explainable-ai-lab)
7. [Module 5: 3D Algorithm Explorer](#7-module-5-3d-algorithm-explorer)
8. [Module 6: Predict a Wine (Custom Playground)](#8-module-6-predict-a-wine-custom-playground)
9. [Module 7: Data Studio (Analytics & Correlation)](#9-module-7-data-studio-analytics--correlation)
10. [Module 8: Custom ML Workspace (CSV Uploads)](#10-module-8-custom-ml-workspace-csv-uploads)
11. [Module 9: Academic Demonstration Mode (13-Step Viva)](#11-module-9-academic-demonstration-mode-13-step-viva)
12. [Module 10: Educational Mode & Viva Defense Guide](#12-module-10-educational-mode--viva-defense-guide)
13. [Module 11: Experiment History (SQLite Persistence)](#13-module-11-experiment-history-sqlite-persistence)
14. [Troubleshooting & Terminal Commands](#14-troubleshooting--terminal-commands)

---

## 1. Quick Access & Running the Studio

The application runs as two connected services (Frontend + Backend):

| Service | Address | Description |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:5173](http://localhost:5173) | Interactive React 19 + Three.js 3D Web Interface |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | FastAPI Python ML Engine (Scikit-Learn, SHAP, SQLite) |
| **API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive Swagger UI for all API endpoints |
| **Health Ping** | [http://localhost:8000/api/health](http://localhost:8000/api/health) | System health & connectivity status |

### How to Start If Closed
Open two terminals in `c:\Users\saipr\Downloads\AIML web`:

**Terminal 1 (Backend):**
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
cmd.exe /c "npm run dev"
```

---

## 2. Interface Layout & Navigation

- **Top Navigation Bar**:
  - Displays the **NeuroML Studio** logo.
  - Active Dataset indicator (e.g. `UCI White Wine`).
  - Real-time Backend Health heartbeat (green pulse indicates live Scikit-Learn/SHAP engine).
  - Quick action buttons for **Viva Presentation Mode** and **Learn Guide**.
- **Collapsible Sidebar (Left)**:
  - Gives 1-click access to all 12 modules.
  - Badges highlight key modules (`Flagship`, `3D`, `VS`, `XAI`, `Upload`, `Walkthrough`).
- **Main Viewport (Right)**:
  - Renders the active module with dark futuristic AI laboratory aesthetics and high-DPI crisp styling.

---

## 3. Module 1: Dashboard & 3D AI Core

### What It Does:
The central entrance showcasing the laboratory's operational status and 3D visual experience.

### How to Use:
1. **Interactive 3D Hero**:
   - Move your mouse cursor across the hero scene. The camera will respond with a smooth 3D parallax tilt.
   - Observe the central rotating icosahedron cyber core and orbital rings.
   - Watch the animated data pulses traveling between neural layers along synaptic connection lines.
2. **Launch Shortcuts**:
   - Click **"Launch ML Studio"** to jump into the Wine Quality module.
   - Click **"Explore Wine Quality AI"** to open the flagship benchmark.
3. **Live System Metrics**:
   - Inspect the total algorithm count (16+), loaded datasets, and logged SQLite runs.
4. **Your ML Workspace Cards**:
   - Browse the featured algorithm cards (Random Forest, KNN, SHAP, MLP). Click **"Launch Workspace"** on any card to configure and train that model.

---

## 4. Module 2: Wine Quality Intelligence (Flagship)

### What It Does:
The primary academic showcase: trains **Random Forest** and **K-Nearest Neighbors** on 11 physicochemical wine features to predict sensory quality scores (3 to 9).

### Step-by-Step Instructions:

#### Step 1: Select Your Dataset
- Click on **"Wine Quality (White)"** (4,898 samples) or **"Wine Quality (Red)"** (1,599 samples).
- Notice the dataset card automatically shows rows, columns, duplicate count, and missing values (0 missing).

#### Step 2: Configure Preprocessing
- **Train/Test Split**: Default is **70:30** (3,428 train samples : 1,470 test samples).
- **Random Seed**: Kept at `42` for exact reproducibility.
- **Prediction Task**: Choose between:
  - `Classification`: Predicts discrete wine quality grades (3, 4, 5, 6, 7, 8, 9).
  - `Regression`: Predicts continuous wine scores (e.g., 5.84 / 10).
- **Deduplication**: Toggle *"Deduplicate Identical Samples"* if you wish to train strictly on unique chemical assays.

#### Step 3: Choose Model & Tune Hyperparameters
Click on the **Random Forest** or **K-Nearest Neighbors** tab:

- **For Random Forest**:
  - `Number of Trees (n_estimators)`: Adjust the slider (default: 100 trees).
  - `Max Tree Depth`: Set constraint (`None` for full depth, or `5`, `10`, `15`).
  - `Min Samples Split`: Minimum samples needed to split a node (default: 2).
  - `Min Samples Leaf`: Minimum samples needed in a terminal leaf (default: 1).
  - *Scaling Rule*: Random Forest does **not** scale features because tree partition decisions are monotonic.
- **For K-Nearest Neighbors (KNN)**:
  - `Number of Neighbors (K)`: Set slider from 1 to 25 (default: 5).
  - `Distance Metric`: Choose `Euclidean (L2)` or `Manhattan (L1)`.
  - `Weighting`: Choose `Uniform` (equal votes) or `Distance Weighted` (closer wines count more).
  - *Scaling Rule*: KNN uses `StandardScaler` fitted **strictly on X_train** to prevent data leakage.

#### Step 4: Click "Train Model"
- Watch the live training status.
- Results appear in milliseconds.

#### Step 5: Interpret Evaluation Metrics
- **Test Accuracy**: Overall percentage of test wines correctly scored.
- **Macro F1-Score**: Harmonic mean of precision and recall averaged evenly across all quality classes (crucial for imbalanced wine data).
- **Weighted Precision & Recall**: Class-size weighted predictive metrics.
- **Confusion Matrix**:
  - Rows represent **Actual Quality**.
  - Columns represent **Predicted Quality**.
  - Green diagonal cells = correct classifications.
  - Red off-diagonal cells = misclassifications.
- **Feature Importance Chart**:
  - Lists which physicochemical properties (e.g. `alcohol`, `volatile acidity`, `free sulfur dioxide`) had the highest Gini impurity split reduction across the trees.

---

## 5. Module 3: Model Arena (Algorithm Comparison)

### What It Does:
Conducts a fair, head-to-head battle between **Random Forest** and **K-Nearest Neighbors** on the **exact same 70:30 test split**.

### How to Use:
1. Select the comparison task: `Classification` or `Regression`.
2. Click **"Rerun Battle"**.
3. The backend fits both models on identical training partitions and evaluates them on identical test sets.
4. **Arena Victor Banner**:
   - Automatically declares the winning model based on real evaluation results (e.g. highest Accuracy or highest R² score).
5. **Side-by-Side Comparison**:
   - Compare training execution time (latency in ms).
   - Compare Accuracy and F1 bars side-by-side.
   - Inspect both Confusion Matrices simultaneously to observe where KNN makes errors versus Random Forest.

---

## 6. Module 4: SHAP Explainable AI Lab

### What It Does:
Calculates genuine game-theoretic Shapley values using `shap.TreeExplainer` on fitted Random Forest models to explain *why* predictions were made.

### How to Use:

#### 1. Inspecting the Global Beeswarm Plot:
- Look at the vertical feature axis: features are ranked from top to bottom by **overall global importance**.
- Look at the horizontal axis:
  - Points to the **right** (+) push the wine score higher.
  - Points to the **left** (-) push the wine score lower.
- Look at the point colors:
  - **Sky Blue** = Low measurement value for that feature.
  - **Rose Red** = High measurement value for that feature.
- *Insight*: High alcohol (red dots) clusters on the right (+ impact), demonstrating that higher alcohol content strongly pushes predicted wine quality upward.

#### 2. Inspecting the Local Waterfall Plot:
- Use the **"Select Test Sample"** dropdown at the top to pick an individual wine sample (e.g. `Test Sample #0`, `#5`, `#12`).
- **Base Value $E[f(x)]$**: The average baseline prediction across the dataset.
- **Green Bars (+)**: Chemical attributes of this wine that pushed its rating above average.
- **Red Bars (-)**: Chemical attributes that dragged its rating below average.
- **Final Model Output**: The sum of the base value plus all feature contributions equals the exact model output.

---

## 7. Module 5: 3D Algorithm Explorer

### What It Does:
Provides interactive 3D geometric representations of machine learning algorithms in 3D feature space.

### Available 3D Visualizers:

1. **KNN Feature Space**:
   - Shows 3D scatter points for classes 5 (rose), 6 (cyan), and 7 (emerald).
   - A yellow target represents the query wine.
   - Adjust the **K Slider** (1 to 15) to see the yellow target dynamically draw distance rays to the closest neighbors and update the live vote count!
   - Switch between **Euclidean (L2)** and **Manhattan (L1)** distance metrics.
2. **Random Forest 3D Forest**:
   - Displays a holographic circular ring of 3D decision trees.
   - Adjust the **Tree Count Slider** (3 to 15 trees).
   - Animated pulses travel down the tree branches to the central purple Aggregation Core, visually illustrating the ensemble majority voting process.
3. **Deep Neural Network (MLP)**:
   - Displays input layer (11 physicochemical inputs), hidden ReLU layers (8 × 6 neurons), and output quality nodes.
   - Adjust the **Pulse Speed Slider** to accelerate feedforward signal propagation.
4. **K-Means Clustering**:
   - Visualizes 3D data point clouds with floating centroid octahedrons.
   - Switch between **K = 2, 3, or 4 clusters** to observe immediate re-partitioning.

---

## 8. Module 6: Predict a Wine (Custom Playground)

### What It Does:
Allows you to enter custom laboratory measurements for a wine sample and generate real-time model predictions and instant SHAP explanations.

### How to Use:
1. **Choose Model**: Select `Random Forest` or `KNN (Scaled)`.
2. **Use Quick Presets** (optional):
   - Click **"High-Quality Crisp Wine"**: Loads optimal chemistry (high alcohol 12.8%, low volatile acidity 0.18 g/dm³).
   - Click **"Standard Table Wine"**: Loads balanced table wine averages.
   - Click **"Oxidized / Low-Quality Wine"**: Loads defective chemistry (high volatile acidity 0.75 g/dm³, low alcohol 8.9%).
3. **Adjust Any of the 11 Sliders**:
   - *Fixed Acidity*, *Volatile Acidity*, *Citric Acid*, *Residual Sugar*, *Chlorides*, *Free SO2*, *Total SO2*, *Density*, *pH*, *Sulphates*, *Alcohol*.
4. **Click "Predict Wine Quality"**:
   - Displays predicted **Quality Score** (e.g. `Score 7 / 10`).
   - Displays full **Class Probability Distribution** (e.g. `Quality 6: 22%`, `Quality 7: 68%`, `Quality 8: 10%`).
   - Automatically renders the **SHAP Waterfall Attribution** for this custom sample.

---

## 9. Module 7: Data Studio (Analytics & Correlation)

### What It Does:
Comprehensive exploration of dataset distributions, outliers, and linear relationships.

### Tabs:
1. **Tabular Preview**:
   - Browse raw dataset rows with pagination (50 rows per page).
2. **Correlation Matrix**:
   - Heatmap of Pearson correlation coefficients ($r$) for every pair of chemical features.
   - Red cells indicate strong positive correlation (e.g., density vs residual sugar $r \approx +0.84$).
   - Blue cells indicate strong negative correlation (e.g., density vs alcohol $r \approx -0.69$).
3. **Feature Distributions**:
   - Discrete frequency breakdown of all wine quality classes in the loaded dataset.

---

## 10. Module 8: Custom ML Workspace (CSV Uploads)

### What It Does:
Upload any external CSV dataset to train and evaluate custom machine learning pipelines.

### Workflow:
1. **Upload File**: Drag-and-drop or select any `.csv` or `.txt` file (up to 20MB). Automatic delimiter detection identifies commas, semicolons, tabs, or pipes.
2. **Select Target Column**: Pick which column to predict from the dropdown.
3. **Select Task Type**: Choose `Classification` or `Regression`.
4. **Select Algorithm**: Pick from 8 implemented algorithms:
   - *Random Forest*, *KNN*, *Decision Tree*, *Logistic Regression*, *Linear Regression*, *SVM*, *Gradient Boosting*, *Multi-Layer Perceptron*.
5. **Configure Options**:
   - Train/Test Split (70:30, 80:20, 75:25).
   - Toggle `StandardScaler` and `Drop Duplicate Rows`.
6. **Click "Train Model Pipeline"**:
   - Inspect evaluation metrics, Confusion Matrix, and Feature Importances.
7. **Export Artifacts**: Click **"Export Artifacts (JSON)"** to download the complete experiment configuration and results.

---

## 11. Module 9: Academic Demonstration Mode (13-Step Viva)

### What It Does:
A pre-sequenced, 13-milestone guided presentation wizard tailored for university capstone demonstrations and faculty defense.

### How to Present:
Use the **"Next Step"** and **"Previous Step"** buttons to navigate through the 13 milestones:

- **Step 1**: Introduce Wine Dataset (source, Portuguese *Vinho Verde*, 11 chemical tests).
- **Step 2**: Inspect Dimensions & Target Distribution (4,898 instances, scores 3 to 9).
- **Step 3**: Preprocessing & 70:30 Split (no-leakage protocol).
- **Step 4**: Train Random Forest (bagging, 100 trees, accuracy & F1).
- **Step 5**: Train KNN (distance-weighted, K=5, fitted scaler).
- **Step 6**: Compare Actual Results (side-by-side performance).
- **Step 7**: Feature Importances (Gini impurity split ranking).
- **Step 8**: SHAP Global Beeswarm (game-theoretic feature attribution).
- **Step 9**: Select Individual Sample (sample selection for local audit).
- **Step 10**: SHAP Local Waterfall (push higher vs push lower contributions).
- **Step 11**: Custom Measurements (entering experimental laboratory values).
- **Step 12**: Model Inference (live prediction + class probabilities).
- **Step 13**: Academic Summary (why Random Forest outperforms KNN and key chemical drivers).

---

## 12. Module 10: Educational Mode & Viva Defense Guide

### What It Does:
Provides ready-to-answer technical explanations for typical examiner questions.

### Key Viva Q&As Covered:
- *Why is Random Forest well-suited for Wine Quality Prediction?*
- *Why is KNN an ideal comparison baseline?*
- *Why is Feature Scaling strictly mandatory for KNN but unnecessary for Random Forest?*
- *What is Data Leakage and how is it prevented in this project?*
- *Why is a 70:30 Train/Test Split used?*
- *Why is Accuracy alone misleading on the Wine Quality dataset?*
- *How does SHAP TreeExplainer work mathematically?*
- *How should you interpret a Confusion Matrix during a Viva?*

---

## 13. Module 11: Experiment History (SQLite Persistence)

### What It Does:
Logs every model trained in the studio to a local SQLite database file (`experiments.db`).

### Features:
- Records Run ID, Experiment Name, Algorithm, Dataset, Key Metric (Accuracy or R²), Status, and Timestamp.
- Data persists across server restarts and browser refreshes.
- Click **"Refresh Runs"** to pull the latest logged runs.

---

## 14. Troubleshooting & Terminal Commands

### Issue: "Connecting to AI Engine..." in Header
- **Cause**: Backend server is not running on port 8000.
- **Fix**: Run `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend` in the project root.

### Issue: Semicolon vs Comma Delimiters in Uploaded CSV
- **Behavior**: NeuroML Studio's backend uses an automatic delimiter sniffer (`csv.Sniffer` + fallback heuristic). Both standard commas `,` and European wine semicolons `;` parse automatically.

### Running Backend Unit Tests
To verify all 9 core ML pipeline tests:
```powershell
python -m pytest -o pythonpath=backend backend/tests -v
```

---

*NeuroML Studio — Built for high-dimensional scientific computing, interactive machine learning education, and transparent AI research.*
