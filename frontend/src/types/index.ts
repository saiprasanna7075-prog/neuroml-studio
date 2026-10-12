export interface DatasetSummary {
  id: string;
  name: string;
  filename: string;
  total_rows: number;
  total_columns: number;
  feature_names: string[];
  suggested_target: string;
  missing_values: Record<string, number>;
  total_missing: number;
  duplicate_rows: number;
  data_types: Record<string, string>;
  numerical_columns: string[];
  target_distribution?: Record<string, number>;
  target_stats?: {
    min: number;
    max: number;
    mean: number;
    std: number;
  };
  file_size_bytes: number;
}

export interface DatasetPreview {
  id: string;
  columns: string[];
  rows: Record<string, any>[];
  total_rows: number;
  page: number;
  page_size: number;
}

export interface CorrelationData {
  features: string[];
  matrix: number[][];
}

export interface ClassificationMetrics {
  accuracy: number;
  precision_macro: number;
  recall_macro: number;
  f1_macro: number;
  precision_weighted: number;
  recall_weighted: number;
  f1_weighted: number;
  confusion_matrix: number[][];
  labels: (number | string)[];
  class_report: Record<string, any>;
}

export interface RegressionMetrics {
  mae: number;
  mse: number;
  rmse: number;
  r2_score: number;
  explained_variance: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface ActualVsPredictedItem {
  sample_index: number;
  actual: number | string;
  predicted: number | string;
  error?: number;
}

export interface ModelMetricsResponse {
  model_id: string;
  experiment_id: string;
  algorithm: string;
  algorithm_name: string;
  task_type: string;
  dataset_id: string;
  dataset_name: string;
  target_column: string;
  features: string[];
  train_samples: number;
  test_samples: number;
  test_size: number;
  random_state: number;
  scaling_applied: boolean;
  training_time_ms: number;
  classification_metrics?: ClassificationMetrics;
  regression_metrics?: RegressionMetrics;
  feature_importances?: FeatureImportanceItem[];
  actual_vs_predicted: ActualVsPredictedItem[];
  hyperparameters: Record<string, any>;
  created_at: string;
}

export interface PredictResponse {
  model_id: string;
  algorithm: string;
  task_type: string;
  prediction: number | string;
  probabilities?: Record<string, number>;
  input_values: Record<string, number>;
  explanation?: string;
}

export interface LocalFeatureContribution {
  feature: string;
  feature_value: number;
  shap_value: number;
  direction: 'positive' | 'negative';
}

export interface LocalExplanation {
  sample_index?: number;
  actual_value?: number | string;
  predicted_value: number | string;
  base_value: number;
  contributions: LocalFeatureContribution[];
  total_shap_sum: number;
}

export interface GlobalShapItem {
  feature: string;
  mean_abs_shap: number;
  rank: number;
}

export interface BeeswarmPoint {
  feature: string;
  feature_value: number;
  normalized_value: number;
  shap_value: number;
}

export interface ExplainResponse {
  model_id: string;
  algorithm: string;
  task_type: string;
  base_value: number;
  global_importance: GlobalShapItem[];
  beeswarm_sample: BeeswarmPoint[];
  local_explanation?: LocalExplanation;
  explained_class?: number | string;
  message?: string;
}

export interface ModelComparisonResponse {
  task_type: string;
  models: ModelMetricsResponse[];
  winning_model: Record<string, any>;
  comparison_summary: string;
}

export interface ExperimentItem {
  id: string;
  name: string;
  algorithm: string;
  dataset_name: string;
  task_type: string;
  target_column: string;
  hyperparameters: Record<string, any>;
  metrics: Record<string, any>;
  status: string;
  created_at: string;
}
