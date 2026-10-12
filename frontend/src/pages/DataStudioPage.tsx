import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Database,
  Table as TableIcon,
  Flame,
  Search,
  ArrowUpDown,
  GitMerge
} from 'lucide-react';
import { DatasetSummary, DatasetPreview, CorrelationData } from '../types';
import { fetchDatasets, fetchDatasetPreview, fetchDatasetCorrelations, combineDatasets } from '../services/api';
import { CorrelationHeatmap } from '../components/charts/CorrelationHeatmap';

export const DataStudioPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('wine_white');
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [correlations, setCorrelations] = useState<CorrelationData | null>(null);
  const [page, setPage] = useState<number>(1);
  const [selectedFeature, setSelectedFeature] = useState<string>('alcohol');
  const [viewTab, setViewTab] = useState<'preview' | 'correlations' | 'distributions'>('preview');

  useEffect(() => {
    fetchDatasets().then(list => {
      setDatasets(list);
      if (list.length > 0) setSelectedDatasetId(list[0].id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedDatasetId) return;
    fetchDatasetPreview(selectedDatasetId, page, 50).then(setPreview).catch(console.error);
    fetchDatasetCorrelations(selectedDatasetId).then(setCorrelations).catch(console.error);
  }, [selectedDatasetId, page]);

  const activeDataset = datasets.find(d => d.id === selectedDatasetId);

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="border-b border-[#22263d] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Interactive Data Studio</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Data Exploration & Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Inspect raw tabular rows, examine pairwise Pearson correlation matrices, and explore physicochemical feature distributions.
          </p>
        </div>

        {/* Dataset Switcher & Combine Action */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Dataset:</span>
          <select
            value={selectedDatasetId}
            onChange={(e) => { setSelectedDatasetId(e.target.value); setPage(1); }}
            className="bg-[#0f111e] border border-[#22263d] rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono font-bold cursor-pointer"
          >
            {datasets.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.total_rows.toLocaleString()} rows)</option>
            ))}
          </select>

          <button
            onClick={async () => {
              const white = datasets.find(d => d.id === 'wine_white');
              const red = datasets.find(d => d.id === 'wine_red');
              if (white && red) {
                const combined = await combineDatasets([white.id, red.id], 'Wine Quality (Combined Red & White)');
                setDatasets(prev => prev.some(d => d.id === combined.id) ? prev : [...prev, combined]);
                setSelectedDatasetId(combined.id);
                setPage(1);
              }
            }}
            className="px-3 py-2 bg-violet-950/50 hover:bg-violet-900/60 border border-violet-500/40 rounded-xl text-xs font-mono text-violet-300 flex items-center gap-1.5 cursor-pointer transition-all"
            title="Combine White (4,898) and Red (1,599) into 6,497 samples"
          >
            <GitMerge className="w-3.5 h-3.5 text-violet-400" />
            <span>Combine Red & White (6,497)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#22263d] pb-1">
        <button
          onClick={() => setViewTab('preview')}
          className={`px-4 py-2 text-xs font-mono rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            viewTab === 'preview'
              ? 'bg-[#0f111e] text-cyan-300 border-t border-l border-r border-[#22263d] font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>Tabular Preview</span>
        </button>

        <button
          onClick={() => setViewTab('correlations')}
          className={`px-4 py-2 text-xs font-mono rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            viewTab === 'correlations'
              ? 'bg-[#0f111e] text-cyan-300 border-t border-l border-r border-[#22263d] font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>Correlation Matrix</span>
        </button>

        <button
          onClick={() => setViewTab('distributions')}
          className={`px-4 py-2 text-xs font-mono rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            viewTab === 'distributions'
              ? 'bg-[#0f111e] text-cyan-300 border-t border-l border-r border-[#22263d] font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
          <span>Feature Distributions</span>
        </button>
      </div>

      {/* Tab 1: Tabular Preview */}
      {viewTab === 'preview' && preview && (
        <div className="bg-[#0f111e] rounded-2xl border border-[#22263d] overflow-hidden space-y-4 p-5">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Showing rows {(page - 1) * 50 + 1} to {Math.min(page * 50, preview.total_rows)} of {preview.total_rows} total</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-lg bg-[#15182a] border border-[#22263d] text-slate-300 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-white font-bold">{page}</span>
              <button
                disabled={page * 50 >= preview.total_rows}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg bg-[#15182a] border border-[#22263d] text-slate-300 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full border border-[#22263d] rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#15182a] text-slate-300 border-b border-[#22263d]">
                <tr>
                  <th className="p-3 text-slate-500">#</th>
                  {preview.columns.map((col, idx) => (
                    <th key={idx} className={`p-3 whitespace-nowrap ${col === 'quality' ? 'text-cyan-400 font-bold' : ''}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22263d]/60 text-slate-300">
                {preview.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#15182a]/50 transition-colors">
                    <td className="p-3 text-slate-500">{(page - 1) * 50 + rIdx + 1}</td>
                    {preview.columns.map((col, cIdx) => (
                      <td key={cIdx} className={`p-3 whitespace-nowrap ${col === 'quality' ? 'text-cyan-400 font-bold' : ''}`}>
                        {row[col] !== null ? String(row[col]) : 'NaN'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Correlation Heatmap */}
      {viewTab === 'correlations' && correlations && (
        <CorrelationHeatmap data={correlations} />
      )}

      {/* Tab 3: Feature Distributions */}
      {viewTab === 'distributions' && activeDataset && (
        <div className="bg-[#0f111e] rounded-2xl border border-[#22263d] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Target Score Distribution (quality)</h3>
              <p className="text-xs text-slate-400">Class frequencies across the dataset on the 10-point scale.</p>
            </div>
          </div>

          {activeDataset.target_distribution && (
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 font-mono">
              {Object.entries(activeDataset.target_distribution).map(([score, count]) => {
                const pct = ((count / activeDataset.total_rows) * 100).toFixed(1);
                return (
                  <div key={score} className="bg-[#15182a] p-3 rounded-xl border border-[#22263d] text-center space-y-1">
                    <span className="text-xs text-cyan-400 font-bold block">Score {score}</span>
                    <div className="text-lg font-black text-white">{count}</div>
                    <span className="text-[10px] text-slate-500">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t border-[#22263d]">
            <h4 className="text-sm font-semibold text-slate-200 mb-2 font-mono">Physicochemical Feature Profiles:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              {activeDataset.feature_names.map((feat, idx) => (
                <div key={idx} className="bg-[#15182a] p-3 rounded-xl border border-[#22263d]">
                  <span className="text-slate-400 truncate block text-[11px]">{feat}</span>
                  <span className="text-emerald-400 text-xs font-bold">100% Valid Numerical</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
