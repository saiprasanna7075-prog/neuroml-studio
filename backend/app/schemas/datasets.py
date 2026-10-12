from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field

class DatasetSummary(BaseModel):
    id: str
    name: str
    filename: str
    total_rows: int
    total_columns: int
    feature_names: List[str]
    suggested_target: Optional[str] = "quality"
    missing_values: Dict[str, int]
    total_missing: int
    duplicate_rows: int
    data_types: Dict[str, str]
    numerical_columns: List[str]
    target_distribution: Optional[Dict[str, int]] = None
    target_stats: Optional[Dict[str, float]] = None
    file_size_bytes: int

class DatasetPreview(BaseModel):
    id: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    total_rows: int
    page: int = 1
    page_size: int = 100

class CorrelationMatrix(BaseModel):
    features: List[str]
    matrix: List[List[float]]

class PreprocessRequest(BaseModel):
    target_column: str = "quality"
    selected_features: Optional[List[str]] = None
    task_type: str = "classification"  # classification or regression
    handle_missing: str = "mean"  # drop, mean, median
    remove_duplicates: bool = False
    test_size: float = 0.3
    random_state: int = 42
    scale_features: bool = False

class PreprocessResponse(BaseModel):
    dataset_id: str
    target_column: str
    task_type: str
    train_samples: int
    test_samples: int
    features: List[str]
    train_test_split_ratio: str
    has_scaling: bool
    removed_duplicates_count: int
    missing_imputed_count: int
    classes: Optional[List[Union[int, str]]] = None

class CombineDatasetRequest(BaseModel):
    dataset_ids: List[str]
    name: Optional[str] = None

