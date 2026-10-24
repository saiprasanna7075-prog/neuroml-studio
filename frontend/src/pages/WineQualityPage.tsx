import React, { useState, useEffect } from 'react';
import {
  Wine,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Eye,
  Sliders,
  Sparkles,
  Info,
  GitMerge
} from 'lucide-react';
import { DatasetSummary, ModelMetricsResponse, ExplainResponse } from '../types';
import { fetchDatasets, trainModel, explainModel, combineDatasets } from '../services/api';
import { ConfusionMatrixChart } from '../components/charts/ConfusionMatrixChart';
import { FeatureImportanceChart } from '../components/charts/FeatureImportanceChart';
import { ResidualPlot } from '../components/charts/ResidualPlot';
import { ShapWaterfallChart } from '../components/charts/ShapWaterfallChart';
import { ShapBeeswarmChart } from '../components/charts/ShapBeeswarmChart';

interface WineQualityPageProps {
  onNavigateToArena?: (rfModelId: string, knnModelId: string) => void;
  onNavigateToPredict?: (modelId: string) => void;
}

export const WineQualityPage: React.FC<WineQualityPageProps> = ({
  onNavigateToArena,
  onNavigateToPredict
}) => {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('wine_white');
  const [activeDataset, setActiveDataset] = useState<DatasetSummary | null>(null);

  // Preprocessing config
  const [taskType, setTaskType] = useState<'classification' | 'regression'>('classification');
  const [classificationMode, setClassificationMode] = useState<'three_tier' | 'binary' | 'multiclass'>('three_tier');
  const [testSplit, setTestSplit] = useState<number>(0.3);
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [removeDuplicates, setRemoveDuplicates] = useState<boolean>(true); // Default true matching Colab deduplication

  // Model Selection
  const [activeModelTab, setActiveModelTab] = useState<'rf' | 'knn'>('rf');

  // Random Forest Hyperparameters (Matching Colab defaults)
  const [rfTrees, setRfTrees] = useState<number>(300);
  const [rfMaxDepth, setRfMaxDepth] = useState<string>('None');
  const [rfMinSplit, setRfMinSplit] = useState<number>(2);
  const [rfMinLeaf, setRfMinLeaf] = useState<number>(2);

  // KNN Hyperparameters (Matching Colab optimal K=7)
  const [knnK, setKnnK] = useState<number>(7);
  const [knnMetric, setKnnMetric] = useState<'euclidean' | 'manhattan'>('euclidean');
  const [knnWeights, setKnnWeights] = useState<'uniform' | 'distance'>('distance');

  // Training state
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Results
  const [rfResult, setRfResult] = useState<ModelMetricsResponse | null>(null);
  const [knnResult, setKnnResult] = useState<ModelMetricsResponse | null>(null);

  // SHAP state
  const [shapLoading, setShapLoading] = useState<boolean>(false);
  const [shapResult, setShapResult] = useState<ExplainResponse | null>(null);
  const [selectedSampleIdx, setSelectedSampleIdx] = useState<number>(0);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const list = await fetchDatasets();
      setDatasets(list);
      const found = list.find(d => d.id === 'wine_white') || list[0];
      if (found) {
        setSelectedDatasetId(found.id);
        setActiveDataset(found);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Failed to load datasets from backend.');
    }
  };

  const handleDatasetChange = (id: string) => {
    setSelectedDatasetId(id);
    const found = datasets.find(d => d.id === id);
    if (found) setActiveDataset(found);
  };

  const handleCombineWines = async () => {
    // Check if combined dataset already exists
    const existing = datasets.find(d => d.id === 'wine_combined' || d.name.toLowerCase().includes('combined'));
    if (existing) {
      handleDatasetChange(existing.id);
      return;
    }
    try {
      const white = datasets.find(d => d.id === 'wine_white');
      const red = datasets.find(d => d.id === 'wine_red');
      if (white && red) {
        const combined = await combineDatasets([white.id, red.id], 'Wine Quality (Combined Red & White)');
        setDatasets(prev => [...prev, combined]);
        handleDatasetChange(combined.id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to combine wine datasets');
    }
  };


  const handleApplyVsCodePreset = () => {
    const red = datasets.find(d => d.id === 'wine_red' || d.name.toLowerCase().includes('red'));
    if (red) {
      handleDatasetChange(red.id);
    }
    setTaskType('classification');
    setClassificationMode('binary');
    setTestSplit(0.2); // 80:20 split (320 test samples)
    setRandomSeed(42);
    setActiveModelTab('rf');
    setRfTrees(100);
    setRfMaxDepth('None');
    setRemoveDuplicates(false);
  };

  const handleTrainCurrentModel = async () => {
    setIsTraining(true);
    setErrorMsg(null);

    try {
      if (activeModelTab === 'rf') {
        const res = await trainModel({
          dataset_id: selectedDatasetId,
          algorithm: 'random_forest',
          task_type: taskType,
          classification_mode: taskType === 'classification' ? classificationMode : undefined,
          target_column: 'quality',
          test_size: testSplit,
          random_state: randomSeed,
          remove_duplicates: removeDuplicates,
          hyperparameters: {
            n_estimators: rfTrees,
            max_depth: rfMaxDepth === 'None' ? null : Number(rfMaxDepth),
            min_samples_split: rfMinSplit,
            min_samples_leaf: rfMinLeaf
          },
          experiment_name: `Random Forest (${taskType}${taskType === 'classification' ? `-${classificationMode}` : ''}) on ${activeDataset?.name}`
        });
        setRfResult(res);

        // Auto calculate SHAP for RF
        calculateShap(res.model_id, 0);
      } else {
        const res = await trainModel({
          dataset_id: selectedDatasetId,
          algorithm: 'knn',
          task_type: taskType,
          classification_mode: taskType === 'classification' ? classificationMode : undefined,
          target_column: 'quality',
          test_size: testSplit,
          random_state: randomSeed,
          scale_features: true, // Leak-free StandardScaler strictly on training partition
          remove_duplicates: removeDuplicates,
          hyperparameters: {
            n_neighbors: knnK,
            metric: knnMetric,
            weights: knnWeights
          },
          experiment_name: `KNN (${taskType}${taskType === 'classification' ? `-${classificationMode}` : ''}) on ${activeDataset?.name}`
        });
        setKnnResult(res);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Model training failed.');
    } finally {
      setIsTraining(false);
    }
  };

  const calculateShap = async (modelId: string, sampleIdx: number) => {
    setShapLoading(true);
    try {
      const exp = await explainModel(modelId, sampleIdx);
      setShapResult(exp);
      setSelectedSampleIdx(sampleIdx);
    } catch (e: any) {
      console.error("SHAP error:", e);
    } finally {
      setShapLoading(false);
    }
  };

  const activeResult = activeModelTab === 'rf' ? rfResult : knnResult;

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#22263d] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">
            <Wine className="w-3.5 h-3.5 text-cyan-400" />
            <span>Flagship Demonstration</span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-black text-white tracking-tight">
            Wine Quality <span className="text-gradient-violet-cyan">Intelligence</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Predict wine quality using Random Forest and K-Nearest Neighbors, with transparent AI explanations powered by SHAP.
          </p>
        </div>

        {/* Action shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="https://colab.research.google.com/drive/1NuY5aJ_2HAlA7Lp0iuy6ap9ZC-hOMrbo?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-mono font-medium flex items-center gap-2 shadow-sm transition-all hover:scale-105"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Open in Google Colab ↗</span>
          </a>

          {rfResult && knnResult && onNavigateToArena && (
            <button
              onClick={() => onNavigateToArena(rfResult.model_id, knnResult.model_id)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-mono font-medium flex items-center gap-2 shadow-lg shadow-violet-600/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Compare RF vs KNN in Arena</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/50 border border-rose-500/40 p-4 rounded-xl flex items-center gap-3 text-rose-300 text-sm font-mono">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* VS Code Benchmark Alignment Callout */}
      <div className="bg-gradient-to-r from-violet-950/60 via-[#14182e] to-cyan-950/60 border border-violet-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              VS Code Benchmark Match: 79.06%
            </span>
            <span className="text-xs font-mono text-cyan-300 font-semibold">
              Why was your accuracy different?
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            In your VS Code Python code, wine was trained with <span className="text-white font-bold">Binary Classification (Quality ≥ 6 as Good vs &lt; 6 as Standard)</span> on <span className="text-white font-bold">Red Wine</span> with an <span className="text-white font-bold">80:20 split</span>, achieving <span className="text-emerald-400 font-bold">79.06% test accuracy</span> (253 of 320 correct). In contrast, predicting the <span className="text-white font-bold">exact discrete score (3 to 9)</span> on 6,497 combined wines gives <span className="text-cyan-400 font-bold">68.87%</span>.
          </p>
        </div>

        <button
          onClick={handleApplyVsCodePreset}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer shrink-0 hover:scale-105"
        >
          <Sparkles size={14} className="text-amber-200" />
          <span>Apply 79.06% VS Code Preset</span>
        </button>
      </div>

      {/* 1. Dataset & Preprocessing Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dataset Selection */}
        <div className="bg-[#0f111e] p-5 rounded-xl border border-[#22263d] space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">1. Benchmark Dataset</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">UCI Repository</span>
          </div>

          {/* Quick Combine Button */}
          <button
            onClick={handleCombineWines}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              selectedDatasetId === 'wine_combined' || (activeDataset && activeDataset.name.toLowerCase().includes('combined'))
                ? 'bg-gradient-to-r from-violet-600/30 via-indigo-600/30 to-rose-600/30 border-violet-500/60 text-white font-bold shadow-md shadow-violet-900/30'
                : 'bg-violet-950/40 hover:bg-violet-900/50 border-violet-500/30 text-violet-300'
            }`}
          >
            <GitMerge className="w-4 h-4 text-violet-400 shrink-0" />
            <span>Combine Both Wines (White + Red = 6,497 rows)</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {datasets.map(d => {
              const isCombined = d.id === 'wine_combined' || d.name.toLowerCase().includes('combined');
              const isSelected = selectedDatasetId === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => handleDatasetChange(d.id)}
                  className={`p-2.5 rounded-lg text-left text-xs font-mono transition-all cursor-pointer relative ${
                    isSelected
                      ? isCombined
                        ? 'bg-gradient-to-r from-violet-600/25 to-rose-600/25 text-violet-200 border border-violet-500/60 shadow-sm'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'bg-[#15182a] text-slate-400 border border-[#22263d] hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold truncate text-[11px]">{d.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{d.total_rows.toLocaleString()} samples</div>
                  {isCombined && (
                    <span className="mt-1 inline-block text-[9px] px-1.5 py-0.2 rounded bg-violet-500/30 text-violet-300 font-semibold border border-violet-500/40">
                      Unified
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activeDataset && (
            <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]/60 text-xs font-mono space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Dimensions:</span>
                <span>{activeDataset.total_rows} rows × {activeDataset.total_columns} cols</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Column:</span>
                <span className="text-cyan-400 font-bold">quality (3 to 9)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Missing Values:</span>
                <span className="text-emerald-400">{activeDataset.total_missing} (0.00%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duplicates:</span>
                <span>{activeDataset.duplicate_rows} rows ({((activeDataset.duplicate_rows/activeDataset.total_rows)*100).toFixed(1)}%)</span>
              </div>
            </div>
          )}
        </div>

        {/* Preprocessing Parameters */}
        <div className="bg-[#0f111e] p-5 rounded-xl border border-[#22263d] space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">2. Preprocessing & Leak Prevention</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">Leak-Free Split</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Train / Test Split Ratio:</span>
                <span className="text-cyan-400 font-bold">{Math.round((1 - testSplit) * 100)}:{Math.round(testSplit * 100)} (Academic Spec)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden">
                <div style={{ width: `${(1 - testSplit) * 100}%` }} className="bg-violet-600 h-full" />
                <div style={{ width: `${testSplit * 100}%` }} className="bg-cyan-500 h-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Random Seed:</label>
                <input
                  type="number"
                  value={randomSeed}
                  onChange={(e) => setRandomSeed(Number(e.target.value))}
                  className="w-full bg-[#15182a] border border-[#22263d] rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Prediction Task:</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="w-full bg-[#15182a] border border-[#22263d] rounded-lg px-2.5 py-1.5 text-slate-200 cursor-pointer"
                >
                  <option value="classification">Classification</option>
                  <option value="regression">Regression (Continuous)</option>
                </select>
              </div>
            </div>

            {taskType === 'classification' && (
              <div className="pt-1">
                <label className="text-slate-400 text-[11px] block mb-1 flex items-center justify-between">
                  <span>Target Classification Mode:</span>
                  <span className={
                    classificationMode === 'three_tier' ? 'text-emerald-400 font-bold text-[10px]' :
                    classificationMode === 'binary' ? 'text-amber-400 font-bold text-[10px]' :
                    'text-cyan-400 text-[10px]'
                  }>
                    {classificationMode === 'three_tier' ? 'Colab 3-Tier: Low ≤4, Med 5-6, High ≥7 (~76-78%)' :
                     classificationMode === 'binary' ? 'Binary Good vs Normal (~79.1%)' :
                     'Granular 7-Scores (~68.8%)'}
                  </span>
                </label>
                <select
                  value={classificationMode}
                  onChange={(e) => setClassificationMode(e.target.value as any)}
                  className="w-full bg-[#15182a] border border-[#22263d] rounded-lg px-2.5 py-1.5 text-slate-200 cursor-pointer font-mono text-xs focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="three_tier">3-Tier Quality (Low ≤4, Medium 5-6, High ≥7) ~76-78% [Colab Standard]</option>
                  <option value="binary">Binary Classification (Good ≥ 6 vs Normal &lt; 6) ~79.06% [VS Code Baseline]</option>
                  <option value="multiclass">Multi-Class (Exact Discrete Ratings 3 to 9) ~68.8%</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-300">
              <input
                type="checkbox"
                id="rmdup"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="rounded accent-cyan-400 cursor-pointer"
              />
              <label htmlFor="rmdup" className="cursor-pointer">Deduplicate Identical Samples</label>
            </div>
          </div>
        </div>

        {/* Feature Scaling Rule Indicator */}
        <div className="bg-[#0f111e] p-5 rounded-xl border border-[#22263d] space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">Scaling Protocol</span>
              <Info className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#15182a] border border-[#22263d]">
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Random Forest:</span>
                  <span className="text-slate-400 font-bold">Unscaled (Tree Invariant)</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Decision trees rely purely on order-preserving monotonic thresholds, making feature scaling mathematically redundant.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#15182a] border border-cyan-500/30">
                <div className="flex items-center justify-between text-cyan-300 mb-1">
                  <span>K-Nearest Neighbors:</span>
                  <span className="text-emerald-400 font-bold">StandardScaler (Train Only)</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Mandatory: Scales features to μ=0, σ=1 strictly fitted on X_train to prevent distance metric distortion and data leakage.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Zero Data Leakage: Scaler.fit(X_train) exclusively</span>
          </div>
        </div>
      </div>

      {/* 2. Model Selection Tabs & Hyperparameter Tuning */}
      <div className="bg-[#0f111e] rounded-2xl border border-[#22263d] overflow-hidden">
        {/* Model Tabs */}
        <div className="flex border-b border-[#22263d] bg-[#080911]/60">
          <button
            onClick={() => setActiveModelTab('rf')}
            className={`flex-1 py-4 px-6 text-sm font-mono flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeModelTab === 'rf'
                ? 'border-violet-500 text-white bg-violet-950/20 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
            <span>Random Forest Model</span>
            {rfResult && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">Trained</span>}
          </button>

          <button
            onClick={() => setActiveModelTab('knn')}
            className={`flex-1 py-4 px-6 text-sm font-mono flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeModelTab === 'knn'
                ? 'border-cyan-500 text-white bg-cyan-950/20 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>K-Nearest Neighbors (KNN)</span>
            {knnResult && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">Trained</span>}
          </button>
        </div>

        {/* Hyperparameter Controls */}
        <div className="p-6">
          {activeModelTab === 'rf' ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-base font-semibold text-white">Random Forest Hyperparameters</h3>
                  <p className="text-xs text-slate-400">
                    Random Forest combines the predictions of multiple decision trees to produce a more robust final prediction.
                  </p>
                </div>

                <button
                  onClick={handleTrainCurrentModel}
                  disabled={isTraining}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-mono font-medium flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
                  <span>{isTraining ? 'Training Random Forest...' : 'Train Random Forest'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#15182a] p-3.5 rounded-xl border border-[#22263d]">
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    Number of Trees (n_estimators): <strong className="text-cyan-400">{rfTrees}</strong>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={rfTrees}
                    onChange={(e) => setRfTrees(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="bg-[#15182a] p-3.5 rounded-xl border border-[#22263d]">
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    Max Tree Depth: <strong className="text-violet-400">{rfMaxDepth}</strong>
                  </label>
                  <select
                    value={rfMaxDepth}
                    onChange={(e) => setRfMaxDepth(e.target.value)}
                    className="w-full bg-[#0f111e] border border-[#22263d] rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono"
                  >
                    <option value="None">None (Unconstrained)</option>
                    <option value="5">5 (Light)</option>
                    <option value="10">10 (Balanced)</option>
                    <option value="15">15 (Deep)</option>
                  </select>
                </div>

                <div className="bg-[#15182a] p-3.5 rounded-xl border border-[#22263d]">
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    Min Samples Split: <strong className="text-slate-200">{rfMinSplit}</strong>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={rfMinSplit}
                    onChange={(e) => setRfMinSplit(Number(e.target.value))}
                    className="w-full accent-violet-400 cursor-pointer"
                  />
                </div>

                <div className="bg-[#15182a] p-3.5 rounded-xl border border-[#22263d]">
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    Min Samples Leaf: <strong className="text-slate-200">{rfMinLeaf}</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rfMinLeaf}
                    onChange={(e) => setRfMinLeaf(Number(e.target.value))}
                    className="w-full accent-violet-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-base font-semibold text-white">K-Nearest Neighbors Hyperparameters</h3>
                  <p className="text-xs text-slate-400">
                    KNN predicts the output of a wine sample by examining similar samples in the scaled training dataset.
                  </p>
                </div>

                <button
                  onClick={handleTrainCurrentModel}
                  disabled={isTraining}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-mono font-medium flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
                  <span>{isTraining ? 'Training KNN...' : 'Train KNN Model'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#15182a] p-3.5 rounded-xl border border-[#22263d]">
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    Number of Neighbors (K): <strong className="text-cyan-400">{knnK}</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="2"
                    value={knnK}
                    onChange={(e) => setKnnK(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="bg-[#15182a] p-3.5 rounded-xl border border-[#22263d]">
                  <label className="text-xs font-mono text-slate-300 block mb-1">Distance Metric:</label>
                  <select
                    value={knnMetric}
                    onChange={(e) => setKnnMetric(e.target.value as any)}
                    className="w-full bg-[#0f111e] border border-[#22263d] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                  >
                    <option value="euclidean">Euclidean (L2 Norm)</option>
                    <option value="manhattan">Manhattan (L1 Cityblock)</option>
                  </select>
                </div>

                <div className="bg-[#15182a] p-3.5 rounded-xl border border-[#22263d]">
                  <label className="text-xs font-mono text-slate-300 block mb-1">Neighbor Weighting:</label>
                  <select
                    value={knnWeights}
                    onChange={(e) => setKnnWeights(e.target.value as any)}
                    className="w-full bg-[#0f111e] border border-[#22263d] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                  >
                    <option value="uniform">Uniform (Equal Votes)</option>
                    <option value="distance">Distance Weighted (Inverse Distance)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Evaluation Results Dashboard */}
      {activeResult && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#22263d] pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              <span>{activeResult.algorithm_name} Evaluation Metrics</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Evaluated on {activeResult.test_samples} unseen samples ({activeResult.test_size * 100}% split) in {activeResult.training_time_ms}ms
            </span>
          </div>

          {/* Metric KPI cards */}
          {activeResult.classification_metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#0f111e] p-4 rounded-xl border border-[#22263d]">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Test Accuracy</span>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                  {(activeResult.classification_metrics.accuracy * 100).toFixed(2)}%
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {activeResult.classification_metrics.labels.length === 2
                    ? 'Binary (Good ≥6 vs Normal <6)'
                    : activeResult.classification_metrics.labels.length === 3
                    ? '3-Tier Quality (Low ≤5, Med 6, High ≥7)'
                    : 'Exact Multi-Class (Scores 3-9)'}
                </span>
              </div>

              <div className="bg-[#0f111e] p-4 rounded-xl border border-[#22263d]">
                <span className="text-[11px] font-mono text-slate-400 uppercase">F1-Score (Macro)</span>
                <div className="text-2xl font-black text-violet-400 font-mono mt-1">
                  {activeResult.classification_metrics.f1_macro.toFixed(3)}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Class-balanced Harmonic Mean</span>
              </div>

              <div className="bg-[#0f111e] p-4 rounded-xl border border-[#22263d]">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Precision (Weighted)</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {(activeResult.classification_metrics.precision_weighted * 100).toFixed(1)}%
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Positive Predictive Value</span>
              </div>

              <div className="bg-[#0f111e] p-4 rounded-xl border border-[#22263d]">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Recall (Weighted)</span>
                <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                  {(activeResult.classification_metrics.recall_weighted * 100).toFixed(1)}%
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Sensitivity Coverage</span>
              </div>
            </div>
          )}

          {activeResult.regression_metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#0f111e] p-4 rounded-xl border border-[#22263d]">
                <span className="text-[11px] font-mono text-slate-400 uppercase">R² Score (Variance)</span>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                  {activeResult.regression_metrics.r2_score.toFixed(3)}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Explained Quality Variance</span>
              </div>

              <div className="bg-[#0f111e] p-4 rounded-xl border border-[#22263d]">
                <span className="text-[11px] font-mono text-slate-400 uppercase">MAE (Mean Absolute Error)</span>
                <div className="text-2xl font-black text-violet-400 font-mono mt-1">
                  {activeResult.regression_metrics.mae.toFixed(3)}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Average Wine Score Error</span>
              </div>

              <div className="bg-[#0f111e] p-4 rounded-xl border border-[#22263d]">
                <span className="text-[11px] font-mono text-slate-400 uppercase">RMSE</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {activeResult.regression_metrics.rmse.toFixed(3)}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Root Mean Squared Error</span>
              </div>

              <div className="bg-[#0f111e] p-4 rounded-xl border border-[#22263d]">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Explained Variance</span>
                <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                  {activeResult.regression_metrics.explained_variance.toFixed(3)}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Proportion of Target Var</span>
              </div>
            </div>
          )}

          {/* Interactive Evaluation Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeResult.classification_metrics ? (
              <div className="bg-[#0f111e] p-5 rounded-xl border border-[#22263d]">
                <h4 className="text-sm font-semibold text-white mb-3">Confusion Matrix</h4>
                <ConfusionMatrixChart
                  matrix={activeResult.classification_metrics.confusion_matrix}
                  labels={activeResult.classification_metrics.labels}
                />
              </div>
            ) : (
              <ResidualPlot data={activeResult.actual_vs_predicted} taskType="regression" />
            )}

            {activeResult.feature_importances ? (
              <FeatureImportanceChart importances={activeResult.feature_importances} />
            ) : (
              <div className="bg-[#0f111e] p-5 rounded-xl border border-[#22263d] flex flex-col justify-center items-center text-center">
                <Info className="w-8 h-8 text-cyan-400 mb-2" />
                <h4 className="text-sm font-semibold text-white">Instance-Based KNN Attribution</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  KNN does not assign global feature coefficients; it computes Euclidean/Manhattan distances across scaled dimensions. Inspect sample attribution via SHAP below.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SHAP Explainable AI Section (for Random Forest) */}
      {rfResult && (
        <div className="space-y-6 pt-6 border-t border-[#22263d]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-mono uppercase tracking-wider mb-2">
                <Eye className="w-3.5 h-3.5" />
                <span>Explainable AI Engine</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                SHAP Interpretability Lab
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                SHAP (SHapley Additive exPlanations) computes exact game-theoretic Shapley values using TreeExplainer for the fitted Random Forest.
              </p>
            </div>

            {/* Sample Selector for Local Explanation */}
            <div className="flex items-center gap-3 bg-[#0f111e] p-2 rounded-xl border border-[#22263d] text-xs font-mono">
              <span className="text-slate-400">Explain Sample Index:</span>
              <select
                value={selectedSampleIdx}
                onChange={(e) => calculateShap(rfResult.model_id, Number(e.target.value))}
                className="bg-[#15182a] border border-[#22263d] rounded-lg px-2.5 py-1 text-slate-200 cursor-pointer"
              >
                {[0, 1, 2, 5, 10, 20, 42].map(idx => (
                  <option key={idx} value={idx}>Test Sample #{idx}</option>
                ))}
              </select>
            </div>
          </div>

          {shapLoading ? (
            <div className="p-12 text-center text-xs font-mono text-cyan-400 flex items-center justify-center gap-3 bg-[#0f111e] rounded-xl border border-[#22263d]">
              <span className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span>Computing TreeExplainer Shapley values across decision tree partitions...</span>
            </div>
          ) : shapResult ? (
            <div className="space-y-6">
              {/* Local Waterfall */}
              {shapResult.local_explanation && (
                <ShapWaterfallChart explanation={shapResult.local_explanation} taskType={taskType} />
              )}

              {/* Global Beeswarm */}
              <ShapBeeswarmChart
                importance={shapResult.global_importance}
                points={shapResult.beeswarm_sample}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
