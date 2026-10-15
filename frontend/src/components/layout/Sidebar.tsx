import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Box,
  Wine,
  Swords,
  Eye,
  BarChart3,
  Sliders,
  FolderUp,
  GraduationCap,
  Sparkles,
  History,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, badge: null, badgeColor: '' },
    { id: 'wine', label: 'Wine Quality AI', icon: Wine, badge: 'Flagship', badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
    { id: 'algorithms', label: 'Algorithm Universe', icon: Layers, badge: '36', badgeColor: 'bg-violet-500/10 text-violet-300 border-violet-500/30' },
    { id: 'explorer', label: '3D Algorithm Lab', icon: Box, badge: '3D', badgeColor: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30' },
    { id: 'arena', label: 'Model Arena', icon: Swords, badge: 'Battle', badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
    { id: 'shap', label: 'SHAP Explainability', icon: Eye, badge: 'XAI', badgeColor: 'bg-pink-500/10 text-pink-300 border-pink-500/30' },
    { id: 'datastudio', label: 'Data Studio', icon: BarChart3, badge: null, badgeColor: '' },
    { id: 'predict', label: 'Predict a Wine', icon: Sliders, badge: null, badgeColor: '' },
    { id: 'workspace', label: 'Custom ML Workspace', icon: FolderUp, badge: 'Upload', badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
    { id: 'demo', label: 'Viva Presentation', icon: Sparkles, badge: 'Walkthrough', badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
    { id: 'learn', label: 'Educational Mode', icon: GraduationCap, badge: 'Viva Q&A', badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
    { id: 'history', label: 'Experiment History', icon: History, badge: null, badgeColor: '' },
  ];

  return (
    <aside className="w-64 bg-[#05070e]/85 backdrop-blur-xl border-r border-white/[0.07] flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] select-none">
      <div className="p-3.5 space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 py-2 font-semibold flex items-center justify-between">
          <span>Navigation Modules</span>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer group relative ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/20 via-indigo-600/15 to-transparent text-white border-l-[3px] border-l-violet-400 font-semibold shadow-[inset_0_0_15px_rgba(139,92,246,0.1)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.03] border-l-[3px] border-l-transparent'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-violet-500/20 text-cyan-300 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                      : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate tracking-tight font-medium text-[13px]">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 transition-transform group-hover:scale-105 ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] shadow-lg backdrop-blur-md">
        <div className="text-white text-xs font-semibold mb-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <span>B.Tech AIML Laboratory</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          High-dimensional chemical analysis with Random Forest, KNN, and SHAP TreeExplainer.
        </p>
      </div>
    </aside>
  );
};
