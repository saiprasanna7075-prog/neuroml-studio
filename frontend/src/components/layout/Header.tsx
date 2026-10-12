import React from 'react';
import { Cpu, Activity, Database, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeDatasetName?: string;
  backendHealthy: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeDatasetName = "UCI White Wine",
  backendHealthy
}) => {
  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-[#080911]/90 backdrop-blur-md border-b border-[#22263d] px-4 lg:px-8 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <div className="w-full h-full bg-[#080911] rounded-[10px] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            NeuroML <span className="text-gradient-violet-cyan font-black">Studio</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 block -mt-1 tracking-wider uppercase">
            3D Machine Learning Laboratory
          </span>
        </div>
      </div>

      {/* Middle Status Pill Indicators */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f111e] border border-[#22263d]">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Dataset:</span>
          <span className="text-slate-200 font-semibold">{activeDatasetName}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f111e] border border-[#22263d]">
          <Activity className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-slate-400">AI Engine:</span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {backendHealthy ? 'Scikit-Learn & SHAP Online' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Quick Launch Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('demo')}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/20 to-cyan-600/20 hover:from-violet-600/30 hover:to-cyan-600/30 border border-violet-500/40 text-violet-300 text-xs font-mono transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Viva Presentation Mode</span>
        </button>

        <button
          onClick={() => setActiveTab('learn')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f111e] hover:bg-[#15182a] border border-[#22263d] text-slate-300 text-xs font-mono transition-all cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Learn Guide</span>
        </button>
      </div>
    </header>
  );
};
