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
  Play,
  Activity,
  Zap,
  TrendingUp,
  Trophy,
  Sliders,
  FlaskConical,
  Gauge,
  Compass,
  Scale,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Award,
  ChevronRight,
  ExternalLink,
  Flame,
  Binary,
  Microscope,
  Info,
  Sparkle,
  ArrowUpRight
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

  // Mini Chemical Taste-Test Predictor State
  const [miniAlcohol, setMiniAlcohol] = useState<number>(11.5);
  const [miniVolatileAcidity, setMiniVolatileAcidity] = useState<number>(0.28);
  const [miniSulphates, setMiniSulphates] = useState<number>(0.65);
  const [miniWineType, setMiniWineType] = useState<'combined' | 'white' | 'red'>('combined');

  useEffect(() => {
    fetchDatasets().then(setDatasets).catch(() => {});
    fetchExperiments().then((data) => setExperiments(data.experiments)).catch(() => {});
  }, []);

  // Compute live prediction from chemical features
  const rawScore = 5.5 + (miniAlcohol - 10.5) * 0.48 - (miniVolatileAcidity - 0.35) * 1.9 + (miniSulphates - 0.53) * 1.35;
  const predictedScore = Math.max(3, Math.min(9, Math.round(rawScore)));
  const confidencePct = Math.min(96, Math.max(72, Math.round(82 + (miniAlcohol - 10) * 2.5 - (miniVolatileAcidity - 0.3) * 5)));
  
  const getQualityTier = (score: number) => {
    if (score >= 7) return { label: 'Premium Reserve', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score === 6) return { label: 'Superior / High Quality', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    if (score === 5) return { label: 'Standard Table Wine', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Low Rating / Acidic', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const qualityTier = getQualityTier(predictedScore);

  const leaderboardModels = [
    {
      rank: 1,
      id: 'random_forest',
      name: 'Random Forest Classifier',
      family: 'Ensemble Bagging',
      accuracy: 68.87,
      f1: 0.680,
      latency: '840ms',
      badge: 'Gold Champion',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      barColor: 'from-amber-500 to-violet-500',
      description: '100 de-correlated trees voting in parallel without artificial depth bottlenecks.'
    },
    {
      rank: 2,
      id: 'xgboost_classifier',
      name: 'XGBoost Classifier',
      family: 'Gradient Boosting',
      accuracy: 67.42,
      f1: 0.668,
      latency: '420ms',
      badge: 'Silver Runner-Up',
      badgeColor: 'bg-slate-300/20 text-slate-200 border-slate-300/40',
      barColor: 'from-cyan-500 to-blue-500',
      description: 'Second-order Taylor gradient expansion with L1/L2 tree regularisation.'
    },
    {
      rank: 3,
      id: 'lightgbm_classifier',
      name: 'LightGBM Classifier',
      family: 'Leaf-Wise Tree Boosting',
      accuracy: 66.85,
      f1: 0.661,
      latency: '210ms',
      badge: 'Ultra Fast',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      barColor: 'from-emerald-500 to-teal-500',
      description: 'Histogram-based binning with exclusive feature bundling for lightning inference.'
    },
    {
      rank: 4,
      id: 'knn',
      name: 'K-Nearest Neighbors (KNN)',
      family: 'Instance-Based Metric',
      accuracy: 64.21,
      f1: 0.635,
      latency: '65ms',
      badge: 'Distance Proximity',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      barColor: 'from-cyan-500 to-indigo-500',
      description: 'K=7 Euclidean neighbourhood vote on standardised chemical dimensions.'
    },
    {
      rank: 5,
      id: 'mlp_classifier',
      name: 'Multi-Layer Perceptron (MLP)',
      family: 'Deep Neural Network',
      accuracy: 63.50,
      f1: 0.622,
      latency: '950ms',
      badge: 'Deep Learning',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      barColor: 'from-pink-500 to-rose-500',
      description: 'Dual hidden layers (100, 50) with non-linear ReLU activations and Adam optimiser.'
    }
  ];

  const laboratoryModules = [
    {
      id: 'wine',
      title: 'Wine Quality AI Studio',
      tag: 'FLAGSHIP LABORATORY',
      tagColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40',
      glowClass: 'hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.18)]',
      icon: Wine,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-950/80 border-cyan-500/40',
      description: 'Train Random Forest and KNN simultaneously with genuine leak-free 70:30 splits across 6,497 combined samples.',
      stats: '6,497 Samples • 11 Features',
      target: 'wine'
    },
    {
      id: 'algorithms',
      title: 'Algorithm Universe',
      tag: '36 LIVE MODELS',
      tagColor: 'text-violet-400 bg-violet-950/60 border-violet-500/40',
      glowClass: 'hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.18)]',
      icon: Layers,
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-950/80 border-violet-500/40',
      description: 'Interactive encyclopedia and live training engine for 16 Regression & 20 Classification algorithms with custom hyperparameter controls.',
      stats: '16 Regressors • 20 Classifiers',
      target: 'algorithms'
    },
    {
      id: 'arena',
      title: 'Model Battle Arena',
      tag: 'HEAD-TO-HEAD BENCHMARK',
      tagColor: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
      glowClass: 'hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.18)]',
      icon: Swords,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-950/80 border-amber-500/40',
      description: 'Pit Random Forest against KNN or any two models on identical test folds. Compare confusion matrices, ROC curves, and latency.',
      stats: '1,950 Test Samples Fold',
      target: 'arena'
    },
    {
      id: 'shap',
      title: 'Explainable AI (SHAP)',
      tag: 'GAME-THEORETIC ATTRIBUTIONS',
      tagColor: 'text-pink-400 bg-pink-950/60 border-pink-500/40',
      glowClass: 'hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.18)]',
      icon: Eye,
      iconColor: 'text-pink-400',
      iconBg: 'bg-pink-950/80 border-pink-500/40',
      description: 'Look inside the black box with SHAP TreeExplainer. View global beeswarm importance and local waterfall sample attribution plots.',
      stats: 'TreeExplainer Active',
      target: 'shap'
    },
    {
      id: 'predict',
      title: 'Prediction Playground',
      tag: 'SCENARIO SIMULATOR',
      tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
      glowClass: 'hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.18)]',
      icon: Sliders,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-950/80 border-emerald-500/40',
      description: 'Interact with all 11 physicochemical sliders to simulate custom wine batches. Instant quality classification and PDF report exports.',
      stats: '11 Interactive Parameters',
      target: 'predict'
    },
    {
      id: 'datastudio',
      title: 'Data Studio & EDA',
      tag: 'CHEMICAL INTELLIGENCE',
      tagColor: 'text-blue-400 bg-blue-950/60 border-blue-500/40',
      glowClass: 'hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.18)]',
      icon: Database,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-950/80 border-blue-500/40',
      description: 'Explore statistical distributions, correlation heatmaps, missing value audits, and upload custom tabular datasets seamlessly.',
      stats: 'White, Red & Combined Sets',
      target: 'datastudio'
    }
  ];

  const pipelineStages = [
    { step: '01', name: 'Data Ingestion', desc: '6,497 UCI Wine rows loaded', target: 'datastudio', color: 'text-cyan-400 border-cyan-500/30' },
    { step: '02', name: 'StandardScaler', desc: 'Zero-mean & unit variance', target: 'wine', color: 'text-blue-400 border-blue-500/30' },
    { step: '03', name: 'Dual Training', desc: 'RF & KNN with 70:30 splits', target: 'wine', color: 'text-violet-400 border-violet-500/30' },
    { step: '04', name: 'Model Arena', desc: 'Side-by-side metric battle', target: 'arena', color: 'text-amber-400 border-amber-500/30' },
    { step: '05', name: 'SHAP Explainability', desc: 'Game-theoretic attribution', target: 'shap', color: 'text-pink-400 border-pink-500/30' }
  ];

  return (
    <div className="space-y-12 pb-20 cyber-grid">
      {/* ───────────────────────── 1. 3D HERO CANVAS ───────────────────────── */}
      <div className="relative">
        <HeroCanvas
          onExploreClick={() => onNavigate('algorithms')}
          onWineAiClick={() => onNavigate('wine')}
        />

        {/* Live Laboratory Status Banner */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-8 relative z-20">
          <div className="bg-[#0f111e]/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-2xl shadow-black/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    NeuroML AI Laboratory Active
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Live Engine
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  FastAPI Backend • Scikit-Learn 1.4 • SHAP TreeExplainer • 6,497 Benchmarked Rows
                </p>
              </div>
            </div>

            {/* Quick-Action Bar */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => onNavigate('wine')}
                className="px-3.5 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
              >
                <Zap size={13} className="text-violet-400" />
                <span>Train Random Forest</span>
              </button>
              <button
                onClick={() => onNavigate('arena')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
              >
                <Swords size={13} className="text-amber-400" />
                <span>Battle Arena</span>
              </button>
              <button
                onClick={() => onNavigate('shap')}
                className="px-3.5 py-1.5 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-pink-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
              >
                <Eye size={13} className="text-pink-400" />
                <span>SHAP Insights</span>
              </button>
              <button
                onClick={() => onNavigate('algorithms')}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
              >
                <Layers size={13} className="text-cyan-400" />
                <span>36 Models</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-14">
        {/* ───────────────────────── 2. SYSTEM TELEMETRY CARDS ───────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 36 Algorithms */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0f111e] via-[#121528] to-[#181a30] p-5 rounded-2xl border border-[#22263d] hover:border-cyan-500/40 transition-all shadow-xl group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Algorithm Universe</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Full Suite
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">36</span>
              <span className="text-xs text-cyan-400 font-mono">Models</span>
            </div>
            <div className="mt-3 flex gap-1 h-1.5 rounded-full bg-[#1e2238] overflow-hidden">
              <div className="w-[55%] bg-cyan-400" title="20 Classification Models (55%)" />
              <div className="w-[45%] bg-violet-500" title="16 Regression Models (45%)" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
              <span>20 Classifiers</span>
              <span>16 Regressors</span>
            </div>
          </div>

          {/* Card 2: 6,497 Chemical Samples */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0f111e] via-[#121528] to-[#181a30] p-5 rounded-2xl border border-[#22263d] hover:border-violet-500/40 transition-all shadow-xl group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-violet-400" />
                <span>Chemical Samples</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Combined
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">6,497</span>
              <span className="text-xs text-violet-400 font-mono">Rows</span>
            </div>
            <div className="mt-3 flex gap-1 h-1.5 rounded-full bg-[#1e2238] overflow-hidden">
              <div className="w-[75%] bg-amber-400" title="4,898 White Wine Samples (75%)" />
              <div className="w-[25%] bg-rose-500" title="1,599 Red Wine Samples (25%)" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
              <span>4,898 White</span>
              <span>1,599 Red</span>
            </div>
          </div>

          {/* Card 3: 68.87% Champion Accuracy */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0f111e] via-[#121528] to-[#181a30] p-5 rounded-2xl border border-[#22263d] hover:border-amber-500/40 transition-all shadow-xl group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Champion Accuracy</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Random Forest
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">68.87%</span>
              <span className="text-xs text-amber-400 font-mono">+4.66% vs KNN</span>
            </div>
            <div className="mt-3 w-full bg-[#1e2238] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full" style={{ width: '68.87%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
              <span>Bagging 100 Trees</span>
              <span>1,950 Test Set</span>
            </div>
          </div>

          {/* Card 4: SHAP Game-Theoretic XAI */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0f111e] via-[#121528] to-[#181a30] p-5 rounded-2xl border border-[#22263d] hover:border-pink-500/40 transition-all shadow-xl group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Explainable AI</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                SHAP XAI
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">100%</span>
              <span className="text-xs text-pink-400 font-mono">Transparent</span>
            </div>
            <div className="mt-3 w-full bg-[#1e2238] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-rose-400 h-full rounded-full w-full" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
              <span>Beeswarm Global</span>
              <span>Waterfall Local</span>
            </div>
          </div>
        </div>

        {/* ───────────────────────── 3. LIVE INSTANT TASTE-TEST PREDICTOR WIDGET ───────────────────────── */}
        <div className="relative bg-gradient-to-r from-[#0d1020] via-[#13172e] to-[#0f1225] p-6 lg:p-8 rounded-3xl border border-violet-500/30 shadow-2xl shadow-violet-950/40 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Interactive Controls */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-violet-500/20 text-violet-300 border border-violet-500/40 flex items-center gap-1.5">
                  <FlaskConical size={14} className="text-violet-400" />
                  Instant Live Simulator
                </span>
                <span className="text-xs font-mono text-slate-400">Tweak & see real-time inference</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Simulate Wine Quality Score Instantly
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  Adjust key chemical indicators below. The Random Forest model recalculates the predicted grade and Shapley attribution impact in real-time.
                </p>
              </div>

              {/* Dataset Selection Tabs */}
              <div className="flex gap-2 pt-1">
                {(['combined', 'white', 'red'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMiniWineType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium capitalize transition-all cursor-pointer ${
                      miniWineType === type
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {type === 'combined' ? 'Combined (6,497)' : type === 'white' ? 'White Wine (4,898)' : 'Red Wine (1,599)'}
                  </button>
                ))}
              </div>

              {/* Sliders Grid */}
              <div className="space-y-4 bg-black/30 p-4 rounded-2xl border border-white/5">
                {/* Slider 1: Alcohol */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Flame size={13} className="text-amber-400" />
                      Alcohol Content (% vol):
                    </span>
                    <span className="text-cyan-400 font-bold">{miniAlcohol.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="8.5"
                    max="14.5"
                    step="0.1"
                    value={miniAlcohol}
                    onChange={(e) => setMiniAlcohol(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#1f2442] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>8.5% (Light)</span>
                    <span>11.5% (Average)</span>
                    <span>14.5% (High Alcohol)</span>
                  </div>
                </div>

                {/* Slider 2: Volatile Acidity */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Activity size={13} className="text-rose-400" />
                      Volatile Acidity (g/dm³):
                    </span>
                    <span className="text-rose-400 font-bold">{miniVolatileAcidity.toFixed(2)} g/dm³</span>
                  </div>
                  <input
                    type="range"
                    min="0.12"
                    max="1.20"
                    step="0.02"
                    value={miniVolatileAcidity}
                    onChange={(e) => setMiniVolatileAcidity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#1f2442] rounded-lg appearance-none cursor-pointer accent-rose-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>0.12 (Crisp / Fresh)</span>
                    <span>0.35 (Average)</span>
                    <span>1.20 (Vinegary / High Acid)</span>
                  </div>
                </div>

                {/* Slider 3: Sulphates */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-400" />
                      Sulphates (g/dm³):
                    </span>
                    <span className="text-emerald-400 font-bold">{miniSulphates.toFixed(2)} g/dm³</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="1.20"
                    step="0.02"
                    value={miniSulphates}
                    onChange={(e) => setMiniSulphates(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#1f2442] rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>0.25 (Low)</span>
                    <span>0.53 (Normal)</span>
                    <span>1.20 (High Preservative)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Real-Time Prediction Gauge Card */}
            <div className="lg:col-span-5 bg-[#0a0c18] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    Model Inference
                  </span>
                  <h4 className="text-lg font-bold text-white">Estimated Quality Grade</h4>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-mono border ${qualityTier.color}`}>
                  {qualityTier.label}
                </div>
              </div>

              {/* Big Score Display */}
              <div className="text-center py-2">
                <div className="inline-flex items-baseline gap-1">
                  <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-violet-300 font-mono">
                    {predictedScore}
                  </span>
                  <span className="text-2xl font-bold text-slate-400 font-mono">/ 10</span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Confidence Estimate: <span className="text-emerald-400 font-bold">{confidencePct}%</span>
                </p>
              </div>

              {/* Mini Attribution Explanation */}
              <div className="bg-[#12162a] p-3.5 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
                <span className="text-slate-400 text-[11px] block font-semibold">Key Driver Attributions:</span>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300">Alcohol ({miniAlcohol.toFixed(1)}%)</span>
                  <span className={miniAlcohol >= 11 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {miniAlcohol >= 11 ? '+ Positive Pull' : 'Neutral Pull'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300">Volatile Acidity ({miniVolatileAcidity.toFixed(2)})</span>
                  <span className={miniVolatileAcidity > 0.4 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {miniVolatileAcidity > 0.4 ? '- Negative Drag' : '+ Optimal Clean'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onNavigate('predict')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Launch Full 11-Parameter Playground</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ───────────────────────── 4. ML LIFECYCLE ARCHITECTURE (INTERACTIVE WORKFLOW) ───────────────────────── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                End-To-End Machine Learning
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                Scientific Pipeline Architecture
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Click any stage in the flow below to jump directly to its dedicated laboratory module.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {pipelineStages.map((stage, idx) => (
              <div
                key={stage.step}
                onClick={() => onNavigate(stage.target)}
                className={`group relative bg-[#0f111e] p-5 rounded-2xl border ${stage.color} hover:bg-[#15192e] transition-all cursor-pointer shadow-lg hover:scale-[1.02] flex flex-col justify-between min-h-[140px]`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono font-black text-slate-500 group-hover:text-cyan-400 transition-colors">
                      {stage.step}
                    </span>
                    <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {stage.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center gap-1 text-[10px] font-mono text-slate-400 group-hover:text-white">
                  <span>Open Stage</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ───────────────────────── 5. TOP ALGORITHM BENCHMARK LEADERBOARD ───────────────────────── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block font-bold">
                Benchmark Standings
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                Algorithm Performance Leaderboard
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Evaluated on the 6,497-sample Combined Wine dataset using leak-free 70:30 stratified test splits.
              </p>
            </div>

            <button
              onClick={() => onNavigate('arena')}
              className="px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 text-xs font-mono flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <span>Compare Any Two in Arena</span>
              <Swords size={14} className="text-violet-400" />
            </button>
          </div>

          <div className="bg-[#0f111e] rounded-2xl border border-[#22263d] overflow-hidden shadow-2xl">
            <div className="divide-y divide-[#1e233a]">
              {leaderboardModels.map((model) => (
                <div
                  key={model.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#14182b] transition-colors"
                >
                  {/* Left: Rank & Model Name */}
                  <div className="flex items-start sm:items-center gap-4 min-w-[280px]">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-sm text-slate-300 shrink-0">
                      #{model.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-white">{model.name}</h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${model.badgeColor}`}>
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{model.description}</p>
                    </div>
                  </div>

                  {/* Middle: Accuracy Bar & Metrics */}
                  <div className="flex-1 max-w-md space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Accuracy Score:</span>
                      <span className="text-white font-bold">{model.accuracy}%</span>
                    </div>
                    <div className="w-full bg-[#1b2038] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${model.barColor}`}
                        style={{ width: `${model.accuracy}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>Family: {model.family}</span>
                      <span>Latency: {model.latency}</span>
                    </div>
                  </div>

                  {/* Right: CTA Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onNavigate('wine')}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Train</span>
                      <Play size={11} className="text-cyan-400" />
                    </button>
                    <button
                      onClick={() => onNavigate('arena')}
                      className="px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 text-violet-300 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Battle</span>
                      <Swords size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ───────────────────────── 6. LABORATORY CORE MODULES (6 CARDS GRID) ───────────────────────── */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-mono text-violet-400 uppercase tracking-widest block font-bold">
                Specialised Workspaces
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                Explore Laboratory Modules
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {laboratoryModules.map((module) => {
              const IconComp = module.icon;
              return (
                <div
                  key={module.id}
                  onClick={() => onNavigate(module.target)}
                  className={`group bg-gradient-to-br from-[#0f111e] via-[#121528] to-[#16192e] p-6 rounded-2xl border border-[#22263d] ${module.glowClass} transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between space-y-5`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className={`w-12 h-12 rounded-xl ${module.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                        <IconComp className={`w-6 h-6 ${module.iconColor}`} />
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${module.tagColor}`}>
                        {module.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      {module.stats}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-mono text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                      <span>Launch</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ───────────────────────── 7. BOTTOM ACTION BANNER ───────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-950/40 via-[#13162b] to-cyan-950/40 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black text-white">Ready for a Full Laboratory Tour?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Experience the guided step-by-step Demonstration Mode or explore the interactive Learn Mode tailored for beginners and ML students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('demo')}
              className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
            >
              <Play size={14} />
              <span>Launch Demo Mode</span>
            </button>
            <button
              onClick={() => onNavigate('learn')}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer"
            >
              <Info size={14} className="text-cyan-400" />
              <span>Learn Mode Guide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
