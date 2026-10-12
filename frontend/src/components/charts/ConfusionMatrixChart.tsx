import React from 'react';

interface ConfusionMatrixProps {
  matrix: number[][];
  labels: (number | string)[];
}

export const ConfusionMatrixChart: React.FC<ConfusionMatrixProps> = ({ matrix, labels }) => {
  if (!matrix || matrix.length === 0 || !labels || labels.length === 0) {
    return <div className="text-slate-400 text-xs font-mono p-4">No confusion matrix data available.</div>;
  }

  // Find max value for color scaling
  let maxVal = 1;
  matrix.forEach(row => {
    row.forEach(val => {
      if (val > maxVal) maxVal = val;
    });
  });

  // Calculate total samples
  let totalSamples = 0;
  let correctSamples = 0;
  matrix.forEach((row, i) => {
    row.forEach((val, j) => {
      totalSamples += val;
      if (i === j) correctSamples += val;
    });
  });
  const overallAcc = totalSamples > 0 ? ((correctSamples / totalSamples) * 100).toFixed(1) : '0';

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-3 text-xs font-mono text-slate-400">
        <span className="text-cyan-400 font-semibold">Evaluation Test Partition (30% Split)</span>
        <span>Accuracy: <strong className="text-emerald-400">{overallAcc}%</strong> ({correctSamples}/{totalSamples} Correct)</span>
      </div>

      <div className="overflow-x-auto w-full flex justify-center py-2">
        <div className="inline-block">
          <div className="flex items-center mb-1 text-center font-mono text-[11px] text-slate-400">
            <div className="w-16 text-right pr-2">Actual \ Pred</div>
            {labels.map((lbl, idx) => (
              <div key={idx} className="w-12 text-center text-slate-300 font-bold">
                Q{lbl}
              </div>
            ))}
          </div>

          {matrix.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center mb-1">
              <div className="w-16 text-right pr-2 text-xs font-mono font-bold text-slate-300">
                Q{labels[rowIdx]}
              </div>
              {row.map((val, colIdx) => {
                const ratio = val / maxVal;
                const isDiagonal = rowIdx === colIdx;
                const bgStyle = isDiagonal
                  ? `rgba(16, 185, 129, ${Math.max(0.15, ratio * 0.9)})` // emerald for correct
                  : val > 0
                  ? `rgba(239, 68, 68, ${Math.max(0.12, ratio * 0.7)})` // red for misclassified
                  : 'rgba(30, 35, 55, 0.4)';

                return (
                  <div
                    key={colIdx}
                    style={{ backgroundColor: bgStyle }}
                    className={`w-12 h-10 flex flex-col items-center justify-center m-0.5 rounded border ${isDiagonal ? 'border-emerald-500/40' : 'border-slate-800/40'} text-xs font-mono transition-transform hover:scale-105`}
                    title={`Actual Quality ${labels[rowIdx]} → Predicted Quality ${labels[colIdx]}: ${val} samples`}
                  >
                    <span className={`font-bold ${isDiagonal ? 'text-emerald-200' : val > 0 ? 'text-rose-200' : 'text-slate-500'}`}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-3 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-500/80 border border-emerald-400" />
          <span>True Positive (Correct Predictions)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-rose-500/60 border border-rose-400" />
          <span>Misclassification Error</span>
        </div>
      </div>
    </div>
  );
};
