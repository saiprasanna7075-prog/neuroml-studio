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
  History
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'wine', label: 'Wine Quality AI', icon: Wine, badge: 'Flagship' },
    { id: 'algorithms', label: 'Algorithm Universe', icon: Layers, badge: '16' },
    { id: 'explorer', label: '3D Algorithm Lab', icon: Box, badge: '3D' },
    { id: 'arena', label: 'Model Arena', icon: Swords, badge: 'VS' },
    { id: 'shap', label: 'SHAP Explainability', icon: Eye, badge: 'XAI' },
    { id: 'datastudio', label: 'Data Studio', icon: BarChart3, badge: null },
    { id: 'predict', label: 'Predict a Wine', icon: Sliders, badge: null },
    { id: 'workspace', label: 'Custom ML Workspace', icon: FolderUp, badge: 'Upload' },
    { id: 'demo', label: 'Viva Presentation', icon: Sparkles, badge: 'Walkthrough' },
    { id: 'learn', label: 'Educational Mode', icon: GraduationCap, badge: 'Viva Q&A' },
    { id: 'history', label: 'Experiment History', icon: History, badge: null },
  ];

  return (
    <aside className="w-64 bg-[#080911] border-r border-[#22263d] flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-2 font-bold">
          Navigation Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/10 text-white border border-violet-500/40 font-semibold shadow-sm shadow-violet-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f111e] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wide shrink-0 ${
                    item.badge === 'Flagship'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                      : item.badge === '3D'
                      ? 'bg-violet-950 text-violet-300 border border-violet-800/50'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 m-3 rounded-xl bg-[#0f111e] border border-[#22263d] text-[11px] font-mono text-slate-400">
        <div className="text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          B.Tech AIML Capstone
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          High-dimensional physicochemical feature analysis with Random Forest & KNN.
        </p>
      </div>
    </aside>
  );
};
