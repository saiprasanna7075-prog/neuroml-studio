import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink
} from 'lucide-react';
import { ExperimentItem } from '../types';
import { fetchExperiments } from '../services/api';

export const ExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<ExperimentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadExps = async () => {
    setLoading(true);
    try {
      const data = await fetchExperiments();
      setExperiments(data.experiments);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExps();
  }, []);

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="border-b border-[#22263d] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" />
            <span>SQLite Run Logs</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Experiment History
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Audit logs of all trained pipelines, hyperparameters, and evaluation metrics persisted locally in SQLite.
          </p>
        </div>

        <button
          onClick={loadExps}
          className="px-4 py-2 rounded-xl bg-[#0f111e] hover:bg-[#15182a] border border-[#22263d] text-slate-300 text-xs font-mono flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Runs</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0f111e] rounded-2xl border border-[#22263d] overflow-hidden">
        {experiments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            No experiments logged yet. Train a model in the Wine AI Studio or Workspace to generate runs.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#15182a] text-slate-400 border-b border-[#22263d]">
                <tr>
                  <th className="p-4">Run ID</th>
                  <th className="p-4">Experiment Name</th>
                  <th className="p-4">Algorithm</th>
                  <th className="p-4">Dataset</th>
                  <th className="p-4">Key Metric</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22263d]/60 text-slate-300">
                {experiments.map((exp) => {
                  const acc = exp.metrics?.accuracy;
                  const r2 = exp.metrics?.r2_score;

                  return (
                    <tr key={exp.id} className="hover:bg-[#15182a]/50 transition-colors">
                      <td className="p-4 font-bold text-cyan-400">#{exp.id}</td>
                      <td className="p-4 text-white font-medium">{exp.name}</td>
                      <td className="p-4 text-violet-300">{exp.algorithm}</td>
                      <td className="p-4 text-slate-400">{exp.dataset_name}</td>
                      <td className="p-4">
                        {acc !== undefined ? (
                          <span className="text-emerald-400 font-bold">Accuracy: {(acc * 100).toFixed(1)}%</span>
                        ) : r2 !== undefined ? (
                          <span className="text-cyan-400 font-bold">R²: {r2.toFixed(3)}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{exp.status}</span>
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(exp.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
