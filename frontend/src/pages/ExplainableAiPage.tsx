import React, { useState, useEffect } from 'react';
import {
  Eye,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Database
} from 'lucide-react';
import { ModelMetricsResponse, ExplainResponse, DatasetSummary } from '../types';
import { trainModel, explainModel, fetchDatasets } from '../services/api';
import { ShapWaterfallChart } from '../components/charts/ShapWaterfallChart';
import { ShapBeeswarmChart } from '../components/charts/ShapBeeswarmChart';

export const ExplainableAiPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('wine_combined');
  const [model, setModel] = useState<ModelMetricsResponse | null>(null);
  const [shapData, setShapData] = useState<ExplainResponse | null>(null);
  const [sampleIndex, setSampleIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const initExplainability = async (dsIdOverride?: string) => {
    const dsId = dsIdOverride || selectedDatasetId;
    if (!dsId) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const activeDs = datasets.find(d => d.id === dsId);
      const dsName = activeDs ? activeDs.name : dsId;

      // Train Random Forest on selected dataset
      const trained = await trainModel({
        dataset_id: dsId,
        algorithm: 'random_forest',
        task_type: 'classification',
        target_column: 'quality',
        test_size: 0.3,
        random_state: 42,
        hyperparameters: { n_estimators: 80, max_depth: 8 },
        experiment_name: `SHAP RF Explainer on ${dsName}`
      });
      setModel(trained);

      // Compute SHAP
      const exp = await explainModel(trained.model_id, sampleIndex);
      setShapData(exp);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to initialize SHAP TreeExplainer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleChange = async (idx: number) => {
    if (!model) return;
    setSampleIndex(idx);
    setIsLoading(true);
    try {
      const exp = await explainModel(model.model_id, idx);
      setShapData(exp);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDatasetId) {
      initExplainability(selectedDatasetId);
    }
  }, [selectedDatasetId]);

  const activeDataset = datasets.find(d => d.id === selectedDatasetId);

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#22263d] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/60 border border-pink-500/30 text-pink-300 text-xs font-mono uppercase tracking-wider mb-2">
            <Eye className="w-3.5 h-3.5" />
            <span>Explainable AI Laboratory</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            SHAP Transparency & Attribution
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Audit why the Random Forest model made a specific prediction using exact Shapley Additive exPlanations (TreeExplainer).
          </p>
        </div>

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

          {/* Sample Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Sample:</span>
            <select
              value={sampleIndex}
              onChange={(e) => handleSampleChange(Number(e.target.value))}
              className="bg-[#0f111e] border border-[#22263d] rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono font-bold cursor-pointer"
            >
              {[0, 1, 2, 3, 4, 5, 8, 12, 19, 25, 42].map(idx => (
                <option key={idx} value={idx}>Test Sample #{idx}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="p-16 text-center text-xs font-mono text-cyan-400 flex flex-col items-center justify-center gap-3 bg-[#0f111e] rounded-2xl border border-[#22263d]">
          <span className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span>Executing Shapley TreeExplainer on {activeDataset?.name || 'Dataset'}...</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-950/50 border border-rose-500/40 p-4 rounded-xl text-rose-300 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      {shapData && !isLoading && (
        <div className="space-y-8">
          {/* Local Attribution Waterfall */}
          {shapData.local_explanation && (
            <div className="bg-[#0f111e] rounded-2xl border border-[#22263d] p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#22263d] pb-4">
                <div>
                  <span className="text-xs font-mono text-pink-400 font-bold uppercase">Sample #{shapData.local_explanation.sample_index}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">SHAP Waterfall Plot</h3>
                </div>
                <div className="text-xs font-mono text-slate-300 bg-[#15182a] px-3 py-1.5 rounded-lg border border-[#22263d]">
                  Base Value: <strong className="text-cyan-400">{shapData.local_explanation.base_value.toFixed(2)}</strong> → Model Output: <strong className="text-emerald-400">{shapData.local_explanation.predicted_value}</strong>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-mono">
                Bars represent marginal feature contributions pushing the prediction away from the mean base value. Pink bars increase predicted quality score; cyan bars decrease it.
              </p>

              <ShapWaterfallChart explanation={shapData.local_explanation} />
            </div>
          )}

          {/* Global Feature Impact Beeswarm */}
          {shapData.beeswarm_sample && shapData.beeswarm_sample.length > 0 && (
            <div className="bg-[#0f111e] rounded-2xl border border-[#22263d] p-6 space-y-4">
              <div className="border-b border-[#22263d] pb-4">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Global Cohort Attribution</span>
                <h3 className="text-lg font-bold text-white mt-0.5">SHAP Summary / Beeswarm Distribution</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Visualizes how high (pink) vs low (cyan) feature values influence the overall wine quality distribution across the {activeDataset?.name || 'dataset'}.
                </p>
              </div>

              <ShapBeeswarmChart
                importance={shapData.global_importance}
                points={shapData.beeswarm_sample}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
