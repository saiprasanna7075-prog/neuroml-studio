import React, { useState, useEffect } from 'react';
import {
  Wine,
  Layers,
  Box,
  Eye,
  Swords,
  BarChart2,
  FolderUp,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  CheckCircle2,
  Play
} from 'lucide-react';
import { HeroCanvas } from '../components/3d/HeroCanvas';
import { DatasetSummary, ExperimentItem } from '../types';
import { fetchDatasets, fetchExperiments } from '../services/api';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [experiments, setExperiments] = useState<ExperimentItem[]>([]);

  useEffect(() => {
    fetchDatasets().then(setDatasets).catch(() => {});
    fetchExperiments().then(data => setExperiments(data.experiments)).catch(() => {});
  }, []);

  const featuredAlgorithms = [
    {
      id: 'random_forest',
      name: 'Random Forest',
      category: 'Ensemble Learning',
      badgeColor: 'border-violet-500/40 text-violet-300 bg-violet-950/40',
      description: 'Combines multiple de-correlated decision trees with bagging to minimize variance and combat overfitting.',
      useCases: 'High-dimensional chemistry, sensor telemetry, tabular feature sets.',
      targetNav: 'wine'
    },
    {
      id: 'knn',
      name: 'K-Nearest Neighbors',
      category: 'Instance-Based',
      badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40',
      description: 'Non-parametric classification & regression based on local proximity in scaled Euclidean or Manhattan space.',
      useCases: 'Clustered physicochemical metrics, recommendation systems.',
      targetNav: 'wine'
    },
    {
      id: 'shap',
      name: 'SHAP TreeExplainer',
      category: 'Explainable AI',
      badgeColor: 'border-pink-500/40 text-pink-300 bg-pink-950/40',
      description: 'Game-theoretic attribution allocating fair credit to each feature for every individual prediction.',
      useCases: 'Model transparency, regulatory compliance, scientific insight.',
      targetNav: 'shap'
    },
    {
      id: 'mlp',
      name: 'Multi-Layer Perceptron',
      category: 'Deep Learning',
      badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40',
      description: 'Feedforward neural network passing activations through non-linear ReLU hidden layers via backpropagation.',
      useCases: 'Complex non-linear relationships, multi-target regression.',
      targetNav: 'explorer'
    }
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* 1. 3D Hero Scene */}
      <HeroCanvas
        onExploreClick={() => onNavigate('wine')}
        onWineAiClick={() => onNavigate('wine')}
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
        {/* 2. Laboratory System Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0f111e] p-5 rounded-2xl border border-[#22263d] space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Available Algorithms</span>
            </span>
            <div className="text-3xl font-black text-white font-mono">36</div>
            <p className="text-[10px] text-slate-500 font-mono">16 Regression + 20 Classification</p>
          </div>

          <div className="bg-[#0f111e] p-5 rounded-2xl border border-[#22263d] space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-violet-400" />
              <span>Loaded Datasets</span>
            </span>
            <div className="text-3xl font-black text-white font-mono">{datasets.length}</div>
            <p className="text-[10px] text-slate-500 font-mono">UCI Wine Benchmarks + Uploads</p>
          </div>

          <div className="bg-[#0f111e] p-5 rounded-2xl border border-[#22263d] space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Logged Experiments</span>
            </span>
            <div className="text-3xl font-black text-white font-mono">{experiments.length}</div>
            <p className="text-[10px] text-slate-500 font-mono">Persisted in SQLite Database</p>
          </div>

          <div className="bg-[#0f111e] p-5 rounded-2xl border border-[#22263d] space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>SHAP Explainability</span>
            </span>
            <div className="text-3xl font-black text-white font-mono">100%</div>
            <p className="text-[10px] text-slate-500 font-mono">TreeExplainer Active</p>
          </div>
        </div>

        {/* 3. Quick Access Laboratory Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => onNavigate('wine')}
            className="group bg-gradient-to-br from-[#0f111e] to-[#15182a] p-6 rounded-2xl border border-[#22263d] hover:border-cyan-500/50 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Wine className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-xs font-mono text-cyan-400 uppercase font-semibold">Flagship Project</div>
            <h3 className="text-lg font-bold text-white mt-1">Wine Quality Intelligence</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Predict wine scores with Random Forest and KNN on 11 physicochemical measurements using leak-free 70:30 splits.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
              <span>Open Wine AI Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('arena')}
            className="group bg-gradient-to-br from-[#0f111e] to-[#15182a] p-6 rounded-2xl border border-[#22263d] hover:border-violet-500/50 transition-all cursor-pointer shadow-lg hover:shadow-violet-500/10"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Swords className="w-6 h-6 text-violet-400" />
            </div>
            <div className="text-xs font-mono text-violet-400 uppercase font-semibold">Algorithm Benchmark</div>
            <h3 className="text-lg font-bold text-white mt-1">Model Arena Laboratory</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Pit algorithms against each other on identical evaluation sets to compare accuracy, F1, training latency, and confusion matrices.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono text-violet-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
              <span>Enter Comparison Arena</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('shap')}
            className="group bg-gradient-to-br from-[#0f111e] to-[#15182a] p-6 rounded-2xl border border-[#22263d] hover:border-pink-500/50 transition-all cursor-pointer shadow-lg hover:shadow-pink-500/10"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-950/80 border border-pink-500/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6 text-pink-400" />
            </div>
            <div className="text-xs font-mono text-pink-400 uppercase font-semibold">Transparent Decisions</div>
            <h3 className="text-lg font-bold text-white mt-1">SHAP Explainable AI Lab</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Unpack the black box: examine global beeswarm plots and local sample waterfalls explaining why a model output was generated.
            </p>
            <div className="flex items-center gap-1.5 text-xs font-mono text-pink-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
              <span>Inspect SHAP Attributions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* 4. Your ML Workspace: Algorithm Cards */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Your ML Workspace</h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore, configure, and train machine learning algorithms with genuine Scikit-Learn pipelines.
              </p>
            </div>

            <button
              onClick={() => onNavigate('algorithms')}
              className="px-4 py-2 rounded-xl bg-[#0f111e] hover:bg-[#15182a] border border-[#22263d] text-slate-300 text-xs font-mono flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All 16 Algorithms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAlgorithms.map((algo) => (
              <div
                key={algo.id}
                className="bg-[#0f111e] rounded-2xl border border-[#22263d] p-5 flex flex-col justify-between hover:border-slate-600 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-bold text-white">{algo.name}</h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${algo.badgeColor}`}>
                      {algo.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {algo.description}
                  </p>

                  <div className="pt-2 border-t border-[#22263d] text-[11px] font-mono">
                    <span className="text-slate-500 block mb-0.5">Optimal Use Case:</span>
                    <span className="text-slate-300">{algo.useCases}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(algo.targetNav)}
                  className="w-full py-2.5 rounded-xl bg-[#15182a] hover:bg-[#1d223a] border border-[#22263d] text-cyan-300 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 text-cyan-400" />
                  <span>Launch Workspace</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
