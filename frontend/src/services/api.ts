import {
  DatasetSummary,
  DatasetPreview,
  CorrelationData,
  ModelMetricsResponse,
  PredictResponse,
  ExplainResponse,
  ModelComparisonResponse,
  ExperimentItem
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function fetchDatasets(): Promise<DatasetSummary[]> {
  const res = await fetch(`${API_BASE}/datasets`);
  if (!res.ok) throw new Error('Failed to load datasets');
  return res.json();
}

export async function combineDatasets(datasetIds: string[], name?: string): Promise<DatasetSummary> {
  const res = await fetch(`${API_BASE}/datasets/combine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_ids: datasetIds, name })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to combine datasets' }));
    throw new Error(err.detail || 'Failed to combine datasets');
  }
  return res.json();
}


export async function uploadDataset(file: File, name?: string): Promise<DatasetSummary> {
  const formData = new FormData();
  formData.append('file', file);
  if (name) formData.append('name', name);
  
  const res = await fetch(`${API_BASE}/datasets/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function fetchDatasetSummary(datasetId: string): Promise<DatasetSummary> {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}/summary`);
  if (!res.ok) throw new Error('Failed to load dataset summary');
  return res.json();
}

export async function fetchDatasetPreview(datasetId: string, page = 1, pageSize = 50): Promise<DatasetPreview> {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}/preview?page=${page}&page_size=${pageSize}`);
  if (!res.ok) throw new Error('Failed to load dataset preview');
  return res.json();
}

export async function fetchDatasetCorrelations(datasetId: string): Promise<CorrelationData> {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}/correlations`);
  if (!res.ok) throw new Error('Failed to load correlation matrix');
  return res.json();
}

export async function trainModel(payload: {
  dataset_id: string;
  algorithm: string;
  task_type?: string;
  target_column?: string;
  selected_features?: string[];
  test_size?: number;
  random_state?: number;
  scale_features?: boolean;
  remove_duplicates?: boolean;
  hyperparameters?: Record<string, any>;
  experiment_name?: string;
}): Promise<ModelMetricsResponse> {
  const res = await fetch(`${API_BASE}/models/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Training failed' }));
    throw new Error(err.detail || 'Training failed');
  }
  return res.json();
}

export async function predictModel(modelId: string, features: Record<string, number>): Promise<PredictResponse> {
  const res = await fetch(`${API_BASE}/models/${modelId}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_id: modelId, features })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Prediction failed' }));
    throw new Error(err.detail || 'Prediction failed');
  }
  return res.json();
}

export async function explainModel(modelId: string, sampleIndex = 0, customFeatures?: Record<string, number>): Promise<ExplainResponse> {
  const res = await fetch(`${API_BASE}/models/${modelId}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model_id: modelId,
      sample_index: sampleIndex,
      custom_features: customFeatures
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'SHAP explanation failed' }));
    throw new Error(err.detail || 'SHAP explanation failed');
  }
  return res.json();
}

export async function compareModels(modelIds: string[]): Promise<ModelComparisonResponse> {
  const res = await fetch(`${API_BASE}/models/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_ids: modelIds })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Comparison failed' }));
    throw new Error(err.detail || 'Comparison failed');
  }
  return res.json();
}

export async function fetchModelMetrics(modelId: string): Promise<ModelMetricsResponse> {
  const res = await fetch(`${API_BASE}/models/${modelId}/metrics`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch model metrics' }));
    throw new Error(err.detail || 'Failed to fetch model metrics');
  }
  return res.json();
}

export async function fetchExperiments(): Promise<{ experiments: ExperimentItem[]; total: number }> {
  const res = await fetch(`${API_BASE}/experiments`);
  if (!res.ok) throw new Error('Failed to load experiments');
  return res.json();
}

