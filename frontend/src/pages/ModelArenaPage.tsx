import React, { useState, useEffect } from 'react';
import {
  Swords,
  Play,
  Trophy,
  CheckCircle2,
  Clock,
  Zap,
  BarChart2,
  AlertCircle,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { ModelMetricsResponse, ModelComparisonResponse, DatasetSummary } from '../types';
import { trainModel, compareModels, fetchDatasets, fetchModelMetrics } from '../services/api';
import { ConfusionMatrixChart } from '../components/charts/ConfusionMatrixChart';

interface ModelArenaPageProps {
  initialRfId?: string;
  initialKnnId?: string;
}

export const ModelArenaPage: React.FC<ModelArenaPageProps> = ({ initialRfId, initialKnnId }) => {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('wine_combined');
  const [taskType, setTaskType] = useState<'classification' | 'regression'>('classification');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [rfModel, setRfModel] = useState<ModelMetricsResponse | null>(null);
  const [knnModel, setKnnModel] = useState<ModelMetricsResponse | null>(null);
  const [comparison, setComparison] = useState<ModelComparisonResponse | null>(null);

  // Load initial models if passed from Wine Quality Page
  const loadInitialModels = async (rfId: string, knnId: string) => {
    setIsEvaluating(true);
    setErrorMsg(null);
    try {
      const [rf, knn, comp] = await Promise.all([
        fetchModelMetrics(rfId),
        fetchModelMetrics(knnId),
        compareModels([rfId, knnId])
      ]);
      setRfModel(rf);
      setKnnModel(knn);
      setComparison(comp);
      if (rf.dataset_id) {
        setSelectedDatasetId(rf.dataset_id);
      }
    } catch (e: any) {
      console.warn("Could not load initial models directly, retraining arena battle:", e);
      runArenaBattle();
    } finally {
      setIsEvaluating(false);
    }
  };

  // Load available datasets
  useEffect(() => {
    fetchDatasets().then(list => {
      setDatasets(list);
      if (!initialRfId && !initialKnnId) {
        const hasCombined = list.some(d => d.id === 'wine_combined');
        if (hasCombined) {
          setSelectedDatasetId('wine_combined');
        } else if (list.length > 0) {
          setSelectedDatasetId(list[0].id);
        }
      }
    }).catch(err => {
      console.error("Failed to load datasets for Arena:", err);
    });
  }, []);

  useEffect(() => {
    if (initialRfId && initialKnnId) {
      loadInitialModels(initialRfId, initialKnnId);
    }
  }, [initialRfId, initialKnnId]);

  // Train and compare both models on identical 70:30 split
  const runArenaBattle = async (datasetIdOverride?: string) => {
    const dsId = datasetIdOverride || selectedDatasetId;
    if (!dsId) return;

    setIsEvaluating(true);
    setErrorMsg(null);

    const activeDs = datasets.find(d => d.id === dsId);
    const dsName = activeDs ? activeDs.name : dsId;

    try {
      // 1. Train Random Forest (unscaled, 100 trees, full depth)
      const rf = await trainModel({
        dataset_id: dsId,
        algorithm: 'random_forest',
        task_type: taskType,
        target_column: 'quality',
        test_size: 0.3,
        random_state: 42,
        scale_features: false,
        hyperparameters: { n_estimators: 100, max_depth: null },
        experiment_name: `Arena RF (${taskType}) on ${dsName}`
      });
      setRfModel(rf);

      // 2. Train KNN (leak-free StandardScaler fitted strictly on train, K=5)
      const knn = await trainModel({
        dataset_id: dsId,
        algorithm: 'knn',
        task_type: taskType,
        target_column: 'quality',
        test_size: 0.3,
        random_state: 42,
        scale_features: true,
        hyperparameters: { n_neighbors: 5, metric: 'euclidean', weights: 'distance' },
        experiment_name: `Arena KNN (${taskType}) on ${dsName}`
      });
      setKnnModel(knn);

      // 3. Compare models via backend
      const comp = await compareModels([rf.model_id, knn.model_id]);
      setComparison(comp);
    } catch (e: any) {
      setErrorMsg(e.message || 'Arena evaluation failed.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Re-run battle whenever taskType or selectedDatasetId changes (if not using initial models)
  useEffect(() => {
    if (selectedDatasetId && !initialRfId) {
      runArenaBattle(selectedDatasetId);
    }
  }, [taskType, selectedDatasetId]);

  const activeDataset = datasets.find(d => d.id === selectedDatasetId);

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#22263d] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-mono uppercase tracking-wider mb-2">
            <Swords className="w-3.5 h-3.5 text-cyan-400" />
            <span>Side-by-Side Algorithm Benchmark</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Model Arena
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Evaluate Random Forest vs K-Nearest Neighbors on identical 70:30 partitions with verified leak-free preprocessing across White, Red, or Combined Wine datasets.
          </p>
        </div>

        {/* Task toggle & Battle trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as any)}
            className="bg-[#0f111e] border border-[#22263d] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono cursor-pointer"
          >
            <option value="classification">Classification (Discrete 3-9)</option>
            <option value="regression">Regression (Continuous R²)</option>
          </select>

          <button
            onClick={() => runArenaBattle()}
            disabled={isEvaluating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-bounce' : ''}`} />
            <span>{isEvaluating ? 'Evaluating Arena...' : 'Rerun Battle'}</span>
          </button>
        </div>
      </div>

      {/* Dataset Selection Bar */}
      <div className="bg-[#0f111e] p-4 rounded-2xl border border-[#22263d] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">Select Benchmark Dataset:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Quick Selection Buttons for Wine Benchmarks */}
          <button
            onClick={() => setSelectedDatasetId('wine_combined')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer border ${
              selectedDatasetId === 'wine_combined'
                ? 'bg-gradient-to-r from-violet-600/30 via-indigo-600/30 to-rose-600/30 text-white border-violet-500/70 font-bold shadow-md shadow-violet-900/40'
                : 'bg-[#15182a] text-slate-400 border-[#22263d] hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Combined Wine (6,497)</span>
          </button>

          <button
            onClick={() => setSelectedDatasetId('wine_white')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer border ${
              selectedDatasetId === 'wine_white'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/70 font-bold shadow-sm shadow-cyan-900/30'
                : 'bg-[#15182a] text-slate-400 border-[#22263d] hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>White Wine (4,898)</span>
          </button>

          <button
            onClick={() => setSelectedDatasetId('wine_red')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer border ${
              selectedDatasetId === 'wine_red'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/70 font-bold shadow-sm shadow-rose-900/30'
                : 'bg-[#15182a] text-slate-400 border-[#22263d] hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>Red Wine (1,599)</span>
          </button>

          {/* Fallback Dropdown for custom uploaded datasets */}
          {datasets.filter(d => !['wine_white', 'wine_red', 'wine_combined'].includes(d.id)).length > 0 && (
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="bg-[#15182a] border border-[#22263d] rounded-xl px-3 py-2 text-xs text-slate-300 font-mono cursor-pointer"
            >
              {datasets
                .filter(d => !['wine_white', 'wine_red', 'wine_combined'].includes(d.id))
                .map(d => (
                  <option key={d.id} value={d.id}>Custom: {d.name} ({d.total_rows})</option>
                ))}
            </select>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/50 border border-rose-500/40 p-4 rounded-xl flex items-center gap-3 text-rose-300 text-sm font-mono">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Winner Banner */}
      {comparison && comparison.winning_model && rfModel && (
        <div className="bg-gradient-to-r from-violet-950/60 via-[#15182a] to-cyan-950/60 border border-violet-500/40 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold block">
                Arena Victor
              </span>
              <h3 className="text-xl font-extrabold text-white">
                {taskType === 'classification'
                  ? comparison.winning_model.by_accuracy?.algorithm
                  : comparison.winning_model.by_r2_score?.algorithm}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">
                {comparison.comparison_summary}
              </p>
            </div>
          </div>

          <div className="text-xs font-mono bg-[#080911]/80 px-4 py-2.5 rounded-xl border border-[#22263d] text-slate-300 self-stretch sm:self-auto text-center">
            <span className="text-slate-500 block text-[10px]">Test Partition (30% Split):</span>
            <span className="text-cyan-300 font-bold">
              {rfModel.test_samples.toLocaleString()} Samples
            </span>
            <span className="text-slate-400 block text-[10px] mt-0.5">
              {rfModel.dataset_name}
            </span>
          </div>
        </div>
      )}

      {/* Side-by-side Model Cards */}
      {rfModel && knnModel && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Random Forest Arena Card */}
          <div className="bg-[#0f111e] rounded-2xl border border-violet-500/30 p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-violet-400 font-bold uppercase tracking-wider">Contender A</span>
                <h3 className="text-2xl font-bold text-white mt-1">Random Forest</h3>
                <span className="text-xs text-slate-400 font-mono block">Bagged Tree Ensemble (100 Trees)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 mt-1.5 inline-block rounded bg-violet-950/50 border border-violet-500/30 text-violet-300">
                  {rfModel.dataset_name} ({rfModel.train_samples} train / {rfModel.test_samples} test)
                </span>
              </div>
              <div className="bg-[#15182a] px-3 py-1.5 rounded-lg border border-[#22263d] text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-violet-400" />
                {rfModel.training_time_ms}ms
              </div>
            </div>

            {/* Metrics Breakdown */}
            {rfModel.classification_metrics ? (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Accuracy:</span>
                    <strong className="text-cyan-400">{(rfModel.classification_metrics.accuracy * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div style={{ width: `${rfModel.classification_metrics.accuracy * 100}%` }} className="bg-cyan-400 h-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>F1-Score (Macro):</span>
                    <strong className="text-violet-400">{rfModel.classification_metrics.f1_macro.toFixed(3)}</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div style={{ width: `${rfModel.classification_metrics.f1_macro * 100}%` }} className="bg-violet-500 h-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                  <div className="bg-[#15182a] p-2.5 rounded-lg border border-[#22263d]">
                    <span className="text-slate-500 block">Precision (Weighted):</span>
                    <strong className="text-emerald-400">{(rfModel.classification_metrics.precision_weighted * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="bg-[#15182a] p-2.5 rounded-lg border border-[#22263d]">
                    <span className="text-slate-500 block">Recall (Weighted):</span>
                    <strong className="text-rose-400">{(rfModel.classification_metrics.recall_weighted * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
            ) : rfModel.regression_metrics ? (
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                  <span className="text-slate-500 block">R² Score:</span>
                  <strong className="text-cyan-400 text-lg">{rfModel.regression_metrics.r2_score.toFixed(3)}</strong>
                </div>
                <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                  <span className="text-slate-500 block">MAE:</span>
                  <strong className="text-violet-400 text-lg">{rfModel.regression_metrics.mae.toFixed(3)}</strong>
                </div>
              </div>
            ) : null}

            {/* Confusion Matrix */}
            {rfModel.classification_metrics && (
              <div className="pt-2">
                <span className="text-xs font-mono text-slate-400 block mb-2">Confusion Matrix (RF):</span>
                <ConfusionMatrixChart
                  matrix={rfModel.classification_metrics.confusion_matrix}
                  labels={rfModel.classification_metrics.labels}
                />
              </div>
            )}
          </div>

          {/* KNN Arena Card */}
          <div className="bg-[#0f111e] rounded-2xl border border-cyan-500/30 p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Contender B</span>
                <h3 className="text-2xl font-bold text-white mt-1">K-Nearest Neighbors</h3>
                <span className="text-xs text-slate-400 font-mono block">Distance-Weighted (K=5, Scaled L2)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 mt-1.5 inline-block rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">
                  {knnModel.dataset_name} ({knnModel.train_samples} train / {knnModel.test_samples} test)
                </span>
              </div>
              <div className="bg-[#15182a] px-3 py-1.5 rounded-lg border border-[#22263d] text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
                {knnModel.training_time_ms}ms
              </div>
            </div>

            {/* Metrics Breakdown */}
            {knnModel.classification_metrics ? (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Accuracy:</span>
                    <strong className="text-cyan-400">{(knnModel.classification_metrics.accuracy * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div style={{ width: `${knnModel.classification_metrics.accuracy * 100}%` }} className="bg-cyan-400 h-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>F1-Score (Macro):</span>
                    <strong className="text-violet-400">{knnModel.classification_metrics.f1_macro.toFixed(3)}</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div style={{ width: `${knnModel.classification_metrics.f1_macro * 100}%` }} className="bg-violet-500 h-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                  <div className="bg-[#15182a] p-2.5 rounded-lg border border-[#22263d]">
                    <span className="text-slate-500 block">Precision (Weighted):</span>
                    <strong className="text-emerald-400">{(knnModel.classification_metrics.precision_weighted * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="bg-[#15182a] p-2.5 rounded-lg border border-[#22263d]">
                    <span className="text-slate-500 block">Recall (Weighted):</span>
                    <strong className="text-rose-400">{(knnModel.classification_metrics.recall_weighted * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
            ) : knnModel.regression_metrics ? (
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                  <span className="text-slate-500 block">R² Score:</span>
                  <strong className="text-cyan-400 text-lg">{knnModel.regression_metrics.r2_score.toFixed(3)}</strong>
                </div>
                <div className="bg-[#15182a] p-3 rounded-lg border border-[#22263d]">
                  <span className="text-slate-500 block">MAE:</span>
                  <strong className="text-violet-400 text-lg">{knnModel.regression_metrics.mae.toFixed(3)}</strong>
                </div>
              </div>
            ) : null}

            {/* Confusion Matrix */}
            {knnModel.classification_metrics && (
              <div className="pt-2">
                <span className="text-xs font-mono text-slate-400 block mb-2">Confusion Matrix (KNN):</span>
                <ConfusionMatrixChart
                  matrix={knnModel.classification_metrics.confusion_matrix}
                  labels={knnModel.classification_metrics.labels}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
