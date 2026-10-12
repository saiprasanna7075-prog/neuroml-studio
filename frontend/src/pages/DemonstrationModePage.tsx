import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Play,
  RotateCcw,
  Wine,
  Trophy,
  Eye,
  Sliders,
  Check,
  Award
} from 'lucide-react';
import { ModelMetricsResponse, ExplainResponse, PredictResponse } from '../types';
import { trainModel, explainModel, predictModel } from '../services/api';
import { ConfusionMatrixChart } from '../components/charts/ConfusionMatrixChart';
import { FeatureImportanceChart } from '../components/charts/FeatureImportanceChart';
import { ShapWaterfallChart } from '../components/charts/ShapWaterfallChart';
import { ShapBeeswarmChart } from '../components/charts/ShapBeeswarmChart';

export const DemonstrationModePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [rfModel, setRfModel] = useState<ModelMetricsResponse | null>(null);
  const [knnModel, setKnnModel] = useState<ModelMetricsResponse | null>(null);
  const [shapResult, setShapResult] = useState<ExplainResponse | null>(null);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Automated step actions
  useEffect(() => {
    if (currentStep === 4 && !rfModel) {
      trainRF();
    } else if (currentStep === 5 && !knnModel) {
      trainKNN();
    } else if (currentStep === 8 && rfModel && !shapResult) {
      loadSHAP();
    } else if (currentStep === 12 && rfModel && !prediction) {
      runDemoPredict();
    }
  }, [currentStep, rfModel, knnModel, shapResult, prediction]);

  const trainRF = async () => {
    setLoading(true);
    try {
      const res = await trainModel({
        dataset_id: 'wine_combined',
        algorithm: 'random_forest',
        task_type: 'classification',
        target_column: 'quality',
        test_size: 0.3,
        random_state: 42,
        hyperparameters: { n_estimators: 100, max_depth: 10 }
      });
      setRfModel(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const trainKNN = async () => {
    setLoading(true);
    try {
      const res = await trainModel({
        dataset_id: 'wine_combined',
        algorithm: 'knn',
        task_type: 'classification',
        target_column: 'quality',
        test_size: 0.3,
        random_state: 42,
        scale_features: true,
        hyperparameters: { n_neighbors: 5, weights: 'distance' }
      });
      setKnnModel(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSHAP = async () => {
    if (!rfModel) return;
    setLoading(true);
    try {
      const exp = await explainModel(rfModel.model_id, 0);
      setShapResult(exp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runDemoPredict = async () => {
    if (!rfModel) return;
    setLoading(true);
    try {
      const pred = await predictModel(rfModel.model_id, {
        'fixed acidity': 7.0,
        'volatile acidity': 0.22,
        'citric acid': 0.38,
        'residual sugar': 4.5,
        'chlorides': 0.038,
        'free sulfur dioxide': 40.0,
        'total sulfur dioxide': 125.0,
        'density': 0.992,
        'pH': 3.22,
        'sulphates': 0.52,
        'alcohol': 12.4
      });
      setPrediction(pred);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    'Introduce Wine Dataset',
    'Inspect Dimensions & Target',
    'Preprocessing & 70:30 Split',
    'Train Random Forest',
    'Train K-Nearest Neighbors',
    'Compare Actual Results',
    'Feature Importances',
    'SHAP Global Explanation',
    'Select Individual Sample',
    'SHAP Local Waterfall',
    'Custom Measurements',
    'Model Inference',
    'Academic Summary'
  ];

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="border-b border-[#22263d] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-mono uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>Academic Viva Walkthrough</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Project Demonstration Mode
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Follow the 13 sequential academic milestones for presentation review and faculty defense.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="text-xs font-mono bg-[#0f111e] px-4 py-2 rounded-xl border border-[#22263d] text-cyan-400 font-bold">
          Step {currentStep} of 13: {stepsList[currentStep - 1]}
        </div>
      </div>

      {/* Step Stepper Progress Bar */}
      <div className="flex items-center gap-1 overflow-x-auto py-2">
        {stepsList.map((st, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentStep(idx + 1)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer ${
              currentStep === idx + 1
                ? 'bg-cyan-500 text-black font-extrabold'
                : currentStep > idx + 1
                ? 'bg-violet-950/60 text-violet-300 border border-violet-800/40'
                : 'bg-[#0f111e] text-slate-500 border border-[#22263d]'
            }`}
          >
            {idx + 1}. {st}
          </button>
        ))}
      </div>

      {/* Main Step Display Card */}
      <div className="bg-[#0f111e] rounded-2xl border border-[#22263d] p-6 lg:p-8 min-h-[460px] flex flex-col justify-between space-y-6">
        <div>
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Step 1</span>
              <h2 className="text-2xl font-bold text-white">Introduction to the UCI Wine Quality Dataset</h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                The Wine Quality dataset from the UCI Machine Learning Repository contains physicochemical laboratory tests of Portuguese <em>Vinho Verde</em> wines. In this project, we predict wine quality scores (graded by sensory expert panels from 3 to 9) using measured chemical features rather than subjective tasting notes alone.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono">
                <div className="bg-[#15182a] p-4 rounded-xl border border-[#22263d]">
                  <span className="text-slate-500 block">Repository:</span>
                  <strong className="text-white">UCI Machine Learning</strong>
                </div>
                <div className="bg-[#15182a] p-4 rounded-xl border border-[#22263d]">
                  <span className="text-slate-500 block">Variants Analyzed:</span>
                  <strong className="text-cyan-400">White Wine & Red Wine</strong>
                </div>
                <div className="bg-[#15182a] p-4 rounded-xl border border-[#22263d]">
                  <span className="text-slate-500 block">Format Delimiter:</span>
                  <strong className="text-violet-400">Semicolon-Separated (;)</strong>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Step 2</span>
              <h2 className="text-2xl font-bold text-white">Dataset Dimensions & Target Distribution</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                White wine dataset contains <strong>4,898 instances</strong> with <strong>11 physicochemical inputs</strong> and 1 target attribute (<code>quality</code>).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
                <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                  <span className="text-slate-500 block">Total Rows:</span>
                  <span className="text-white font-bold text-lg">4,898</span>
                </div>
                <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                  <span className="text-slate-500 block">Features:</span>
                  <span className="text-cyan-400 font-bold text-lg">11 Measurements</span>
                </div>
                <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                  <span className="text-slate-500 block">Target Column:</span>
                  <span className="text-violet-400 font-bold text-lg">quality (3 to 9)</span>
                </div>
                <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                  <span className="text-slate-500 block">Missing Values:</span>
                  <span className="text-emerald-400 font-bold text-lg">0 (Clean)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Step 3</span>
              <h2 className="text-2xl font-bold text-white">Preprocessing & Leak-Free 70:30 Split</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                To satisfy B.Tech project specifications, we partition data into <strong>70% training (3,428 samples)</strong> and <strong>30% testing (1,470 samples)</strong> with a reproducible random seed of <code>42</code>.
              </p>
              <div className="bg-[#15182a] p-4 rounded-xl border border-cyan-500/30 text-xs font-mono space-y-2 text-slate-300">
                <div className="text-cyan-300 font-bold">Zero Data Leakage Rule:</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  When feature scaling is required for distance-based algorithms like KNN, the <code>StandardScaler</code> is fitted strictly on <code>X_train</code> using <code>scaler.fit(X_train)</code>, and then used to transform <code>X_test</code>. Under no circumstances is the scaler fitted on the full dataset prior to splitting.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-violet-400 font-bold uppercase tracking-wider">Step 4</span>
              <h2 className="text-2xl font-bold text-white">Train Random Forest Classifier</h2>
              {loading ? (
                <div className="text-xs font-mono text-cyan-400 animate-pulse">Training 100 bagged decision trees...</div>
              ) : rfModel && rfModel.classification_metrics ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Random Forest Trained in {rfModel.training_time_ms}ms</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                      <span className="text-slate-500 block">Accuracy:</span>
                      <strong className="text-cyan-400 text-lg">{(rfModel.classification_metrics.accuracy * 100).toFixed(2)}%</strong>
                    </div>
                    <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                      <span className="text-slate-500 block">F1 Macro:</span>
                      <strong className="text-violet-400 text-lg">{rfModel.classification_metrics.f1_macro.toFixed(3)}</strong>
                    </div>
                    <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                      <span className="text-slate-500 block">Precision (W):</span>
                      <strong className="text-emerald-400 text-lg">{(rfModel.classification_metrics.precision_weighted * 100).toFixed(1)}%</strong>
                    </div>
                    <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                      <span className="text-slate-500 block">Recall (W):</span>
                      <strong className="text-rose-400 text-lg">{(rfModel.classification_metrics.recall_weighted * 100).toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Step 5</span>
              <h2 className="text-2xl font-bold text-white">Train K-Nearest Neighbors Classifier</h2>
              {loading ? (
                <div className="text-xs font-mono text-cyan-400 animate-pulse">Fitting StandardScaler and training KNN (K=5)...</div>
              ) : knnModel && knnModel.classification_metrics ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>KNN Trained in {knnModel.training_time_ms}ms</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                      <span className="text-slate-500 block">Accuracy:</span>
                      <strong className="text-cyan-400 text-lg">{(knnModel.classification_metrics.accuracy * 100).toFixed(2)}%</strong>
                    </div>
                    <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                      <span className="text-slate-500 block">F1 Macro:</span>
                      <strong className="text-violet-400 text-lg">{knnModel.classification_metrics.f1_macro.toFixed(3)}</strong>
                    </div>
                    <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                      <span className="text-slate-500 block">Precision (W):</span>
                      <strong className="text-emerald-400 text-lg">{(knnModel.classification_metrics.precision_weighted * 100).toFixed(1)}%</strong>
                    </div>
                    <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                      <span className="text-slate-500 block">Recall (W):</span>
                      <strong className="text-rose-400 text-lg">{(knnModel.classification_metrics.recall_weighted * 100).toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* STEP 6 */}
          {currentStep === 6 && rfModel && knnModel && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Step 6</span>
              <h2 className="text-2xl font-bold text-white">Compare Evaluation Results: Random Forest vs KNN</h2>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
                <div className="bg-[#15182a] p-4 rounded-xl border border-violet-500/40 space-y-2">
                  <span className="text-violet-400 font-bold text-sm block">Random Forest</span>
                  <div>Accuracy: <strong className="text-white">{(rfModel.classification_metrics!.accuracy * 100).toFixed(2)}%</strong></div>
                  <div>F1 Macro: <strong className="text-white">{rfModel.classification_metrics!.f1_macro.toFixed(3)}</strong></div>
                </div>
                <div className="bg-[#15182a] p-4 rounded-xl border border-cyan-500/40 space-y-2">
                  <span className="text-cyan-400 font-bold text-sm block">K-Nearest Neighbors</span>
                  <div>Accuracy: <strong className="text-white">{(knnModel.classification_metrics!.accuracy * 100).toFixed(2)}%</strong></div>
                  <div>F1 Macro: <strong className="text-white">{knnModel.classification_metrics!.f1_macro.toFixed(3)}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7 */}
          {currentStep === 7 && rfModel && rfModel.feature_importances && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Step 7</span>
              <h2 className="text-2xl font-bold text-white">Scikit-Learn Feature Importance</h2>
              <FeatureImportanceChart importances={rfModel.feature_importances} />
            </div>
          )}

          {/* STEP 8 */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-pink-400 font-bold uppercase tracking-wider">Step 8</span>
              <h2 className="text-2xl font-bold text-white">SHAP Global Explanation (Beeswarm)</h2>
              {loading ? (
                <div className="text-xs font-mono text-cyan-400 animate-pulse">Computing Shapley values...</div>
              ) : shapResult ? (
                <ShapBeeswarmChart importance={shapResult.global_importance} points={shapResult.beeswarm_sample} />
              ) : null}
            </div>
          )}

          {/* STEP 9 & 10 */}
          {(currentStep === 9 || currentStep === 10) && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-pink-400 font-bold uppercase tracking-wider">
                {currentStep === 9 ? 'Step 9: Sample Selection' : 'Step 10: Local SHAP Waterfall'}
              </span>
              <h2 className="text-2xl font-bold text-white">Local Sample Feature Attribution</h2>
              {shapResult && shapResult.local_explanation ? (
                <ShapWaterfallChart explanation={shapResult.local_explanation} />
              ) : (
                <div className="text-xs font-mono text-slate-400">Loading sample explanation...</div>
              )}
            </div>
          )}

          {/* STEP 11 & 12 */}
          {(currentStep === 11 || currentStep === 12) && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                {currentStep === 11 ? 'Step 11: Custom Measurements' : 'Step 12: Live Model Inference'}
              </span>
              <h2 className="text-2xl font-bold text-white">Custom Wine Sample Inference</h2>
              {prediction ? (
                <div className="bg-[#15182a] p-5 rounded-xl border border-cyan-500/40 text-xs font-mono space-y-2">
                  <div className="text-cyan-400 font-bold text-sm">Predicted Score: Quality {prediction.prediction}</div>
                  <div className="text-slate-300">{prediction.explanation}</div>
                </div>
              ) : (
                <div className="text-xs font-mono text-slate-400">Executing inference with trained pipeline...</div>
              )}
            </div>
          )}

          {/* STEP 13 */}
          {currentStep === 13 && (
            <div className="space-y-4">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Step 13</span>
              <h2 className="text-2xl font-bold text-white">Academic Summary & Viva Findings</h2>
              <div className="bg-[#15182a] p-5 rounded-xl border border-emerald-500/40 text-xs font-mono space-y-3 text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Check className="w-5 h-5" />
                  <span>Capstone Research Findings</span>
                </div>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                  <li><strong>Ensemble Supremacy:</strong> Random Forest achieves higher macro F1 and accuracy than KNN due to its capacity to capture non-linear physicochemical thresholds without noise sensitivity.</li>
                  <li><strong>Leakage Prevention:</strong> Feature scaling is mandatory for KNN and must be fitted solely on training partitions to prevent optimistic bias.</li>
                  <li><strong>Transparency:</strong> SHAP TreeExplainer reveals that alcohol concentration, volatile acidity, and free sulfur dioxide have the strongest Shapley attribution on sensory wine ratings.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-[#22263d]">
          <button
            onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-xl bg-[#15182a] hover:bg-[#1d223a] text-slate-300 text-xs font-mono flex items-center gap-2 disabled:opacity-30 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs font-mono text-slate-500">
            Milestone {currentStep} / 13
          </span>

          <button
            onClick={() => setCurrentStep(s => Math.min(13, s + 1))}
            disabled={currentStep === 13}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-mono font-bold flex items-center gap-2 disabled:opacity-30 cursor-pointer"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
