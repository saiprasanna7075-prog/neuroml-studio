import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Wine,
  HelpCircle
} from 'lucide-react';
import { PredictResponse, ModelMetricsResponse, ExplainResponse, DatasetSummary } from '../types';
import { trainModel, predictModel, explainModel, fetchDatasets } from '../services/api';
import { ShapWaterfallChart } from '../components/charts/ShapWaterfallChart';

export const PredictionPlaygroundPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('wine_combined');
  const [modelType, setModelType] = useState<'rf' | 'knn'>('rf');
  const [currentModel, setCurrentModel] = useState<ModelMetricsResponse | null>(null);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  // 11 physicochemical measurements
  const defaultValues = {
    'fixed acidity': 6.8,
    'volatile acidity': 0.26,
    'citric acid': 0.35,
    'residual sugar': 5.2,
    'chlorides': 0.044,
    'free sulfur dioxide': 35.0,
    'total sulfur dioxide': 135.0,
    'density': 0.9935,
    'pH': 3.20,
    'sulphates': 0.48,
    'alcohol': 11.2
  };

  const [features, setFeatures] = useState<Record<string, number>>(defaultValues);
  const [predictionResult, setPredictionResult] = useState<PredictResponse | null>(null);
  const [shapResult, setShapResult] = useState<ExplainResponse | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Preset profiles
  const applyPreset = (preset: 'premium' | 'table' | 'low') => {
    if (preset === 'premium') {
      setFeatures({
        'fixed acidity': 7.2,
        'volatile acidity': 0.18, // low volatile acid
        'citric acid': 0.40,
        'residual sugar': 3.5,
        'chlorides': 0.035,
        'free sulfur dioxide': 42.0,
        'total sulfur dioxide': 120.0,
        'density': 0.9915,
        'pH': 3.25,
        'sulphates': 0.55,
        'alcohol': 12.8 // high alcohol
      });
    } else if (preset === 'table') {
      setFeatures(defaultValues);
    } else {
      setFeatures({
        'fixed acidity': 7.9,
        'volatile acidity': 0.75, // high volatile acid (vinegar flaw)
        'citric acid': 0.12,
        'residual sugar': 16.5,
        'chlorides': 0.085,
        'free sulfur dioxide': 12.0,
        'total sulfur dioxide': 210.0,
        'density': 1.002,
        'pH': 3.05,
        'sulphates': 0.32,
        'alcohol': 8.9 // low alcohol
      });
    }
  };

  useEffect(() => {
    fetchDatasets().then(list => {
      setDatasets(list);
      const combined = list.find(d => d.id === 'wine_combined');
      if (combined) {
        setSelectedDatasetId('wine_combined');
      } else if (list.length > 0) {
        setSelectedDatasetId(list[0].id);
      }
    }).catch(console.error);
  }, []);

  // Ensure model is trained
  const ensureModelTrained = async (alg: 'rf' | 'knn', dsIdOverride?: string) => {
    const dsId = dsIdOverride || selectedDatasetId;
    if (!dsId) return;

    setIsModelLoading(true);
    setStatusMsg(`Training ${alg === 'rf' ? 'Random Forest' : 'KNN'} pipeline...`);
    try {
      const activeDs = datasets.find(d => d.id === dsId);
      const dsName = activeDs ? activeDs.name : dsId;

      const res = await trainModel({
        dataset_id: dsId,
        algorithm: alg === 'rf' ? 'random_forest' : 'knn',
        task_type: 'classification',
        target_column: 'quality',
        test_size: 0.3,
        random_state: 42,
        scale_features: alg === 'knn',
        hyperparameters: alg === 'rf' ? { n_estimators: 80, max_depth: 8 } : { n_neighbors: 5, weights: 'distance' },
        experiment_name: `Playground ${alg.toUpperCase()} on ${dsName}`
      });
      setCurrentModel(res);
      setStatusMsg(null);
    } catch (e: any) {
      setStatusMsg(`Failed to train model: ${e.message}`);
    } finally {
      setIsModelLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDatasetId) {
      ensureModelTrained(modelType, selectedDatasetId);
    }
  }, [modelType, selectedDatasetId]);

  const handlePredict = async () => {
    if (!currentModel) return;
    setIsPredicting(true);
    try {
      // 1. Prediction
      const pred = await predictModel(currentModel.model_id, features);
      setPredictionResult(pred);

      // 2. SHAP explanation on this custom input
      const exp = await explainModel(currentModel.model_id, 0, features);
      setShapResult(exp);
    } catch (e: any) {
      setStatusMsg(`Prediction failed: ${e.message}`);
    } finally {
      setIsPredicting(false);
    }
  };

  const featureMetadata = [
    { key: 'fixed acidity', label: 'Fixed Acidity', unit: 'g(tartaric acid)/dm³', min: 3.8, max: 14.5, step: 0.1 },
    { key: 'volatile acidity', label: 'Volatile Acidity', unit: 'g(acetic acid)/dm³', min: 0.08, max: 1.2, step: 0.01 },
    { key: 'citric acid', label: 'Citric Acid', unit: 'g/dm³', min: 0.0, max: 1.2, step: 0.01 },
    { key: 'residual sugar', label: 'Residual Sugar', unit: 'g/dm³', min: 0.6, max: 30.0, step: 0.1 },
    { key: 'chlorides', label: 'Chlorides', unit: 'g(NaCl)/dm³', min: 0.01, max: 0.25, step: 0.001 },
    { key: 'free sulfur dioxide', label: 'Free Sulfur Dioxide', unit: 'mg/dm³', min: 2.0, max: 120.0, step: 1.0 },
    { key: 'total sulfur dioxide', label: 'Total Sulfur Dioxide', unit: 'mg/dm³', min: 9.0, max: 300.0, step: 1.0 },
    { key: 'density', label: 'Density', unit: 'g/cm³', min: 0.987, max: 1.015, step: 0.0005 },
    { key: 'pH', label: 'pH Value', unit: 'pH units', min: 2.7, max: 3.9, step: 0.01 },
    { key: 'sulphates', label: 'Sulphates', unit: 'g(potassium sulphate)/dm³', min: 0.2, max: 1.5, step: 0.01 },
    { key: 'alcohol', label: 'Alcohol Content', unit: '% by volume', min: 8.0, max: 15.0, step: 0.1 },
  ];

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#22263d] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Inference Playground</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Predict a Wine
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Input custom physicochemical laboratory measurements and run inference using your chosen trained model.
          </p>
        </div>

        {/* Model Selector & Presets */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dataset Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Dataset:</span>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="bg-[#0f111e] border border-[#22263d] rounded-xl px-3 py-2 text-xs text-violet-300 font-mono font-bold cursor-pointer"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.total_rows.toLocaleString()} rows)</option>
              ))}
            </select>
          </div>

          <div className="flex bg-[#0f111e] p-1 rounded-xl border border-[#22263d]">
            <button
              onClick={() => setModelType('rf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                modelType === 'rf' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Random Forest
            </button>
            <button
              onClick={() => setModelType('knn')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                modelType === 'knn' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              KNN (Scaled)
            </button>
          </div>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-3 bg-[#0f111e] p-4 rounded-xl border border-[#22263d] text-xs font-mono">
        <span className="text-slate-400 font-bold">Quick Presets:</span>
        <button
          onClick={() => applyPreset('premium')}
          className="px-3 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 cursor-pointer"
        >
          High-Quality Crisp Wine (Score 7-8)
        </button>
        <button
          onClick={() => applyPreset('table')}
          className="px-3 py-1 rounded-lg bg-sky-950/50 hover:bg-sky-900/50 text-sky-300 border border-sky-500/40 cursor-pointer"
        >
          Standard Table Wine (Score 6)
        </button>
        <button
          onClick={() => applyPreset('low')}
          className="px-3 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 cursor-pointer"
        >
          Oxidized / Low-Quality Wine (Score 4-5)
        </button>
      </div>

      {statusMsg && (
        <div className="bg-cyan-950/40 border border-cyan-500/40 p-4 rounded-xl text-xs font-mono text-cyan-300">
          {statusMsg}
        </div>
      )}

      {/* Inputs Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureMetadata.map((f) => (
          <div key={f.key} className="bg-[#0f111e] p-4 rounded-xl border border-[#22263d] space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 font-semibold">{f.label}</span>
              <span className="text-cyan-400 font-bold">{features[f.key]}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">{f.unit}</div>
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={features[f.key]}
              onChange={(e) => setFeatures({ ...features, [f.key]: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-600 font-mono">
              <span>{f.min}</span>
              <span>{f.max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Predict Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handlePredict}
          disabled={isPredicting || isModelLoading}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-mono text-sm font-bold flex items-center gap-2.5 shadow-xl shadow-violet-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${isPredicting ? 'animate-spin' : ''}`} />
          <span>{isPredicting ? 'Running Inference...' : 'Predict Wine Quality'}</span>
        </button>
      </div>

      {/* Prediction Output Card */}
      {predictionResult && (
        <div className="space-y-6 pt-4">
          <div className="bg-gradient-to-r from-[#0f111e] via-[#15182a] to-[#0f111e] border border-cyan-500/40 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-cyan-950/20">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Wine className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                  Model Prediction Output
                </span>
                <div className="text-3xl font-black text-white font-mono flex items-center gap-3 mt-1">
                  <span>Score:</span>
                  <span className="text-gradient-violet-cyan text-4xl">
                    {predictionResult.prediction}
                  </span>
                  <span className="text-xs font-normal text-slate-400 font-mono">/ 10</span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-1">
                  {predictionResult.explanation}
                </p>
              </div>
            </div>

            {/* Probability Distribution */}
            {predictionResult.probabilities && (
              <div className="bg-[#080911] p-3 rounded-xl border border-[#22263d] text-xs font-mono space-y-1 w-full md:w-64">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Class Probabilities:</span>
                {Object.entries(predictionResult.probabilities).map(([score, prob]) => (
                  <div key={score} className="flex justify-between items-center text-slate-300">
                    <span>Quality {score}:</span>
                    <strong className={Number(score) === Number(predictionResult.prediction) ? 'text-cyan-400' : 'text-slate-500'}>
                      {(prob * 100).toFixed(1)}%
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Local SHAP Waterfall Explanation on this specific prediction */}
          {shapResult && shapResult.local_explanation && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Feature Impact Explanation for this Prediction</span>
              </h3>
              <ShapWaterfallChart explanation={shapResult.local_explanation} />
            </div>
          )}

          {/* Academic & Scientific Disclaimer */}
          <div className="p-4 rounded-xl bg-[#080911] border border-[#22263d] text-[11px] font-mono text-slate-500 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Academic Disclaimer:</strong> This prediction models the UCI Wine Quality dataset's target quality scores (median of at least 3 sensory evaluations by wine experts) based on measured physicochemical attributes. It does not measure commercial safety, authenticity, or biological suitability.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
