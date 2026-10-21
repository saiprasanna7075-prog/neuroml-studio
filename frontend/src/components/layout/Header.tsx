import React from 'react';
import { Cpu, Activity, Database, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeDatasetName?: string;
  backendHealthy: boolean;
  engineMode?: 'python' | 'cloud';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeDatasetName = "UCI Wine Quality",
  backendHealthy,
  engineMode = 'cloud'
}) => {
  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-[#05070e]/80 backdrop-blur-xl border-b border-white/[0.07] px-4 lg:px-8 flex items-center justify-between transition-colors">
      {/* Brand & Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setActiveTab('overview')}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(139,92,246,0.35)] group-hover:shadow-[0_0_28px_rgba(6,182,212,0.5)] transition-all duration-300">
            <div className="w-full h-full bg-[#070914] rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
        </div>

        <div>
          <span className="font-display text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
            NeuroML <span className="text-gradient-violet-cyan">Studio</span>
          </span>
          <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase block mt-1">
            3D Machine Learning Laboratory
          </span>
        </div>
      </div>

      {/* Middle Status Pill Indicators */}
      <div className="hidden md:flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-sm">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 font-normal">Dataset:</span>
          <span className="text-slate-100 font-semibold tracking-tight">{activeDatasetName}</span>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-sm">
          <Activity className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-slate-400 font-normal">AI Engine:</span>
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                engineMode === 'python'
                  ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse'
                  : 'bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse'
              }`}
            />
            <span className={engineMode === 'python' ? 'text-emerald-300' : 'text-cyan-300'}>
              {engineMode === 'python' ? 'Scikit-Learn & SHAP Online' : 'Cloud In-Memory AI Engine'}
            </span>
          </span>
        </div>
      </div>

      {/* Quick Launch Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setActiveTab('demo')}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600/30 via-indigo-600/30 to-cyan-500/20 hover:from-violet-600/40 hover:to-cyan-500/30 border border-violet-500/40 text-violet-200 text-xs font-semibold shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_22px_rgba(139,92,246,0.35)] transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Viva Presentation Mode</span>
        </button>

        <button
          onClick={() => setActiveTab('learn')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Learn Guide</span>
        </button>
      </div>
    </header>
  );
};
