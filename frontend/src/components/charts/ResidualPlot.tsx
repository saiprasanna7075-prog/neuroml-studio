import React from 'react';
import { ActualVsPredictedItem } from '../../types';

interface ResidualPlotProps {
  data: ActualVsPredictedItem[];
  taskType?: string;
}

export const ResidualPlot: React.FC<ResidualPlotProps> = ({ data, taskType = "regression" }) => {
  if (!data || data.length === 0) {
    return <div className="text-slate-400 text-xs font-mono p-4">No test evaluation samples to plot.</div>;
  }

  // Calculate range of values
  const actuals = data.map(d => Number(d.actual));
  const preds = data.map(d => Number(d.predicted));
  const minVal = Math.floor(Math.min(...actuals, ...preds));
  const maxVal = Math.ceil(Math.max(...actuals, ...preds));
  const span = Math.max(maxVal - minVal, 1);

  return (
    <div className="w-full bg-[#15182a] p-5 rounded-xl border border-[#22263d]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Actual vs Predicted Evaluation Plot</h4>
          <p className="text-xs text-slate-400">
            Dotted 45° diagonal represents perfect prediction fidelity (Actual = Predicted).
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing {data.length} test samples
        </div>
      </div>

      <div className="relative w-full h-64 bg-[#0f111e] rounded-lg border border-[#22263d] p-4 flex items-center justify-center overflow-hidden">
        {/* Ideal 45-degree diagonal line */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <line
              x1="5%"
              y1="95%"
              x2="95%"
              y2="5%"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Scatter points */}
        <div className="relative w-full h-full">
          {data.map((item, idx) => {
            const xPct = 5 + ((Number(item.actual) - minVal) / span) * 90;
            const yPct = 95 - ((Number(item.predicted) - minVal) / span) * 90;
            const err = Math.abs(Number(item.actual) - Number(item.predicted));
            const color = err === 0 ? '#10b981' : err <= 0.5 ? '#38bdf8' : '#f43f5e';

            return (
              <div
                key={idx}
                style={{
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  backgroundColor: color
                }}
                className="absolute w-2.5 h-2.5 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-75 hover:opacity-100 hover:scale-150 transition-all cursor-pointer border border-black/50"
                title={`Sample #${item.sample_index}: Actual = ${item.actual}, Predicted = ${item.predicted} (Error: ${item.error ?? err})`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mt-3 pt-2 border-t border-[#22263d]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Accurate Match</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span>Low Residual (±0.5)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Deviation</span>
        </div>
      </div>
    </div>
  );
};
