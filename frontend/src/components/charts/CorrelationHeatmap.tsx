import React from 'react';
import { CorrelationData } from '../../types';

interface CorrelationHeatmapProps {
  data: CorrelationData;
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ data }) => {
  if (!data || !data.features || data.features.length === 0) {
    return <div className="text-slate-400 text-xs font-mono p-4">No correlation matrix available.</div>;
  }

  const { features, matrix } = data;

  return (
    <div className="w-full bg-[#15182a] p-5 rounded-xl border border-[#22263d]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h4 className="text-sm font-semibold text-white">Pearson Correlation Matrix</h4>
          <p className="text-xs text-slate-400">
            Displays pairwise correlation coefficients between physicochemical measurements and wine quality.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-sky-400 text-[10px]">-1.0 (Inverse)</span>
          <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-sky-500 via-[#1e2337] to-rose-500 border border-slate-700" />
          <span className="text-rose-400 text-[10px]">+1.0 (Direct)</span>
        </div>
      </div>

      <div className="overflow-x-auto w-full py-2">
        <div className="inline-block min-w-full">
          {/* Header Row */}
          <div className="flex items-center mb-1 text-[10px] font-mono text-slate-400">
            <div className="w-32 text-right pr-2 shrink-0 truncate">Feature</div>
            {features.map((f, i) => (
              <div key={i} className="w-12 text-center truncate px-0.5" title={f}>
                {f.slice(0, 4)}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {matrix.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center mb-1">
              <div className="w-32 text-right pr-2 text-xs font-mono text-slate-300 truncate shrink-0" title={features[rIdx]}>
                {features[rIdx]}
              </div>
              {row.map((val, cIdx) => {
                // Color scaling
                // -1 to 0: blue/cyan
                // 0 to +1: rose/red
                let bgStyle = '#15182a';
                if (val > 0) {
                  bgStyle = `rgba(244, 63, 94, ${Math.min(0.9, Math.abs(val) * 0.95)})`;
                } else if (val < 0) {
                  bgStyle = `rgba(56, 189, 248, ${Math.min(0.9, Math.abs(val) * 0.95)})`;
                }

                return (
                  <div
                    key={cIdx}
                    style={{ backgroundColor: bgStyle }}
                    className="w-12 h-9 flex items-center justify-center m-0.5 rounded text-[11px] font-mono border border-slate-800/60 transition-transform hover:scale-110 cursor-pointer"
                    title={`${features[rIdx]} vs ${features[cIdx]}: r = ${val}`}
                  >
                    <span className="text-white font-bold drop-shadow">
                      {val.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
