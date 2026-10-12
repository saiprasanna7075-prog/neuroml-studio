import React from 'react';
import { GlobalShapItem, BeeswarmPoint } from '../../types';

interface ShapBeeswarmProps {
  importance: GlobalShapItem[];
  points: BeeswarmPoint[];
}

export const ShapBeeswarmChart: React.FC<ShapBeeswarmProps> = ({ importance, points }) => {
  if (!importance || importance.length === 0) {
    return <div className="text-slate-400 text-xs font-mono p-4">No SHAP beeswarm data available.</div>;
  }

  // Calculate min and max SHAP values for domain
  let minShap = -0.3;
  let maxShap = 0.3;
  points.forEach(p => {
    if (p.shap_value < minShap) minShap = p.shap_value;
    if (p.shap_value > maxShap) maxShap = p.shap_value;
  });

  const absMax = Math.max(Math.abs(minShap), Math.abs(maxShap), 0.2);

  // Group points by feature
  const pointsByFeature: { [feat: string]: BeeswarmPoint[] } = {};
  points.forEach(p => {
    if (!pointsByFeature[p.feature]) pointsByFeature[p.feature] = [];
    pointsByFeature[p.feature].push(p);
  });

  return (
    <div className="w-full bg-[#15182a] p-5 rounded-xl border border-[#22263d]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>SHAP Summary Beeswarm Plot</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/40">
              Global Impact
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            Horizontal position indicates whether feature value pushes wine quality prediction higher (+) or lower (-).
          </p>
        </div>

        {/* Color Legend */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-sky-400 text-[10px]">Low Value</span>
          <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-sky-400 via-purple-400 to-rose-500 border border-slate-700" />
          <span className="text-rose-400 text-[10px]">High Value</span>
        </div>
      </div>

      <div className="space-y-3.5 my-2">
        {importance.map((item, idx) => {
          const featPoints = pointsByFeature[item.feature] || [];

          return (
            <div key={idx} className="flex items-center text-xs font-mono group">
              {/* Feature Name */}
              <div className="w-40 sm:w-48 text-right pr-4 text-slate-300 truncate" title={item.feature}>
                <span className="text-slate-500 text-[10px] mr-1.5">#{item.rank}</span>
                <span className="font-medium group-hover:text-cyan-400 transition-colors">{item.feature}</span>
              </div>

              {/* Beeswarm Strip */}
              <div className="flex-1 h-7 bg-[#0f111e] rounded-lg relative overflow-hidden flex items-center border border-[#22263d]/60">
                {/* Zero Reference Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-600 z-0" />

                {/* Plotted sample points */}
                {featPoints.map((pt, pIdx) => {
                  // Position from 0 to 100%
                  const normalizedShap = (pt.shap_value / absMax) * 0.45; // -0.45 to +0.45
                  const leftPct = (0.5 + normalizedShap) * 100;
                  
                  // Color from normalized value (0.0=sky, 1.0=rose)
                  const hue = 195 - pt.normalized_value * 195; // 195 (cyan) down to 0 (red)
                  const bgColor = `hsl(${Math.max(0, hue)}, 90%, 60%)`;

                  // Pseudo vertical jitter
                  const topOffset = 18 + ((pIdx * 17) % 64);

                  return (
                    <div
                      key={pIdx}
                      style={{
                        left: `${Math.min(98, Math.max(2, leftPct))}%`,
                        top: `${topOffset}%`,
                        backgroundColor: bgColor
                      }}
                      className="absolute w-2 h-2 rounded-full opacity-75 transform -translate-x-1/2 -translate-y-1/2 hover:opacity-100 hover:scale-150 transition-all cursor-pointer z-10"
                      title={`${item.feature} = ${pt.feature_value} → SHAP Value: ${pt.shap_value > 0 ? '+' : ''}${pt.shap_value}`}
                    />
                  );
                })}
              </div>

              {/* Mean |SHAP| value */}
              <div className="w-16 pl-3 text-slate-400 text-right text-[11px] font-mono">
                {item.mean_abs_shap.toFixed(3)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis Footer */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-[#22263d] mt-3">
        <span className="pl-44 sm:pl-52">← Negative Impact (Pushes Quality Down)</span>
        <span className="text-slate-400">Baseline (0.0)</span>
        <span className="pr-16">Positive Impact (Pushes Quality Up) →</span>
      </div>
    </div>
  );
};
