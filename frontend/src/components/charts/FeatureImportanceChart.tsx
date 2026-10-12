import React from 'react';
import { FeatureImportanceItem } from '../../types';

interface FeatureImportanceProps {
  importances: FeatureImportanceItem[];
  title?: string;
}

export const FeatureImportanceChart: React.FC<FeatureImportanceProps> = ({ importances, title = "Model Feature Importances (Gini Impurity Reduction)" }) => {
  if (!importances || importances.length === 0) {
    return <div className="text-slate-400 text-xs font-mono p-4">No feature importance data available for this model type.</div>;
  }

  const maxVal = Math.max(...importances.map(i => i.importance), 0.01);

  return (
    <div className="w-full bg-[#15182a] p-5 rounded-xl border border-[#22263d]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>{title}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/40">
              Scikit-Learn
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            Computed directly from tree split purity gains across all fitted decision trees.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {importances.map((item, idx) => {
          const pct = ((item.importance / maxVal) * 100);
          const rawPct = (item.importance * 100).toFixed(1);

          return (
            <div key={idx} className="flex items-center text-xs font-mono group">
              <div className="w-40 sm:w-48 text-right pr-4 text-slate-300 truncate" title={item.feature}>
                <span className="text-slate-500 text-[10px] mr-1.5">#{idx + 1}</span>
                <span className="font-medium group-hover:text-violet-300 transition-colors">{item.feature}</span>
              </div>

              <div className="flex-1 h-5 bg-[#0f111e] rounded overflow-hidden relative border border-[#22263d]/50 flex items-center">
                <div
                  style={{ width: `${pct}%` }}
                  className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded transition-all duration-500"
                />
              </div>

              <div className="w-16 pl-3 text-right text-slate-200 font-bold text-xs">
                {rawPct}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
