from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field

class ClassificationMetrics(BaseModel):
    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float
    precision_weighted: float
    recall_weighted: float
    f1_weighted: float
    confusion_matrix: List[List[int]]
    labels: List[Union[int, str]]
    class_report: Dict[str, Any]

class RegressionMetrics(BaseModel):
    mae: float
    mse: float
    rmse: float
    r2_score: float
    explained_variance: float

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float

class ActualVsPredictedItem(BaseModel):
    sample_index: int
    actual: Union[float, int, str]
    predicted: Union[float, int, str]
    error: Optional[float] = None

class TrainModelRequest(BaseModel):
    dataset_id: str
    algorithm: str  # random_forest, knn, decision_tree, logistic_regression, linear_regression, svm, gradient_boosting
    task_type: str = "classification"  # classification, regression
    target_column: str = "quality"
    selected_features: Optional[List[str]] = None
    test_size: float = 0.3
    random_state: int = 42
    scale_features: Optional[bool] = None  # None = auto (e.g. True for KNN/SVM, False for RF)
    remove_duplicates: bool = False
    hyperparameters: Dict[str, Any] = Field(default_factory=dict)
    experiment_name: Optional[str] = None
    classification_mode: Optional[str] = "multiclass"  # "multiclass" or "binary"

class ModelMetricsResponse(BaseModel):
    model_id: str
    experiment_id: str
    algorithm: str
    algorithm_name: str
    task_type: str
    dataset_id: str
    dataset_name: str
    target_column: str
    features: List[str]
    train_samples: int
    test_samples: int
    test_size: float
    random_state: int
    scaling_applied: bool
    training_time_ms: float
    classification_metrics: Optional[ClassificationMetrics] = None
    regression_metrics: Optional[RegressionMetrics] = None
    feature_importances: Optional[List[FeatureImportanceItem]] = None
    actual_vs_predicted: List[ActualVsPredictedItem] = Field(default_factory=list)
    hyperparameters: Dict[str, Any] = Field(default_factory=dict)
    created_at: str

class PredictRequest(BaseModel):
    model_id: str
    features: Dict[str, float]

class PredictResponse(BaseModel):
    model_id: str
    algorithm: str
    task_type: str
    prediction: Union[int, float, str]
    probabilities: Optional[Dict[str, float]] = None
    input_values: Dict[str, float]
    explanation: Optional[str] = None

class LocalFeatureContribution(BaseModel):
    feature: str
    feature_value: float
    shap_value: float
    direction: str  # positive (pushes higher) or negative (pushes lower)

class LocalExplanation(BaseModel):
    sample_index: Optional[int] = None
    actual_value: Optional[Union[float, int, str]] = None
    predicted_value: Union[float, int, str]
    base_value: float
    contributions: List[LocalFeatureContribution]
    total_shap_sum: float

class GlobalShapItem(BaseModel):
    feature: str
    mean_abs_shap: float
    rank: int

class BeeswarmPoint(BaseModel):
    feature: str
    feature_value: float
    normalized_value: float  # 0 to 1 for color scale
    shap_value: float

class ExplainRequest(BaseModel):
    model_id: str
    sample_index: Optional[int] = None
    custom_features: Optional[Dict[str, float]] = None
    max_display_features: int = 11

class ExplainResponse(BaseModel):
    model_id: str
    algorithm: str
    task_type: str
    base_value: float
    global_importance: List[GlobalShapItem]
    beeswarm_sample: List[BeeswarmPoint]
    local_explanation: Optional[LocalExplanation] = None
    explained_class: Optional[Union[int, str]] = None
    message: Optional[str] = None

class ModelComparisonRequest(BaseModel):
    model_ids: List[str]

class ModelComparisonResponse(BaseModel):
    task_type: str
    models: List[ModelMetricsResponse]
    winning_model: Dict[str, Any]
    comparison_summary: str
