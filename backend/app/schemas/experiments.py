from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ExperimentItem(BaseModel):
    id: str
    name: str
    algorithm: str
    dataset_name: str
    task_type: str
    target_column: str
    hyperparameters: Dict[str, Any]
    metrics: Dict[str, Any]
    status: str
    created_at: str
    model_artifact_path: Optional[str] = None

class ExperimentListResponse(BaseModel):
    experiments: List[ExperimentItem]
    total: int
