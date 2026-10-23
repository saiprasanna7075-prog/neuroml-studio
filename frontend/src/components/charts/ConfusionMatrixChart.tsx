import React, { useState, useMemo } from 'react';
import { Info, CheckCircle2, AlertTriangle, Layers, Sparkles } from 'lucide-react';

interface ConfusionMatrixProps {
  matrix: number[][];
  labels: (number | string)[];
}

export type QualityTier = 'low' | 'medium' | 'high' | 'other';

interface TierMeta {
  tier: QualityTier;
  badge: string;
  name: string;
  sub: string;
  colorHex: string;
  badgeBg: string;
  borderCol: string;
}

export const ConfusionMatrixChart: React.FC<ConfusionMatrixProps> = ({ matrix, labels }) => {
  const [activeCell, setActiveCell] = useState<{
    row: number;
    col: number;
    val: number;
    actualLabel: string;
    predLabel: string;
    isDiagonal: boolean;
  } | null>(null);

  const [viewMode, setViewMode] = useState<'standard' | 'three_tier'>('standard');

  if (!matrix || matrix.length === 0 || !labels || labels.length === 0) {
    return <div className="text-slate-400 text-xs font-mono p-4">No confusion matrix data available.</div>;
  }

  // Detect nature of labels
  const isBinary = labels.length === 2 && (
    (labels[0] === 0 && labels[1] === 1) ||
    (labels[0] === '0' && labels[1] === '1') ||
    String(labels[0]).toLowerCase().includes('low') ||
    String(labels[0]).toLowerCase().includes('normal')
  );

  const isAlreadyThreeTier = labels.length === 3 && (
    labels.some(l => String(l).toLowerCase().includes('low')) ||
    labels.some(l => String(l).toLowerCase().includes('medium'))
  );

  const isNumericScores = labels.some(l => {
    const n = Number(l);
    return !isNaN(n) && n >= 3 && n <= 9;
  });

  // Helper to determine tier metadata for any given label
  const getTierMeta = (lbl: number | string, index?: number): TierMeta => {
    const s = String(lbl).trim().toLowerCase();
    const num = Number(lbl);

    if (isBinary) {
      if (lbl === 0 || lbl === '0' || s.includes('low') || s.includes('normal') || s.includes('<6')) {
        return {
          tier: 'low',
          badge: 'Low (<6)',
          name: 'Low Quality',
          sub: 'Scores 3–5',
          colorHex: '#f43f5e',
          badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          borderCol: 'border-rose-500/40'
        };
      }
      return {
        tier: 'high',
        badge: 'High (≥6)',
        name: 'High Quality',
        sub: 'Scores 6–9',
        colorHex: '#10b981',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        borderCol: 'border-emerald-500/40'
      };
    }

    if (isAlreadyThreeTier || labels.length === 3) {
      if (s.includes('low') || s.includes('≤5') || (index === 0 && !isNaN(num))) {
        return {
          tier: 'low',
          badge: 'Low (≤5)',
          name: 'Low Quality',
          sub: 'Scores 3–5',
          colorHex: '#f43f5e',
          badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          borderCol: 'border-rose-500/40'
        };
      }
      if (s.includes('med') || s.includes('6') || (index === 1 && !isNaN(num))) {
        return {
          tier: 'medium',
          badge: 'Medium (6)',
          name: 'Medium Quality',
          sub: 'Score 6',
          colorHex: '#f59e0b',
          badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          borderCol: 'border-amber-500/40'
        };
      }
      return {
        tier: 'high',
        badge: 'High (≥7)',
        name: 'High Quality',
        sub: 'Scores 7–9',
        colorHex: '#10b981',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        borderCol: 'border-emerald-500/40'
      };
    }

    if (!isNaN(num) && num >= 3 && num <= 9) {
      if (num <= 5) {
        return {
          tier: 'low',
          badge: `Q${num} (Low)`,
          name: `Score ${num} (Low)`,
          sub: 'Low Quality (≤5)',
          colorHex: '#f43f5e',
          badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          borderCol: 'border-rose-500/40'
        };
      }
      if (num === 6) {
        return {
          tier: 'medium',
          badge: `Q6 (Med)`,
          name: 'Score 6 (Medium)',
          sub: 'Medium Quality (6)',
          colorHex: '#f59e0b',
          badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          borderCol: 'border-amber-500/40'
        };
      }
      return {
        tier: 'high',
        badge: `Q${num} (High)`,
        name: `Score ${num} (High)`,
        sub: 'High Quality (≥7)',
        colorHex: '#10b981',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        borderCol: 'border-emerald-500/40'
      };
    }

    return {
      tier: 'other',
      badge: String(lbl),
      name: String(lbl),
      sub: `Class ${lbl}`,
      colorHex: '#06b6d4',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      borderCol: 'border-cyan-500/40'
    };
  };

  // Compute 3-Tier Aggregated Matrix if requested and feasible
  const aggregatedThreeTier = useMemo(() => {
    if (isAlreadyThreeTier || labels.length === 3) return null;
    if (!isNumericScores && !isBinary) return null;

    if (isNumericScores) {
      // 3 Tiers: Low (3-5), Med (6), High (7-9)
      const aggMatrix = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ];
      matrix.forEach((row, r) => {
        const rowVal = Number(labels[r]);
        const rowTier = rowVal <= 5 ? 0 : rowVal === 6 ? 1 : 2;
        row.forEach((val, c) => {
          const colVal = Number(labels[c]);
          const colTier = colVal <= 5 ? 0 : colVal === 6 ? 1 : 2;
          aggMatrix[rowTier][colTier] += val;
        });
      });
      return {
        matrix: aggMatrix,
        labels: ['Low (≤5)', 'Medium (6)', 'High (≥7)']
      };
    }

    return null;
  }, [matrix, labels, isAlreadyThreeTier, isNumericScores, isBinary]);

  // Determine current active display matrix and labels
  const currentMatrix = (viewMode === 'three_tier' && aggregatedThreeTier)
    ? aggregatedThreeTier.matrix
    : matrix;

  const currentLabels = (viewMode === 'three_tier' && aggregatedThreeTier)
    ? aggregatedThreeTier.labels
    : labels;

  // Max value for heatmap color intensity
  let maxVal = 1;
  currentMatrix.forEach(row => {
    row.forEach(val => {
      if (val > maxVal) maxVal = val;
    });
  });

  // Calculate totals
  let totalSamples = 0;
  let correctSamples = 0;
  currentMatrix.forEach((row, i) => {
    row.forEach((val, j) => {
      totalSamples += val;
      if (i === j) correctSamples += val;
    });
  });
  const overallAcc = totalSamples > 0 ? ((correctSamples / totalSamples) * 100).toFixed(1) : '0';

  // Per-tier sample distribution & recall statistics
  const tierStats = useMemo(() => {
    const stats: Record<string, { total: number; correct: number; name: string; color: string }> = {};
    currentLabels.forEach((lbl, idx) => {
      const meta = getTierMeta(lbl, idx);
      const rowSum = currentMatrix[idx]?.reduce((a, b) => a + b, 0) || 0;
      const diagonal = currentMatrix[idx]?.[idx] || 0;
      stats[meta.name] = {
        total: rowSum,
        correct: diagonal,
        name: meta.name,
        color: meta.colorHex
      };
    });
    return stats;
  }, [currentMatrix, currentLabels]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Quality Tier Decoder & Identification Banner */}
      <div className="w-full mb-3 p-3 rounded-xl bg-[#0c1020] border border-[#1e2746]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-cyan-500/10 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-200 tracking-wide">
              Quality Tier Identification Guide
            </span>
          </div>

          {/* Toggle between standard view and 3-tier view if aggregated matrix available */}
          {aggregatedThreeTier && (
            <div className="flex items-center bg-[#141b34] p-0.5 rounded-lg border border-slate-700/60 text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('standard')}
                className={`px-2 py-0.5 rounded font-mono transition-all ${
                  viewMode === 'standard'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Discrete Ratings (3–9)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('three_tier')}
                className={`px-2 py-0.5 rounded font-mono transition-all flex items-center gap-1 ${
                  viewMode === 'three_tier'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3 h-3" />
                3-Tier Matrix (Low/Med/High)
              </button>
            </div>
          )}
        </div>

        {/* The 3 Quality Tiers Definitions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/5 border border-rose-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
            <div>
              <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                <span>Low Quality</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-200 font-mono">
                  Scores ≤ 5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Substandard / high volatile acidity or unbalanced chemistry.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
            <div>
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <span>Medium Quality</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 font-mono">
                  Score 6
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Standard commercial grade table wine (majority of market).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <span>High Quality</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200 font-mono">
                  Scores ≥ 7
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Premium reserve vintage with superior sensory balance.
              </p>
            </div>
          </div>
        </div>

        {/* Binary classification specific explanation */}
        {isBinary && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-cyan-300 font-semibold">Binary Mode Notice: </span>
              In this matrix, <span className="font-mono text-rose-300 font-bold">Q0</span> is{' '}
              <strong>Low Quality (&lt;6)</strong> and{' '}
              <span className="font-mono text-emerald-300 font-bold">Q1</span> is{' '}
              <strong>High Quality (≥6)</strong>. Standard Medium wine (score 6) is combined into Q1.
            </div>
          </div>
        )}
      </div>

      {/* Accuracy & Partition Header */}
      <div className="flex flex-wrap justify-between items-center w-full mb-3 text-xs font-mono text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-semibold">Evaluation Test Partition (30% Split)</span>
          {viewMode === 'three_tier' && aggregatedThreeTier && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Aggregated 3-Tier View
            </span>
          )}
        </div>
        <span>
          Accuracy: <strong className="text-emerald-400 text-sm font-bold">{overallAcc}%</strong>{' '}
          <span className="text-slate-500">({correctSamples}/{totalSamples} Correct)</span>
        </span>
      </div>

      {/* Confusion Matrix Grid Table */}
      <div className="overflow-x-auto w-full flex justify-center py-2">
        <div className="inline-block bg-[#080b16] p-3 rounded-xl border border-[#1b223c]">
          {/* Column Headers (Predicted Classes) */}
          <div className="flex items-center mb-2 text-center font-mono text-[11px]">
            <div className="w-32 text-right pr-3 font-semibold text-slate-400 text-[10px] uppercase tracking-wider">
              Actual \ Predicted
            </div>
            {currentLabels.map((lbl, idx) => {
              const meta = getTierMeta(lbl, idx);
              return (
                <div
                  key={idx}
                  className="w-20 sm:w-24 px-1 text-center font-bold flex flex-col items-center"
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${meta.badgeBg}`}>
                    {meta.badge}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5">{meta.sub}</span>
                </div>
              );
            })}
          </div>

          {/* Rows (Actual Classes) */}
          {currentMatrix.map((row, rowIdx) => {
            const rowMeta = getTierMeta(currentLabels[rowIdx], rowIdx);
            const rowTotal = row.reduce((a, b) => a + b, 0);

            return (
              <div key={rowIdx} className="flex items-center mb-1.5">
                {/* Row Header */}
                <div className="w-32 text-right pr-3 flex flex-col items-end">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${rowMeta.badgeBg} font-mono font-bold`}>
                    {rowMeta.badge}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                    {rowTotal} samples
                  </span>
                </div>

                {/* Row Cells */}
                {row.map((val, colIdx) => {
                  const colMeta = getTierMeta(currentLabels[colIdx], colIdx);
                  const ratio = val / maxVal;
                  const isDiagonal = rowIdx === colIdx;

                  const bgStyle = isDiagonal
                    ? `rgba(16, 185, 129, ${Math.max(0.18, ratio * 0.95)})` // emerald for correct
                    : val > 0
                    ? `rgba(239, 68, 68, ${Math.max(0.14, ratio * 0.75)})` // red/rose for error
                    : 'rgba(30, 35, 55, 0.35)';

                  const isHovered =
                    activeCell && activeCell.row === rowIdx && activeCell.col === colIdx;

                  return (
                    <div
                      key={colIdx}
                      style={{ backgroundColor: bgStyle }}
                      onMouseEnter={() =>
                        setActiveCell({
                          row: rowIdx,
                          col: colIdx,
                          val,
                          actualLabel: `${rowMeta.name} (${rowMeta.sub})`,
                          predLabel: `${colMeta.name} (${colMeta.sub})`,
                          isDiagonal
                        })
                      }
                      onMouseLeave={() => setActiveCell(null)}
                      className={`w-20 sm:w-24 h-12 flex flex-col items-center justify-center m-0.5 rounded-lg border transition-all cursor-pointer ${
                        isDiagonal
                          ? 'border-emerald-500/50 shadow-sm shadow-emerald-950/40'
                          : val > 0
                          ? 'border-rose-500/30'
                          : 'border-slate-800/40'
                      } ${isHovered ? 'scale-105 ring-2 ring-cyan-400 z-10' : 'hover:scale-[1.02]'}`}
                      title={`Actual: ${rowMeta.name} → Predicted: ${colMeta.name}: ${val} samples`}
                    >
                      <span
                        className={`text-sm font-bold font-mono ${
                          isDiagonal
                            ? 'text-emerald-100'
                            : val > 0
                            ? 'text-rose-200'
                            : 'text-slate-600'
                        }`}
                      >
                        {val}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400/80">
                        {totalSamples > 0 ? `${((val / totalSamples) * 100).toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Active Cell Inspector */}
      {activeCell ? (
        <div className="w-full mt-2 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs font-mono flex items-center justify-between text-slate-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            {activeCell.isDiagonal ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>
              Actual: <strong className="text-white">{activeCell.actualLabel}</strong>
              {' → '}
              Predicted: <strong className="text-white">{activeCell.predLabel}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-cyan-300">
              {activeCell.val} wines ({totalSamples > 0 ? ((activeCell.val / totalSamples) * 100).toFixed(1) : 0}% of test set)
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                activeCell.isDiagonal
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {activeCell.isDiagonal ? 'CORRECT PREDICTION' : 'MISCLASSIFICATION'}
            </span>
          </div>
        </div>
      ) : null}

      {/* Legend & Tier Breakdown Cards */}
      <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400 px-1 border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400" />
            <span className="text-slate-300">Correct Predictions (Diagonal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/70 border border-rose-400" />
            <span className="text-slate-300">Misclassification Error</span>
          </div>
        </div>

        {/* Per-Tier Recall Indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(tierStats).map(([name, stat], i) => {
            const recall = stat.total > 0 ? ((stat.correct / stat.total) * 100).toFixed(1) : '0';
            return (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]"
              >
                <span style={{ color: stat.color }} className="font-bold mr-1">
                  ● {name}:
                </span>
                <span className="text-slate-200 font-semibold">{recall}%</span>
                <span className="text-slate-500 ml-1">({stat.correct}/{stat.total})</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
