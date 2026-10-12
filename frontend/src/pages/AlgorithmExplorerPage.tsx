import React, { useState } from 'react';
import { Box, Layers, Play, Info } from 'lucide-react';
import { KNNSpaceVisualizer } from '../components/3d/KNNSpaceVisualizer';
import { RandomForest3DVisualizer } from '../components/3d/RandomForest3DVisualizer';
import { NeuralNetworkVisualizer } from '../components/3d/NeuralNetworkVisualizer';
import { KMeansClusterVisualizer } from '../components/3d/KMeansClusterVisualizer';

export const AlgorithmExplorerPage: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<'knn' | 'rf' | 'nn' | 'kmeans'>('knn');

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#22263d] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">
          <Box className="w-3.5 h-3.5" />
          <span>Interactive 3D Visual Laboratory</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          Algorithm Explorer
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Interact with three-dimensional representations of machine learning models in geometric feature spaces.
        </p>
      </div>

      {/* Algorithm View Switcher Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0f111e] p-2 rounded-2xl border border-[#22263d]">
        <button
          onClick={() => setSelectedAlgo('knn')}
          className={`py-3 px-4 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
            selectedAlgo === 'knn'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#15182a]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>KNN Feature Space</span>
        </button>

        <button
          onClick={() => setSelectedAlgo('rf')}
          className={`py-3 px-4 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
            selectedAlgo === 'rf'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#15182a]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          <span>Random Forest 3D</span>
        </button>

        <button
          onClick={() => setSelectedAlgo('nn')}
          className={`py-3 px-4 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
            selectedAlgo === 'nn'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#15182a]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span>Deep Neural Network</span>
        </button>

        <button
          onClick={() => setSelectedAlgo('kmeans')}
          className={`py-3 px-4 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
            selectedAlgo === 'kmeans'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#15182a]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>K-Means Clustering</span>
        </button>
      </div>

      {/* Render 3D Visualizer */}
      <div className="w-full">
        {selectedAlgo === 'knn' && <KNNSpaceVisualizer />}
        {selectedAlgo === 'rf' && <RandomForest3DVisualizer />}
        {selectedAlgo === 'nn' && <NeuralNetworkVisualizer />}
        {selectedAlgo === 'kmeans' && <KMeansClusterVisualizer />}
      </div>
    </div>
  );
};
