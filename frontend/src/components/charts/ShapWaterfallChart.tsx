import React from 'react';
import { LocalExplanation } from '../../types';

interface ShapWaterfallProps {
  explanation: LocalExplanation;
  taskType?: string;
}

export const ShapWaterfallChart: React.FC<ShapWaterfallProps> = ({ explanation, taskType = 'classification' }) => {
  if (!explanation || !explanation.contributions) {
    return <div className="text-slate-400 text-xs font-mono p-4">No local SHAP explanation available.</div>;
  }

  const { base_value, predicted_value, actual_value, contributions, total_shap_sum } = explanation;

  // Find max magnitude for relative width calculation
  const maxAbs = Math.max(...contributions.map(c => Math.abs(c.shap_value)), 0.1);

  return (
    <div className="w-full bg-[#15182a] p-5 rounded-xl border border-[#22263d]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#22263d] gap-3">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Local SHAP Prediction Waterfall</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              Sample Attribution
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            Decomposes the prediction from the model baseline expected value E[f(x)] into individual physicochemical feature contributions.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono bg-[#0f111e] px-3 py-1.5 rounded-lg border border-[#22263d]">
          <div>
            <span className="text-slate-400">Base Value: </span>
            <strong className="text-slate-200">{base_value.toFixed(3)}</strong>
          </div>
          <div>
            <span className="text-slate-400">Model Output: </span>
            <strong className="text-cyan-400 font-bold">{predicted_value}</strong>
          </div>
          {actual_value !== undefined && actual_value !== null && (
            <div>
              <span className="text-slate-400">Actual: </span>
              <strong className="text-emerald-400">{actual_value}</strong>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2.5 my-4">
        {contributions.map((item, idx) => {
          const isPos = item.shap_value >= 0;
          const barWidth = Math.min(100, (Math.abs(item.shap_value) / maxAbs) * 100);

          return (
            <div key={idx} className="flex items-center text-xs font-mono group">
              {/* Feature value & name */}
              <div className="w-48 sm:w-56 text-right pr-4 text-slate-300 truncate">
                <span className="text-slate-500 text-[10px] mr-2">
                  ={item.feature_value}
                </span>
                <span className="font-medium group-hover:text-cyan-300 transition-colors">
                  {item.feature}
                </span>
              </div>

              {/* Bar track */}
              <div className="flex-1 h-6 bg-[#0f111e] rounded flex items-center px-1 relative border border-[#22263d]/50">
                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-700" />

                {isPos ? (
                  // Positive contribution (from center rightwards)
                  <div className="absolute left-1/2 flex items-center h-4 rounded-r" style={{ width: `${barWidth / 2}%` }}>
                    <div className="w-full h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-r shadow-sm shadow-emerald-500/30" />
                  </div>
                ) : (
                  // Negative contribution (from center leftwards)
                  <div className="absolute right-1/2 flex items-center h-4 rounded-l justify-end" style={{ width: `${barWidth / 2}%` }}>
                    <div className="w-full h-full bg-gradient-to-l from-rose-600 to-rose-400 rounded-l shadow-sm shadow-rose-500/30" />
                  </div>
                )}
              </div>

              {/* Numerical SHAP value */}
              <div className={`w-20 pl-3 text-right text-xs font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPos ? `+${item.shap_value.toFixed(3)}` : item.shap_value.toFixed(3)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#0f111e] p-3 rounded-lg border border-[#22263d] flex flex-col sm:flex-row justify-between items-center text-xs font-mono gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Pushes Prediction Higher
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Pushes Prediction Lower
          </span>
        </div>
        <div className="text-slate-400">
          Sum of Local Contributions: <strong className="text-white">{total_shap_sum > 0 ? `+${total_shap_sum}` : total_shap_sum}</strong>
        </div>
      </div>
    </div>
  );
};
