import React, { useState } from 'react';
import {
  FolderUp,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart2,
  Download,
  Settings2,
  Sparkles
} from 'lucide-react';
import { DatasetSummary, ModelMetricsResponse } from '../types';
import { uploadDataset, trainModel } from '../services/api';
import { ConfusionMatrixChart } from '../components/charts/ConfusionMatrixChart';
import { FeatureImportanceChart } from '../components/charts/FeatureImportanceChart';
import { ResidualPlot } from '../components/charts/ResidualPlot';

export const CustomWorkspacePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState<string>('');
  const [uploadedDataset, setUploadedDataset] = useState<DatasetSummary | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Workflow pipeline options
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [taskType, setTaskType] = useState<'classification' | 'regression'>('classification');
  const [selectedAlgo, setSelectedAlgo] = useState<string>('random_forest');
  const [splitRatio, setSplitRatio] = useState<number>(0.3);
  const [removeDuplicates, setRemoveDuplicates] = useState<boolean>(false);
  const [scaleFeatures, setScaleFeatures] = useState<boolean>(false);

  // Training & Evaluation Results
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainedModel, setTrainedModel] = useState<ModelMetricsResponse | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const summary = await uploadDataset(file, datasetName || undefined);
      setUploadedDataset(summary);
      setTargetColumn(summary.suggested_target || summary.feature_names[summary.feature_names.length - 1] || '');
    } catch (e: any) {
      setErrorMsg(e.message || 'CSV upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTrain = async () => {
    if (!uploadedDataset) return;
    setIsTraining(true);
    setErrorMsg(null);
    try {
      const res = await trainModel({
        dataset_id: uploadedDataset.id,
        algorithm: selectedAlgo,
        task_type: taskType,
        target_column: targetColumn,
        test_size: splitRatio,
        random_state: 42,
        scale_features: scaleFeatures,
        remove_duplicates: removeDuplicates,
        hyperparameters: {},
        experiment_name: `${selectedAlgo} on ${uploadedDataset.name}`
      });
      setTrainedModel(res);
    } catch (e: any) {
      setErrorMsg(e.message || 'Model training failed.');
    } finally {
      setIsTraining(false);
    }
  };

  const handleExportJSON = () => {
    if (!trainedModel) return;
    const blob = new Blob([JSON.stringify(trainedModel, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_${trainedModel.model_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="border-b border-[#22263d] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">
          <FolderUp className="w-3.5 h-3.5" />
          <span>General Machine Learning Pipeline</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          Custom Dataset & ML Workspace
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Upload any tabular CSV file. Automatic delimiter detection parses comma or semicolon formatted files with zero configuration.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/50 border border-rose-500/40 p-4 rounded-xl flex items-center gap-3 text-rose-300 text-sm font-mono">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Upload */}
      <div className="bg-[#0f111e] rounded-2xl border border-[#22263d] p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono flex items-center justify-center font-bold">1</span>
          <span>Upload Tabular Dataset (CSV / Plaintext)</span>
        </h3>

        <form onSubmit={handleFileUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Select CSV File:</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-300 bg-[#15182a] border border-[#22263d] rounded-xl file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-violet-600 file:text-white cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Dataset Name (Optional):</label>
            <input
              type="text"
              placeholder="e.g. Custom Chemical Assay"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              className="w-full bg-[#15182a] border border-[#22263d] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={!file || isUploading}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <FolderUp className="w-4 h-4" />
            <span>{isUploading ? 'Parsing Dataset...' : 'Upload & Inspect'}</span>
          </button>
        </form>

        {uploadedDataset && (
          <div className="bg-[#15182a] p-4 rounded-xl border border-emerald-500/40 text-xs font-mono space-y-2 mt-4 text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dataset Parsed Successfully: {uploadedDataset.name}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-400 pt-2 border-t border-[#22263d]">
              <div>Total Rows: <strong className="text-white">{uploadedDataset.total_rows}</strong></div>
              <div>Columns: <strong className="text-white">{uploadedDataset.total_columns}</strong></div>
              <div>Duplicates: <strong className="text-white">{uploadedDataset.duplicate_rows}</strong></div>
              <div>Missing Values: <strong className="text-white">{uploadedDataset.total_missing}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Configure Preprocessing & Algorithm */}
      {uploadedDataset && (
        <div className="bg-[#0f111e] rounded-2xl border border-[#22263d] p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-mono flex items-center justify-center font-bold">2</span>
            <span>Configure Pipeline & Select Algorithm</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Target Column:</label>
              <select
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
                className="w-full bg-[#15182a] border border-[#22263d] rounded-xl px-3 py-2 text-cyan-300 cursor-pointer font-bold"
              >
                {uploadedDataset.feature_names.concat([uploadedDataset.suggested_target || '']).map((col, idx) => (
                  col ? <option key={idx} value={col}>{col}</option> : null
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Learning Task:</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as any)}
                className="w-full bg-[#15182a] border border-[#22263d] rounded-xl px-3 py-2 text-slate-200 cursor-pointer"
              >
                <option value="classification">Classification (Categories)</option>
                <option value="regression">Regression (Continuous)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Algorithm:</label>
              <select
                value={selectedAlgo}
                onChange={(e) => setSelectedAlgo(e.target.value)}
                className="w-full bg-[#15182a] border border-[#22263d] rounded-xl px-3 py-2 text-violet-300 cursor-pointer font-bold"
              >
                <optgroup label="── A. REGRESSION MODELS ──">
                  <option value="linear_regression">1. Linear Regression</option>
                  <option value="multiple_linear_regression">2. Multiple Linear Regression</option>
                  <option value="polynomial_regression">3. Polynomial Regression</option>
                  <option value="ridge_regression">4. Ridge Regression</option>
                  <option value="lasso_regression">5. Lasso Regression</option>
                  <option value="elastic_net_regression">6. Elastic Net Regression</option>
                  <option value="decision_tree_regressor">7. Decision Tree Regressor</option>
                  <option value="random_forest_regressor">8. Random Forest Regressor</option>
                  <option value="gradient_boosting_regressor">9. Gradient Boosting Regressor</option>
                  <option value="xgboost_regressor">10. XGBoost Regressor</option>
                  <option value="lightgbm_regressor">11. LightGBM Regressor</option>
                  <option value="catboost_regressor">12. CatBoost Regressor</option>
                  <option value="svr">13. Support Vector Regression (SVR)</option>
                  <option value="knn_regressor">14. KNN Regressor</option>
                  <option value="bayesian_regression">15. Bayesian Regression</option>
                  <option value="gaussian_process_regression">16. Gaussian Process Regression</option>
                </optgroup>
                <optgroup label="── B. CLASSIFICATION MODELS ──">
                  <option value="logistic_regression">1. Logistic Regression</option>
                  <option value="knn">2. K-Nearest Neighbors (KNN)</option>
                  <option value="decision_tree">3. Decision Tree Classifier</option>
                  <option value="random_forest">4. Random Forest Classifier</option>
                  <option value="svm">5. Support Vector Machine (SVM)</option>
                  <option value="naive_bayes">6. Naive Bayes</option>
                  <option value="gaussian_naive_bayes">7. Gaussian Naive Bayes</option>
                  <option value="multinomial_naive_bayes">8. Multinomial Naive Bayes</option>
                  <option value="bernoulli_naive_bayes">9. Bernoulli Naive Bayes</option>
                  <option value="gradient_boosting">10. Gradient Boosting Classifier</option>
                  <option value="adaboost">11. AdaBoost</option>
                  <option value="xgboost">12. XGBoost Classifier</option>
                  <option value="lightgbm">13. LightGBM Classifier</option>
                  <option value="catboost">14. CatBoost Classifier</option>
                  <option value="extra_trees">15. Extra Trees Classifier</option>
                  <option value="lda">16. Linear Discriminant Analysis (LDA)</option>
                  <option value="qda">17. Quadratic Discriminant Analysis (QDA)</option>
                  <option value="perceptron">18. Perceptron</option>
                  <option value="passive_aggressive">19. Passive-Aggressive Classifier</option>
                  <option value="sgd">20. SGD Classifier</option>
                  <option value="mlp">21. MLP Classifier</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Train/Test Split:</label>
              <select
                value={splitRatio}
                onChange={(e) => setSplitRatio(Number(e.target.value))}
                className="w-full bg-[#15182a] border border-[#22263d] rounded-xl px-3 py-2 text-slate-200 cursor-pointer"
              >
                <option value={0.3}>70% Train / 30% Test (Standard)</option>
                <option value={0.2}>80% Train / 20% Test</option>
                <option value={0.25}>75% Train / 25% Test</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scaleFeatures}
                onChange={(e) => setScaleFeatures(e.target.checked)}
                className="accent-cyan-400 rounded cursor-pointer"
              />
              <span>StandardScaler (Leak-free on Train only)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="accent-violet-500 rounded cursor-pointer"
              />
              <span>Drop Duplicate Rows</span>
            </label>
          </div>

          <button
            onClick={handleTrain}
            disabled={isTraining || !targetColumn}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 cursor-pointer disabled:opacity-40"
          >
            <Play className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} />
            <span>{isTraining ? 'Training Model...' : 'Train Model Pipeline'}</span>
          </button>
        </div>
      )}

      {/* Step 3: Evaluation Results & Export */}
      {trainedModel && (
        <div className="bg-[#0f111e] rounded-2xl border border-[#22263d] p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-[#22263d] pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Training Complete</span>
              <h3 className="text-xl font-bold text-white mt-0.5">{trainedModel.algorithm_name} Evaluation</h3>
            </div>

            <button
              onClick={handleExportJSON}
              className="px-4 py-2 rounded-xl bg-[#15182a] hover:bg-[#1d223a] border border-[#22263d] text-cyan-300 text-xs font-mono flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Artifacts (JSON)</span>
            </button>
          </div>

          {/* Metrics summary */}
          {trainedModel.classification_metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-[#15182a] p-3 rounded-xl border border-[#22263d]">
                <span className="text-slate-400 block">Accuracy:</span>
                <strong className="text-cyan-400 text-xl font-black">
                  {(trainedModel.classification_metrics.accuracy * 100).toFixed(2)}%
                </strong>
              </div>
              <div className="bg-[#15182a] p-3 rounded-xl border border-[#22263d]">
                <span className="text-slate-400 block">F1 Macro:</span>
                <strong className="text-violet-400 text-xl font-black">
                  {trainedModel.classification_metrics.f1_macro.toFixed(3)}
                </strong>
              </div>
              <div className="bg-[#15182a] p-3 rounded-xl border border-[#22263d]">
                <span className="text-slate-400 block">Precision (W):</span>
                <strong className="text-emerald-400 text-xl font-black">
                  {(trainedModel.classification_metrics.precision_weighted * 100).toFixed(1)}%
                </strong>
              </div>
              <div className="bg-[#15182a] p-3 rounded-xl border border-[#22263d]">
                <span className="text-slate-400 block">Recall (W):</span>
                <strong className="text-rose-400 text-xl font-black">
                  {(trainedModel.classification_metrics.recall_weighted * 100).toFixed(1)}%
                </strong>
              </div>
            </div>
          )}

          {trainedModel.classification_metrics && (
            <ConfusionMatrixChart
              matrix={trainedModel.classification_metrics.confusion_matrix}
              labels={trainedModel.classification_metrics.labels}
            />
          )}

          {trainedModel.feature_importances && (
            <FeatureImportanceChart importances={trainedModel.feature_importances} />
          )}
        </div>
      )}
    </div>
  );
};
